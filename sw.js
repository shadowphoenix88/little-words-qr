/* Offline cache for Little Words. Same-origin GET only; nothing is sent anywhere. */
var CACHE = "lw-1a6c2e5887";
var FILES = ["./", "./assets/app.css", "./assets/app.js", "./assets/icons/bathtub.svg", "./assets/icons/bear.svg", "./assets/icons/bed.svg", "./assets/icons/bird.svg", "./assets/icons/bowl.svg", "./assets/icons/cat.svg", "./assets/icons/chair.svg", "./assets/icons/clap.svg", "./assets/icons/clock.svg", "./assets/icons/cow.svg", "./assets/icons/cup.svg", "./assets/icons/dog.svg", "./assets/icons/door.svg", "./assets/icons/drink.svg", "./assets/icons/duck.svg", "./assets/icons/eat.svg", "./assets/icons/elephant.svg", "./assets/icons/fish.svg", "./assets/icons/fridge.svg", "./assets/icons/friend-bean.svg", "./assets/icons/friend-honey.svg", "./assets/icons/friend-kiki.svg", "./assets/icons/friend-poppy.svg", "./assets/icons/horse.svg", "./assets/icons/hug.svg", "./assets/icons/jump.svg", "./assets/icons/lamp.svg", "./assets/icons/mirror.svg", "./assets/icons/monkey.svg", "./assets/icons/pig.svg", "./assets/icons/rabbit.svg", "./assets/icons/run.svg", "./assets/icons/shoes.svg", "./assets/icons/sing.svg", "./assets/icons/sit.svg", "./assets/icons/sleep.svg", "./assets/icons/sofa.svg", "./assets/icons/spoon.svg", "./assets/icons/stairs.svg", "./assets/icons/table.svg", "./assets/icons/toilet.svg", "./assets/icons/toothbrush.svg", "./assets/icons/trash-can.svg", "./assets/icons/tv.svg", "./assets/icons/walk.svg", "./assets/icons/wash-hands.svg", "./assets/icons/wave.svg", "./assets/icons/window.svg", "./assets/jsQR-LICENSE.txt", "./assets/jsQR.js", "./assets/scan.js", "./assets/words.js", "./scan.html", "./w/bathtub/", "./w/bear/", "./w/bed/", "./w/bird/", "./w/bowl/", "./w/cat/", "./w/chair/", "./w/clap/", "./w/clock/", "./w/cow/", "./w/cup/", "./w/dog/", "./w/door/", "./w/drink/", "./w/duck/", "./w/eat/", "./w/elephant/", "./w/fish/", "./w/fridge/", "./w/horse/", "./w/hug/", "./w/jump/", "./w/lamp/", "./w/mirror/", "./w/monkey/", "./w/pig/", "./w/rabbit/", "./w/run/", "./w/shoes/", "./w/sing/", "./w/sit/", "./w/sleep/", "./w/sofa/", "./w/spoon/", "./w/stairs/", "./w/table/", "./w/toilet/", "./w/toothbrush/", "./w/trash-can/", "./w/tv/", "./w/walk/", "./w/wash-hands/", "./w/wave/", "./w/window/"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (r) {
    return r || fetch(e.request).then(function (resp) {
      var copy = resp.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); return resp;
    });
  }));
});
