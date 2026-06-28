self.addEventListener('push', (event) => {
  let payload = { title: 'Todo reminder', body: '', data: {} };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      data: payload.data,
      tag: payload.data?.todoId ?? 'todo-reminder',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const todoId = event.notification.data?.todoId;
  const listId = event.notification.data?.listId;
  const params = new URLSearchParams();
  if (todoId) params.set('highlight', todoId);
  if (listId) params.set('listId', listId);
  const url = params.toString() ? `/?${params.toString()}` : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
