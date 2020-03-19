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

workbox.precaching.precacheAndRoute([{"revision":"34dfd50aa6c919335fc6a0ec19ba7a99","url":"assets/data/locations.json"},{"revision":"b8fa43fd95d5e3ac8e1757581d3890fb","url":"assets/data/profiles.json"},{"revision":"e7a9cda63caa793e15951de79c4abd94","url":"assets/data/sessions.json"},{"revision":"9f4d221354ea6da39894e4c9a3f8a0af","url":"assets/data/speakers.json"},{"revision":"988be98f12b400c41a22b59b82cfeab6","url":"assets/icon/favicon.png"},{"revision":"f8420244c9acff43d528891ef172fca0","url":"assets/icon/shorts-120.png"},{"revision":"3ef3b7ad0576afe40d002c8ef8a3e8f8","url":"assets/icon/shorts-128.ico"},{"revision":"5de1b0e4b623767c04546a79a3d0ef1a","url":"assets/icon/shorts-16.ico"},{"revision":"658f636936e22fa21591421d823fcdeb","url":"assets/icon/shorts-180.png"},{"revision":"9a29aec6f4ff46f12109156ed4c32ca5","url":"assets/icon/shorts-192.png"},{"revision":"7291869a0dfb576e88416a2230fcdf40","url":"assets/icon/shorts-24.ico"},{"revision":"4882656a0a3718c9c362e3503b4c2fc5","url":"assets/icon/shorts-256.png"},{"revision":"3054d9114184fdcd59adc67d31d77c64","url":"assets/icon/shorts-512.ico"},{"revision":"4b2998c6dc2425aca0f9c8318be3c0b0","url":"assets/icon/shorts-512.png"},{"revision":"edb21be31eff93ff16ba629e1e96fe93","url":"assets/icon/shorts.ico"},{"revision":"5f7d93d6d50310d40bbe6777fb8c66cc","url":"assets/img/appicon.png"},{"revision":"7733cf7a1771aab205ef481d5453b14a","url":"assets/img/appicon.svg"},{"revision":"0639ae9e496bb221173f4241d5c2a844","url":"assets/img/ica-slidebox-img-1.png"},{"revision":"170d2b6c7f7d50ac5a404200ed8990f6","url":"assets/img/ica-slidebox-img-2.png"},{"revision":"d2e95c2bdb390a5ca97bc61d6f0e52d5","url":"assets/img/ica-slidebox-img-3.png"},{"revision":"4fef19a556a09bd301dd53cfd6a9f44b","url":"assets/img/ica-slidebox-img-4.png"},{"revision":"11cb88c054ebde5fd7a1627eef30cdd3","url":"assets/img/ionic-logo-white.svg"},{"revision":"7afcf07d94abae0431070f3cc1fd8796","url":"assets/img/speakers/bear.jpg"},{"revision":"0f44aa77aa9282df1d90312372ede64a","url":"assets/img/speakers/cheetah.jpg"},{"revision":"9d8dd688ccb5bf2457bf1ea0f3026da4","url":"assets/img/speakers/duck.jpg"},{"revision":"e02f334499c99583a180ea5baef6d650","url":"assets/img/speakers/eagle.jpg"},{"revision":"c36c283130463dcc3ef2c9a4beb05dc4","url":"assets/img/speakers/elephant.jpg"},{"revision":"003e0424a9250966c461d6ad9bca2e19","url":"assets/img/speakers/giraffe.jpg"},{"revision":"c986b49aa3cc9eb60e071e03a0af6453","url":"assets/img/speakers/iguana.jpg"},{"revision":"ccbad890114733171e1fe218013d2628","url":"assets/img/speakers/kitten.jpg"},{"revision":"a6a90b1d0daf0c49c639f6519f348756","url":"assets/img/speakers/lion.jpg"},{"revision":"a741edaab4d30d8435741d9b29f91d41","url":"assets/img/speakers/mouse.jpg"},{"revision":"45814e50ef48d0149ef63b2e7e04ae9e","url":"assets/img/speakers/puppy.jpg"},{"revision":"75b39667947e37339156a85408cf1a20","url":"assets/img/speakers/rabbit.jpg"},{"revision":"498665ab83ce3c5558cab83f7be9a0bc","url":"assets/img/speakers/turtle.jpg"},{"revision":"e535ce83da20a4b7719ca3d45195ebd5","url":"assets/shapes.svg"},{"revision":"c92b85a5b907c70211f4ec25e29a8c4a","url":"favicon.ico"},{"revision":"cdee56afaac03e9bf517fa2f932f3429","url":"index.html"},{"revision":"bc3acd81f5e432902dbf7ab57764c6dc","url":"manifest.json"}]);