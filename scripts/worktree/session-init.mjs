#!/usr/bin/env node

import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
    branchToSlug,
    getBranchName,
    getMainRepoRoot,
    getRegistryEntry,
    isLinkedWorktree,
    readRegistry,
} from './lib.mjs';

function readHookInput() {
  try {
    const raw = readFileSync(0, 'utf8');
    if (!raw.trim()) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function ensureEnvFile(cwd) {
  const envPath = join(cwd, '.env');
  if (existsSync(envPath)) return true;

  const mainEnv = join(getMainRepoRoot(cwd), '.env');
  if (!existsSync(mainEnv)) return false;

  copyFileSync(mainEnv, envPath);
  return true;
}

function main() {
  readHookInput();
  const cwd = process.cwd();
  const bootstrapScript = join(cwd, 'scripts/worktree/bootstrap.mjs');

  if (!existsSync(bootstrapScript)) {
    console.log('{}');
    return;
  }

  if (!isLinkedWorktree(cwd)) {
    console.log('{}');
    return;
  }

  const branch = getBranchName(cwd);
  const slug = branchToSlug(branch);
  const worktreeEnvPath = join(cwd, '.env.worktree');
  const registry = readRegistry();
  const entry = getRegistryEntry(registry, cwd);

  if (entry && existsSync(worktreeEnvPath)) {
    console.log(
      JSON.stringify({
        env: {
          QUICK_CAPTURE_WORKTREE: '1',
          QUICK_CAPTURE_WORKTREE_SLUG: slug,
          QUICK_CAPTURE_WORKTREE_BOOTSTRAPPED: '1',
        },
        additional_context: [
          '## Quick Capture linked worktree',
          '',
          `Branch \`${branch}\` (slug \`${slug}\`) is bootstrapped for parallel Docker dev.`,
          '',
          '- Start stack: `npm run docker:dev:worktree`',
          '- Stop stack: `npm run docker:down:worktree`',
          '- List instances: `npm run worktree:list`',
          '',
          `Web: ${entry.urls.web}`,
          `API: ${entry.urls.api}`,
          '',
          'Do **not** use `npm run docker:dev` in this worktree (fixed ports belong to the main checkout).',
        ].join('\n'),
      })
    );
    return;
  }

  const hasEnv = ensureEnvFile(cwd);

  console.log(
    JSON.stringify({
      env: {
        QUICK_CAPTURE_WORKTREE: '1',
        QUICK_CAPTURE_WORKTREE_SLUG: slug,
        QUICK_CAPTURE_NEEDS_BOOTSTRAP: '1',
      },
      additional_context: [
        '## Quick Capture linked worktree — bootstrap required',
        '',
        `This folder is a **linked git worktree** on branch \`${branch}\` (slug \`${slug}\`).`,
        '',
        hasEnv
          ? '`.env` is present (copied from main checkout if it was missing).'
          : '**Missing `.env`** — copy from the main checkout or `.env.example` before bootstrap.',
        '',
        '**Run immediately** (before `docker:dev:worktree`):',
        '',
        '```bash',
        'npm run worktree:bootstrap',
        '```',
        '',
        'That creates a Neon branch, writes `.env.worktree`, allocates ports, and runs migrations.',
        '',
        'Then start the isolated stack:',
        '',
        '```bash',
        'npm run docker:dev:worktree',
        '```',
        '',
        'Creating a **new** worktree from the main checkout instead:',
        '',
        '```bash',
        'npm run worktree:create -- <path> -b <branch>',
        '```',
        '',
        'Spec: `docs/features/worktree-dev.md`',
      ].join('\n'),
    })
  );
}

main();
