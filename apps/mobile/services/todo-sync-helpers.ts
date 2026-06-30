import type { Todo } from '@quick-capture/shared';
import { todoTagsEqual } from '@quick-capture/shared';

type SyncList = { id: string; name: string };

export function buildListIdMap(localLists: SyncList[], serverLists: SyncList[]): Map<string, string> {
  const map = new Map<string, string>();
  const serverByName = new Map(serverLists.map((list) => [list.name, list.id]));

  for (const list of localLists) {
    if (serverLists.some((serverList) => serverList.id === list.id)) {
      map.set(list.id, list.id);
      continue;
    }

    const matchedByName = serverByName.get(list.name);
    if (matchedByName) {
      map.set(list.id, matchedByName);
      continue;
    }

    map.set(list.id, list.id);
  }

  return map;
}

export function localTodoDiffers(local: Todo, server: Todo, mappedListId: string): boolean {
  return (
    local.title !== server.title ||
    local.completed !== server.completed ||
    (local.dueAt ?? null) !== (server.dueAt ?? null) ||
    (local.priority ?? null) !== (server.priority ?? null) ||
    !todoTagsEqual(local.tags, server.tags) ||
    (local.reminderAt ?? null) !== (server.reminderAt ?? null) ||
    mappedListId !== server.listId ||
    local.sortOrder !== server.sortOrder
  );
}
