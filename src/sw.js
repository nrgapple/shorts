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
    event.waitUntil(self.registration.showNotification(title, options));
});

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);