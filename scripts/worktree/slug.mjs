#!/usr/bin/env node

import { branchToSlug } from './lib.mjs';

const branch = process.argv[2] ?? process.env.BRANCH;
if (!branch) {
  console.error('Usage: node scripts/worktree/slug.mjs <branch-name>');
  process.exit(1);
}

console.log(branchToSlug(branch));
