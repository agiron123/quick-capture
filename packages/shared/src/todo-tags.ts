export const MAX_TODO_TAGS = 20;
export const MAX_TAG_LENGTH = 40;

export function normalizeTodoTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of tags) {
    const normalized = tag.trim().toLowerCase();
    if (!normalized || normalized.length > MAX_TAG_LENGTH) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
    if (result.length >= MAX_TODO_TAGS) break;
  }

  return result.sort();
}

export function todoTagsEqual(a?: string[], b?: string[]): boolean {
  return normalizeTodoTags(a ?? []).join('\0') === normalizeTodoTags(b ?? []).join('\0');
}
