#!/usr/bin/env node

import { readRegistry } from './lib.mjs';

const registry = readRegistry();

if (registry.worktrees.length === 0) {
  console.log('No registered worktrees.');
  console.log('Bootstrap a linked worktree: npm run worktree:bootstrap');
  process.exit(0);
}

console.log('');
console.log('Registered worktrees');
console.log('─'.repeat(72));

for (const entry of registry.worktrees) {
  console.log(`${entry.slug}`);
  console.log(`  Branch:   ${entry.branch}`);
  console.log(`  Path:     ${entry.path}`);
  console.log(`  Neon:     ${entry.neonBranchName}`);
  console.log(`  Compose:  ${entry.composeProject}`);
  console.log(
    `  Ports:    API ${entry.ports.api} | Web ${entry.ports.web} | Whisper ${entry.ports.whisper}`
  );
  console.log(`  Web URL:  ${entry.urls.web}`);
  console.log(`  API URL:  ${entry.urls.api}`);
  console.log('');
}
