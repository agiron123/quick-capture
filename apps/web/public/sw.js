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
  const url = todoId ? `/?highlight=${encodeURIComponent(todoId)}` : '/';

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
