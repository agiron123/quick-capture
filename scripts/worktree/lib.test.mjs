import { describe, expect, it } from 'vitest';

import {
  branchToSlug,
  defaultPortBlockIndex,
  defaultPortsForSlug,
  portsForBlockIndex,
  slugToComposeProject,
} from './lib.mjs';

describe('worktree lib', () => {
  it('converts branch names to URL-safe slugs', () => {
    expect(branchToSlug('feat/chat')).toBe('feat-chat');
    expect(branchToSlug('Fix/Sync!!!')).toBe('fix-sync');
  });

  it('derives stable port blocks from slug', () => {
    const index = defaultPortBlockIndex('feat-chat');
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(50);
    expect(defaultPortsForSlug('feat-chat')).toEqual(portsForBlockIndex(index));
  });

  it('offsets API, web, and whisper ports within a block', () => {
    const ports = portsForBlockIndex(3);
    expect(ports).toEqual({ api: 3030, web: 3031, whisper: 3032 });
  });

  it('builds compose project names from slug', () => {
    expect(slugToComposeProject('feat-chat')).toBe('qc-feat-chat');
  });
});
