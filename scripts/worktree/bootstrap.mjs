#!/usr/bin/env node

import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';

import {
    allocatePorts,
    branchToSlug,
    buildCorsOrigins,
    buildWorktreeUrls,
    commandExists,
    dockerCompose,
    getBranchName,
    getRegistryEntry,
    getRepoRoot,
    isLinkedWorktree,
    parseEnvFile,
    printWorktreeSummary,
    readRegistry,
    reservedPortsFromRegistry,
    runNeonctl,
    serializeEnvFile,
    slugToComposeProject,
    writeRegistry,
} from './lib.mjs';

function parseArgs(argv) {
  return {
    manual: argv.includes('--manual'),
    force: argv.includes('--force'),
    noPortless: argv.includes('--no-portless'),
    parent: argv.find((arg, index) => argv[index - 1] === '--parent') ?? process.env.NEON_PARENT_BRANCH ?? 'dev',
    databaseUrl: argv.find((arg, index) => argv[index - 1] === '--database-url'),
    authUrl: argv.find((arg, index) => argv[index - 1] === '--neon-auth-url'),
  };
}

async function prompt(question) {
  const rl = createInterface({ input, output });
  const answer = await rl.question(question);
  await rl.close();
  return answer.trim();
}

async function resolveNeonCredentials(slug, options) {
  let databaseUrl = options.databaseUrl ?? process.env.WORKTREE_DATABASE_URL;
  let authUrl = options.authUrl ?? process.env.WORKTREE_NEON_AUTH_URL;

  if (commandExists('neonctl') && !options.manual) {
    console.log(`Creating Neon branch "${slug}" (parent: ${options.parent})…`);
    const create = runNeonctl(
      ['branches', 'create', '--name', slug, '--parent', options.parent, '--output', 'json'],
      process.cwd()
    );
    if (create.status !== 0 && !/already exists/i.test(create.stderr + create.stdout)) {
      console.warn('neonctl branches create:', create.stderr || create.stdout);
    }

    if (!databaseUrl) {
      const conn = runNeonctl(['connection-string', slug, '--pooled'], process.cwd());
      if (conn.status === 0) {
        databaseUrl = conn.stdout.trim();
      }
    }
  }

  if (!databaseUrl) {
    console.log('');
    console.log('Neon branch connection string required.');
    console.log(`Console: Branches → ${slug} → Connection details`);
    databaseUrl = await prompt('DATABASE_URL: ');
  }

  if (!authUrl) {
    console.log('');
    console.log('Neon Auth URL for this branch required (must match DATABASE_URL branch).');
    console.log(`Console: Branches → ${slug} → Auth`);
    authUrl = await prompt('NEON_AUTH_URL: ');
  }

  if (!databaseUrl || !authUrl) {
    throw new Error('DATABASE_URL and NEON_AUTH_URL are required');
  }

  return { databaseUrl, authUrl };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const repoRoot = getRepoRoot();
  const cwd = process.cwd();

  if (!isLinkedWorktree(cwd)) {
    console.error('worktree:bootstrap is for linked git worktrees only.');
    console.error('In the main checkout, use: npm run docker:dev');
    process.exit(1);
  }

  const envPath = join(repoRoot, '.env');
  if (!existsSync(envPath)) {
    console.error('Missing .env — copy .env.example and add shared secrets first.');
    process.exit(1);
  }

  const branch = getBranchName(cwd);
  const slug = branchToSlug(branch);
  const registry = readRegistry();
  const existing = getRegistryEntry(registry, cwd);

  if (existing && !options.force) {
    console.log(`Worktree already bootstrapped (${existing.slug}).`);
    printWorktreeSummary(existing);
    console.log('Re-bootstrap: npm run worktree:bootstrap -- --force');
    return;
  }

  const reserved = reservedPortsFromRegistry(registry, options.force ? cwd : null);
  const { ports } = await allocatePorts(slug, reserved);
  const usePortless = !options.noPortless;
  const urls = buildWorktreeUrls(slug, ports, usePortless);
  const corsOrigins = buildCorsOrigins(urls, ports);

  console.log(`Bootstrapping worktree: ${branch} → ${slug}`);
  const { databaseUrl, authUrl } = await resolveNeonCredentials(slug, options);

  const baseEnv = parseEnvFile(envPath);
  const worktreeEnv = {
    ...baseEnv,
    WORKTREE_SLUG: slug,
    COMPOSE_PROJECT_NAME: slugToComposeProject(slug),
    API_PORT: String(ports.api),
    WEB_PORT: String(ports.web),
    WHISPER_PORT: String(ports.whisper),
    PORT: String(ports.api),
    DATABASE_URL: databaseUrl,
    NEON_AUTH_URL: authUrl,
    NEON_AUTH_BASE_URL: authUrl,
    NEXT_PUBLIC_NEON_AUTH_URL: authUrl,
    EXPO_PUBLIC_NEON_AUTH_URL: authUrl,
    NEXT_PUBLIC_API_URL: urls.api,
    EXPO_PUBLIC_API_URL: urls.api,
    CORS_ORIGINS: corsOrigins,
    TRANSCRIPTION_PROVIDER: baseEnv.TRANSCRIPTION_PROVIDER || 'whisper-cpp',
    WHISPER_CPP_BASE_URL: 'http://whisper:8080',
    WHISPER_CPP_INFERENCE_PATH: baseEnv.WHISPER_CPP_INFERENCE_PATH || '/inference',
  };

  const worktreeEnvPath = join(repoRoot, '.env.worktree');
  writeFileSync(worktreeEnvPath, serializeEnvFile(worktreeEnv), 'utf8');
  console.log(`Wrote ${worktreeEnvPath}`);

  const entry = {
    path: cwd,
    branch,
    slug,
    composeProject: slugToComposeProject(slug),
    neonBranchName: slug,
    ports,
    urls,
    usePortless,
    createdAt: new Date().toISOString(),
  };

  const nextRegistry = {
    worktrees: [
      ...registry.worktrees.filter((item) => item.path.replace(/\/$/, '') !== cwd.replace(/\/$/, '')),
      entry,
    ],
  };
  writeRegistry(nextRegistry);

  console.log('Running migrations…');
  const migrate = dockerCompose(['run', '--rm', 'migrate'], repoRoot);
  if (migrate.status !== 0) {
    console.error('Migration failed. Fix DATABASE_URL and re-run bootstrap.');
    process.exit(migrate.status ?? 1);
  }

  if (usePortless) {
    console.log('');
    console.log('Portless URLs (optional — run `portless trust` once):');
    console.log(`  Web: ${urls.web}`);
    console.log(`  API: ${urls.api}`);
    console.log('Add these origins in Neon Console → Auth → allowed origins.');
  }

  printWorktreeSummary(entry);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
