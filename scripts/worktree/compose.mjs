#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { dockerCompose, getRepoRoot } from './lib.mjs';

function main() {
  const repoRoot = getRepoRoot();
  const envPath = join(repoRoot, '.env.worktree');
  const [command = 'up', ...rest] = process.argv.slice(2);

  if (!existsSync(envPath)) {
    console.error('Missing .env.worktree');
    console.error('In a linked worktree, run: npm run worktree:bootstrap');
    process.exit(1);
  }

  const args =
    command === 'up'
      ? ['up', '--build', ...rest]
      : command === 'down'
        ? ['down', ...rest]
        : [command, ...rest];

  const result = dockerCompose(args, repoRoot);
  process.exit(result.status ?? 0);
}

main();
