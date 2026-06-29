#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { branchToSlug } from './lib.mjs';

function parseArgs(argv) {
  const positional = [];
  let newBranch = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '-b' || arg === '--branch') {
      newBranch = true;
      continue;
    }
    positional.push(arg);
  }

  if (positional.length < 2) {
    throw new Error(
      'Usage: npm run worktree:create -- <path> [-b] <branch>\n' +
        'Examples:\n' +
        '  npm run worktree:create -- ../quick-capture-feat-chat -b feat/chat\n' +
        '  npm run worktree:create -- ../quick-capture-fix fix-sync'
    );
  }

  return {
    targetPath: resolve(positional[0]),
    branch: positional[1],
    newBranch,
  };
}

function runGit(args, cwd) {
  const result = spawnSync('git', args, { cwd, stdio: 'inherit', encoding: 'utf8' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const sourceRoot = resolve(process.cwd());
  const sourceEnv = join(sourceRoot, '.env');

  if (!existsSync(sourceEnv)) {
    console.error('Missing .env in current checkout — copy .env.example and add secrets first.');
    process.exit(1);
  }

  const gitArgs = options.newBranch
    ? ['worktree', 'add', '-b', options.branch, options.targetPath]
    : ['worktree', 'add', options.targetPath, options.branch];

  console.log(`Creating worktree at ${options.targetPath} (${options.branch})…`);
  runGit(gitArgs, sourceRoot);

  const targetEnv = join(options.targetPath, '.env');
  if (!existsSync(targetEnv)) {
    copyFileSync(sourceEnv, targetEnv);
    console.log(`Copied .env → ${targetEnv}`);
  }

  const sourceCerts = join(sourceRoot, 'apps/web/certificates');
  const targetCerts = join(options.targetPath, 'apps/web/certificates');
  if (existsSync(sourceCerts)) {
    mkdirSync(targetCerts, { recursive: true });
    for (const name of ['localhost-key.pem', 'localhost.pem']) {
      const from = join(sourceCerts, name);
      if (existsSync(from)) {
        copyFileSync(from, join(targetCerts, name));
      }
    }
    console.log(`Copied HTTPS certs → ${targetCerts}`);
  }

  console.log('Installing dependencies…');
  const install = spawnSync('npm', ['install'], {
    cwd: options.targetPath,
    stdio: 'inherit',
    encoding: 'utf8',
  });
  if (install.status !== 0) {
    process.exit(install.status ?? 1);
  }

  const slug = branchToSlug(options.branch);
  console.log(`Bootstrapping Docker worktree (${slug})…`);
  const bootstrap = spawnSync(
    'npm',
    ['run', 'worktree:bootstrap', '--', '--parent', process.env.NEON_PARENT_BRANCH ?? 'dev'],
    {
      cwd: options.targetPath,
      stdio: 'inherit',
      encoding: 'utf8',
    }
  );
  if (bootstrap.status !== 0) {
    process.exit(bootstrap.status ?? 1);
  }

  console.log('');
  console.log('Worktree created. Next steps:');
  console.log(`  cd ${options.targetPath}`);
  console.log('  npm run docker:dev:worktree');
}

main();
