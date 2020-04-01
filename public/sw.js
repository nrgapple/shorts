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

workbox.precaching.precacheAndRoute([{"revision":"e5100c597cfc1f6b0531ddc2cd02548e","url":"__snapshots__/App.test.tsx.snap"},{"revision":"b761e1f7c13efb2f17f237bf3392a39f","url":"App.test.tsx"},{"revision":"01d035e303ee7df9379797b8f17ab4ea","url":"App.tsx"},{"revision":"016ad8f77d82f3d038517f177d80cabb","url":"components/AboutPopover.tsx"},{"revision":"020e810ca5ae3d2a209c2fe80360f381","url":"components/ChatItem.tsx"},{"revision":"b9e17f3e3ce61589a3d5bfa1092f87b1","url":"components/Connections.tsx"},{"revision":"4c3a5a9cf9d07de6bd209e036092b4dc","url":"components/EditPopover.tsx"},{"revision":"c9758a95e261d8f9391982cd86030116","url":"components/HeightSelect.tsx"},{"revision":"74eb2ca4e3ed7090e7d7fe12babc7d5c","url":"components/HomeOrLogin.tsx"},{"revision":"04457618b33ae9bc6574eea0c0982e89","url":"components/ImageCard.tsx"},{"revision":"59aa5e3a9f343f5bd53179c857ea9570","url":"components/InfoCard.tsx"},{"revision":"b6ac87f98043a23a1a01e056701818ce","url":"components/Map.tsx"},{"revision":"19f68bfc570af52dcae911bb3b5d4d71","url":"components/MatchItem.tsx"},{"revision":"92a5fe5c8592048d5b0fc4465c1f69ac","url":"components/Menu.tsx"},{"revision":"32860e1c1d2ea4ea59f3f8e6ced1c021","url":"components/ProfileCard.tsx"},{"revision":"74c7b447e2c90c0aaca1d88b15d98f81","url":"components/SessionList.tsx"},{"revision":"f86370dc97530331cf7c03080dbd8c35","url":"components/SessionListFilter.css"},{"revision":"2fd690a9f3fe431e96acbeab7d5fea14","url":"components/SessionListFilter.tsx"},{"revision":"50907e9ad53c7afc811380002369940f","url":"components/SessionListItem.tsx"},{"revision":"33a1fc430cdb873d58efef8d33dd71c8","url":"components/ShareSocialFab.tsx"},{"revision":"12b6489bd36c8890f9e42c8a2e4d25f8","url":"components/SpeakerItem.tsx"},{"revision":"7ad3876edeb0f431eccea57c68cb8aac","url":"components/Time.tsx"},{"revision":"704a29c56e563bda32091ad99c3c568b","url":"data/AppContext.tsx"},{"revision":"2a8d0eea8c6327a8f3548c5d4fea87e9","url":"data/combineReducers.ts"},{"revision":"4c7c3e003dc5127175c57e351258d13c","url":"data/connect.tsx"},{"revision":"60096f4338c5b34fa23e6fc83b1d1c4c","url":"data/dataApi.ts"},{"revision":"88cd69e0dff95efc73baed4de4ee8067","url":"data/env.ts"},{"revision":"2b1a4b570902c58d4fefa29cb7f7eb07","url":"data/selectors.ts"},{"revision":"6d0beedb39609153feaccd7c98d797a1","url":"data/sessions/sessions.actions.ts"},{"revision":"0cd2531c8a7867bb2580b3782cbee2c8","url":"data/sessions/sessions.reducer.ts"},{"revision":"14a9314e35ddab09d658781f4763920e","url":"data/sessions/sessions.state.ts"},{"revision":"f5dcc05d2f738b2871ec603d2c974261","url":"data/state.ts"},{"revision":"9e943ce2692ed107f6b6e4fa67ba9f5a","url":"data/user/user.actions.ts"},{"revision":"da34fc238458ddb71c88661a2c6e0af0","url":"data/user/user.reducer.ts"},{"revision":"784ca9023b8f7dc467d5d668eda0a6ec","url":"data/user/user.state.ts"},{"revision":"575063814839d5243944127b49c030d4","url":"declarations.ts"},{"revision":"e7394c125a25428cda50c01da4f32521","url":"index.tsx"},{"revision":"b5a125056e6e274c0dd3601301a9c7a3","url":"machines/appMachines.ts"},{"revision":"c5e507b0008310f3ba33132cf7502440","url":"machines/chatDetailMachines.ts"},{"revision":"76236151201f0529cbeb54cf5dbbe20f","url":"machines/homeMachines.ts"},{"revision":"96a3e2b1ab06f58bb7e54a9b626639fe","url":"models/Chat.ts"},{"revision":"5e23963c8afb210a97ce12607eeb2d26","url":"models/GeoPoint.ts"},{"revision":"72f6e7f360fe9b467e9fd38063d5a419","url":"models/Image.ts"},{"revision":"e9f6da912dc2c9549162386dbe606c62","url":"models/Location.ts"},{"revision":"eeb0b506fb11243dbcfa82c3979f42bb","url":"models/Message.ts"},{"revision":"bc9b174e6b0a774cca9a66083e97c123","url":"models/Profile.ts"},{"revision":"8d4def6e265941b0995eb198bb80dbb7","url":"models/Session.ts"},{"revision":"2ca7f982a720e247cafa781ec0df57cb","url":"models/SessionGroup.ts"},{"revision":"410b3b8189d71837fd1aca1ecb8f3652","url":"models/Speaker.ts"},{"revision":"ff2323074ee0257ac86ae38b3154af6a","url":"pages/Account.scss"},{"revision":"7f61998deeb28d6835c978312edb32e8","url":"pages/Account.tsx"},{"revision":"d2ca7e15057ff45d9ca72bf050b64bfd","url":"pages/ChatDetail.scss"},{"revision":"ca5bb4571c53e4400ed3b4d7d3c4be95","url":"pages/ChatDetail.tsx"},{"revision":"e62fe549ce90c0990fc29f57a8a73291","url":"pages/ChatsList.scss"},{"revision":"c87e1fca341083cfeb6fe43530ebc0c4","url":"pages/ChatsList.tsx"},{"revision":"bc1cc016f2e34f40e80a8870bf0e465b","url":"pages/Download.tsx"},{"revision":"6ca58993d6530d6c60def1a4e49318ac","url":"pages/Forgot.tsx"},{"revision":"8c7430b6a831afdeb5776b2fbf6a2b95","url":"pages/Home.scss"},{"revision":"896483bb2b3a6538224092385286efce","url":"pages/Home.tsx"},{"revision":"5fe5f7203763af3810b891b37fb46438","url":"pages/Login.scss"},{"revision":"10ceda5fd900749d5efe873f0b1cd0e7","url":"pages/Login.tsx"},{"revision":"0838c34f8145241a9435cb5ebd318e19","url":"pages/MainTabs.tsx"},{"revision":"e62fe549ce90c0990fc29f57a8a73291","url":"pages/MatchesList.scss"},{"revision":"5fc2edbbf3a639ba4f24fceb72c26335","url":"pages/MatchesList.tsx"},{"revision":"9e3809aa87010e85bd58d94677f14746","url":"pages/ProfileDetail.scss"},{"revision":"b07378cdf343350647fab06b0ea5416b","url":"pages/ProfileDetail.tsx"},{"revision":"0b343da566780e91f27790493cedec00","url":"pages/Reset.tsx"},{"revision":"f5213a6fcf9e3bf63441ac1c5cff83cb","url":"pages/Signup.tsx"},{"revision":"4ffcc73ecdf1941c3b440ef7dea577f2","url":"pages/Support.tsx"},{"revision":"e18558a5e7bf53ddf6d52cf9b9494368","url":"pages/Tutorial.scss"},{"revision":"788604f935308e4903cf0918de63cb5f","url":"pages/Tutorial.tsx"},{"revision":"728df61139bf09fd19e0d180dded1c2f","url":"pages/UserProfile.scss"},{"revision":"7abb70539a8b5284fda917e00d1514ba","url":"pages/UserProfile.tsx"},{"revision":"3b12a2a445e35988cd2eb9f73d12c500","url":"react-app-env.d.ts"},{"revision":"2f953b94d9785f91a19a8bc78c96d2dd","url":"serviceWorker.ts"},{"revision":"8ba167f4f4454585098e672073b900fc","url":"theme.css"},{"revision":"698ecbd929c3a4ebd9614e3c99e87230","url":"theme/variables.css"},{"revision":"876d814489a49aa4ad3a811376de3601","url":"util/pushUpFakeProfiles.ts"},{"revision":"a1bac87a92df09d2d3ec8bfb0f0b145a","url":"util/types.ts"},{"revision":"b6afbd293695a3dbd358fd9060c361fd","url":"util/util.ts"}]);