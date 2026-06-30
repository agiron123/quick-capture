import { describe, expect, it } from 'vitest';
import type { ChatStreamEvent } from '@quick-capture/shared';

import { parseSseBuffer, parseSseEvents } from './chat-sse';

describe('parseSseEvents', () => {
  it('parses data lines into stream events', () => {
    const events: ChatStreamEvent[] = [];
    parseSseEvents('data: {"type":"done"}\n', (event) => events.push(event));
    expect(events).toEqual([{ type: 'done' }]);
  });

  it('ignores malformed JSON', () => {
    const events: ChatStreamEvent[] = [];
    parseSseEvents('data: not-json\n', (event) => events.push(event));
    expect(events).toHaveLength(0);
  });
});

describe('parseSseBuffer', () => {
  it('splits buffered SSE chunks and keeps remainder', () => {
    const chunk = 'data: {"type":"text-delta","delta":"Hi"}\n\ndata: {"type":"done"}\n\npartial';
    const parsed = parseSseBuffer(chunk);
    expect(parsed.events).toEqual([
      { type: 'text-delta', delta: 'Hi' },
      { type: 'done' },
    ]);
    expect(parsed.remainder).toBe('partial');
  });
});
