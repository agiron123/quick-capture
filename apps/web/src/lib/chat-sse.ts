import type { ChatStreamEvent } from '@quick-capture/shared';

export function parseSseEvents(chunk: string, onEvent: (event: ChatStreamEvent) => void): void {
  const lines = chunk.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data:')) continue;
    const payload = trimmed.slice('data:'.length).trim();
    if (!payload) continue;
    try {
      onEvent(JSON.parse(payload) as ChatStreamEvent);
    } catch {
      // ignore malformed events
    }
  }
}

export function parseSseBuffer(buffer: string): {
  events: ChatStreamEvent[];
  remainder: string;
} {
  const events: ChatStreamEvent[] = [];
  const parts = buffer.split('\n\n');
  const remainder = parts.pop() ?? '';

  for (const part of parts) {
    parseSseEvents(part, (event) => events.push(event));
  }

  return { events, remainder };
}
