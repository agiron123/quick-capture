import { describe, expect, it } from 'vitest';

import { MAX_TAG_LENGTH, MAX_TODO_TAGS, normalizeTodoTags, todoTagsEqual } from './todo-tags';

describe('normalizeTodoTags', () => {
  it('trims, lowercases, dedupes, and sorts tags', () => {
    expect(normalizeTodoTags([' Work ', 'HOME', 'work'])).toEqual(['home', 'work']);
  });

  it('skips empty and over-length tags', () => {
    const longTag = 'a'.repeat(MAX_TAG_LENGTH + 1);
    expect(normalizeTodoTags(['', '  ', longTag, 'ok'])).toEqual(['ok']);
  });

  it('caps at max tag count', () => {
    const tags = Array.from({ length: MAX_TODO_TAGS + 5 }, (_, i) => `tag-${i}`);
    expect(normalizeTodoTags(tags)).toHaveLength(MAX_TODO_TAGS);
  });
});

describe('todoTagsEqual', () => {
  it('compares normalized tag sets', () => {
    expect(todoTagsEqual(['Work'], ['work'])).toBe(true);
    expect(todoTagsEqual(['a'], ['b'])).toBe(false);
    expect(todoTagsEqual(undefined, [])).toBe(true);
  });
});
