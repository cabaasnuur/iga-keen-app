const CACHE_NAME = "iga-keen-v1";

const APP_FILES = [
"./",
"./index.html",
"./style.css",
"./script.js",
"./manifest.json",
"./icon-192.png",
"./icon-512.png"
];

self.addEventListener("install", (event) => {
event.waitUntil(
caches.open(CACHE_NAME)
.then((cache) => cache.addAll(APP_FILES))
.then(() => self.skipWaiting())
);
});

self.addEventListener("activate", (event) => {
event.waitUntil(
caches.keys().then((keys) =>
Promise.all(
keys
.filter((key) => key !== CACHE_NAME)
.map((key) => caches.delete(key))
)
).then(() => self.clients.claim())
);
});

self.addEventListener("fetch", (event) => {
const request = event.request;
const url = new URL(request.url);

if (
request.method !== "GET" ||
url.origin !== self.location.origin
) {
return;
}

event.respondWith(
fetch(request).catch(() =>
caches.match(request).then((response) =>
response || caches.match("./index.html")
)
)
);
});
