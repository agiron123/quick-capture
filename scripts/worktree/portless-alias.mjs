#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import {
  APP_NAME,
  buildWorktreeUrls,
  getRegistryEntry,
  getRepoRoot,
  parseEnvFile,
  readRegistry,
} from './lib.mjs';

function runPortless(args) {
  return spawnSync('npx', ['portless', ...args], {
    stdio: 'inherit',
    env: process.env,
  });
}

function aliasRoute(name, port) {
  console.log(`Registering https://${name}.localhost → localhost:${port}`);
  const result = runPortless(['alias', name, String(port), '--force']);
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function resolveEntry(cwd, repoRoot) {
  const registry = readRegistry();
  const fromRegistry = getRegistryEntry(registry, cwd);
  if (fromRegistry) return fromRegistry;

  const envPath = join(repoRoot, '.env.worktree');
  if (!existsSync(envPath)) {
    return null;
  }

  const env = parseEnvFile(envPath);
  const slug = env.WORKTREE_SLUG;
  if (!slug) return null;

  const ports = {
    api: Number(env.API_PORT),
    web: Number(env.WEB_PORT),
    whisper: Number(env.WHISPER_PORT),
  };

  return {
    slug,
    ports,
    urls: buildWorktreeUrls(slug, ports, true),
    usePortless: true,
  };
}

function main() {
  const repoRoot = getRepoRoot();
  const entry = resolveEntry(process.cwd(), repoRoot);

  if (!entry) {
    console.error('No worktree registry entry or .env.worktree found.');
    console.error('Run: npm run worktree:bootstrap');
    process.exit(1);
  }

  if (entry.usePortless === false) {
    console.error('Worktree was bootstrapped with --no-portless.');
    console.error('Use localhost URLs from: npm run worktree:list');
    process.exit(1);
  }

  console.log('Starting Portless proxy (if not already running)…');
  const proxy = runPortless(['proxy', 'start']);
  if (proxy.status !== 0) {
    process.exit(proxy.status ?? 1);
  }

  const webName = `${entry.slug}.${APP_NAME}`;
  const apiName = `api.${entry.slug}.${APP_NAME}`;

  aliasRoute(webName, entry.ports.web);
  aliasRoute(apiName, entry.ports.api);

  console.log('');
  console.log('Portless routes registered (Docker hybrid mode)');
  console.log(`  Web: ${entry.urls.web}`);
  console.log(`  API: ${entry.urls.api}`);
  console.log('');
  console.log('Ensure the stack is running: npm run docker:dev:worktree');
  console.log('Add the URLs above to Neon Auth allowed origins if sign-in fails.');
}

main();
