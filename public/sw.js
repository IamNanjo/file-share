const PRECACHE = "precache-v1";
const RUNTIME = "runtime";

const PRECACHE_URLS = [
	"/upload/index.html",
	"/upload/index.js",
	"/upload/style.min.css",
	"/assets/bootstrap.min.css",
	"/assets/copy.svg",
	"/assets/done.svg",
	"/assets/favicon.svg",
	"/assets/favicon-thin.svg",
	"/upload/manifest.json",
	"/assets/upload-file.svg",
	"/assets/upload-file.png",
	"/assets/Roboto/Roboto-Bold.ttf",
	"/assets/Roboto/Roboto-Regular.ttf"
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(PRECACHE)
			.then((cache) => cache.addAll(PRECACHE_URLS))
			.then(self.skipWaiting())
	);
});

self.addEventListener("activate", (event) => {
	const currentCaches = [PRECACHE, RUNTIME];
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return cacheNames.filter(
					(cacheName) => !currentCaches.includes(cacheName)
				);
			})
			.then((cachesToDelete) => {
				return Promise.all(
					cachesToDelete.map((cacheToDelete) => {
						return caches.delete(cacheToDelete);
					})
				);
			})
			.then(() => self.clients.claim())
	);
});

self.addEventListener("fetch", (event) => {
	if (event.request.url.startsWith(self.location.origin)) {
		event.respondWith(fetch(event.request));
	}
});
