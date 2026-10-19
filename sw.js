// 让课表打开得快、断网也能用：
// 先直接用手机上存好的版本打开（秒开），同时在后台下载新版本，下次打开时就是新的。
// 云端数据（Supabase）的请求不经过这里，直接走网络。
const CACHE = 'yuqiu-kebiao-v6';
const PAGE = './index.html';
const ASSETS = [PAGE, './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  const isPage = e.request.mode === 'navigate';
  const key = isPage ? PAGE : e.request;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(key, { ignoreSearch: true });
    const fresh = fetch(e.request).then(res => {
      if (res && res.ok) cache.put(key, res.clone());
      return res;
    });
    if (cached) { e.waitUntil(fresh.catch(() => {})); return cached; }
    return fresh;
  }));
});
