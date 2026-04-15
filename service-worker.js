// service-worker.js

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
});

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.');
  if (!event.data) {
    console.log('[Service Worker] Push event but no data');
    return;
  }
  
  const data = event.data.json();
  const title = data.title || 'AgendaVisual';
  const options = {
    body: data.body || 'Você tem uma nova notificação.',
    icon: 'https://cdn-icons-png.flaticon.com/512/3049/3049518.png',
    badge: 'https://cdn-icons-png.flaticon.com/512/3049/3049518.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();

  // Foca na janela do app se estiver aberta, ou abre uma nova
  event.waitUntil(
    clients.matchAll({
      type: "window"
    }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/#agendamentos');
      }
    })
  );
});
