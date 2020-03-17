importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js');

workbox.core.skipWaiting();
workbox.core.clientsClaim();

workbox.routing.registerRoute(
  new RegExp('https://hacker-news.firebaseio.com'),
  new workbox.strategies.StaleWhileRevalidate()
);

self.addEventListener('push', (event) => {
    const push = JSON.parse(event.data.text());
    const title = `New Message from ${push.username}`;
    const options = {
        body: push.message,
        icon: 'assets/icon/shorts-180.png',
        badge: 'assets/icon/shorts-180.png',
        image: 'assets/icon/shorts-180.png',
        data: push.url,
    };
    
    event.waitUntil(
      clients.matchAll({
          includeUncontrolled: true
      }).then(c => {
          if (c.length === 0) {
              self.registration.showNotification(title, options)
          } else {
              const client = c.find(c => { 
                  return c.visibilityState === "visible"
                });
              if (client !== undefined) {
                  console.log('on application');
              } else {
                  self.registration.showNotification(title, options)
              }
          }
      })
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');
  const urlToOpen = new URL(self.location.origin).href;
  const promiseChain = clients.matchAll({
      type: 'window',
      includeUncontrolled: true
  }).then((windowClients) => {
      let matchingClient = null;

      for (let i = 0; i < windowClients.length; i++) {
          const windowClient = windowClients[i];
          if (windowClient.url.includes(urlToOpen)) {
            matchingClient = windowClient;
            break;
          }
      }

      if (matchingClient) {
          return matchingClient.focus();
      } else {
          return clients.openWindow(urlToOpen);
      }
  });

  event.waitUntil(promiseChain);
  event.notification.close();
});

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);