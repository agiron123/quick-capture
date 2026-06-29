#!/usr/bin/env node

import {
  commandExists,
  dockerCompose,
  getRegistryEntry,
  getRepoRoot,
  readRegistry,
  runNeonctl,
  writeRegistry,
} from './lib.mjs';

function parseArgs(argv) {
  return {
    deleteNeonBranch: argv.includes('--delete-neon-branch'),
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const repoRoot = getRepoRoot();
  const cwd = process.cwd();
  const registry = readRegistry();
  const entry = getRegistryEntry(registry, cwd);

  if (entry) {
    console.log(`Stopping compose project ${entry.composeProject}…`);
    const down = dockerCompose(['down'], repoRoot);
    if (down.status !== 0) {
      process.exit(down.status ?? 1);
    }
  } else {
    console.log('No registry entry for this worktree — running compose down anyway.');
    try {
      dockerCompose(['down'], repoRoot);
    } catch {
      // .env.worktree may be missing
    }
  }

  if (options.deleteNeonBranch && entry) {
    if (commandExists('neonctl')) {
      console.log(`Deleting Neon branch ${entry.neonBranchName}…`);
      runNeonctl(['branches', 'delete', entry.neonBranchName], repoRoot);
    } else {
      console.warn('neonctl not found — delete Neon branch manually in Console.');
    }
  }

  const nextRegistry = {
    worktrees: registry.worktrees.filter(
      (item) => item.path.replace(/\/$/, '') !== cwd.replace(/\/$/, '')
    ),
  };
  writeRegistry(nextRegistry);

  console.log('Worktree teardown complete.');
  if (entry) {
    console.log('(git worktree remove is separate — run from parent repo when ready)');
  }
}

main();
