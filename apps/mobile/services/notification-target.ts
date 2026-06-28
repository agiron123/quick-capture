export type NotificationTarget = {
  todoId: string;
  listId?: string;
};

let pendingTarget: NotificationTarget | null = null;

export function setNotificationTarget(target: NotificationTarget): void {
  pendingTarget = target;
}

export function consumeNotificationTarget(): NotificationTarget | null {
  const target = pendingTarget;
  pendingTarget = null;
  return target;
}
