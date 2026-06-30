export function hasTodoUpdateConflict(
  serverUpdatedAt: string,
  baseUpdatedAt: string | undefined
): boolean {
  return baseUpdatedAt !== undefined && serverUpdatedAt !== baseUpdatedAt;
}
