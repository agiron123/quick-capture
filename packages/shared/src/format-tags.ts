export function formatTagsLabel(tags: string[]): string {
  return tags.map((tag) => `#${tag}`).join(' ');
}
