// Собирает устанавливаемое приложение (PWA) из astro-planner.html в папку docs/ — её раздаёт GitHub Pages.
//   node build-pwa.js        — собрать
//   node build-pwa.js serve  — собрать и раздать на http://localhost:8765 для проверки
// Источник правды один — astro-planner.html; папку docs/ руками не правим.
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const out = path.join(__dirname, 'docs');
fs.mkdirSync(out, { recursive: true });
const write = (name, data) => fs.writeFileSync(path.join(out, name), data);
const BG = '#0c111d';
// Номер версии = число коммитов после того, как эта сборка будет закоммичена; дата — день сборки.
// shortcut: собрали дважды без коммита — номер тот же; для бета-теста этого хватает
let n = '?';
try { n = +require('child_process').execSync('git rev-list --count HEAD', { cwd: __dirname }).toString() + 1 } catch {}
const VERSION = `Версия ${n} от ${new Date().toLocaleDateString('ru', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;

// Страница для артефакта не содержит <html>/<head> — оборачиваем её так же, как это делает публикация
write('index.html', `<!doctype html><html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<link rel="manifest" href="manifest.webmanifest"><meta name="theme-color" content="${BG}"><link rel="icon" href="icon-192.png">
<style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style></head><body>
${fs.readFileSync(path.join(__dirname, 'astro-planner.html'), 'utf8')}
</body></html>`);

// дополнительные каталоги — отдельным файлом рядом со страницей (его собирает gen-catalogs.js)
fs.copyFileSync(path.join(__dirname, 'catalog-extra.js'), path.join(out, 'catalog-extra.js'));
fs.copyFileSync(path.join(__dirname, 'stars-vis.js'), path.join(out, 'stars-vis.js'));
// номер версии — отдельным файлом рядом со страницей: его же публикуем на claude.ai, поэтому номер там и в приложении один
const verJs = `window.APP_VERSION=${JSON.stringify(VERSION)};
`;
fs.writeFileSync(path.join(__dirname, 'version.js'), verJs); write('version.js', verJs);

write('manifest.webmanifest', JSON.stringify({
  name: 'Тёмная ночь', short_name: 'Тёмная ночь', lang: 'ru', start_url: './', scope: './', display: 'standalone',
  background_color: BG, theme_color: BG,
  icons: [192, 512].map(s => ({ src: `icon-${s}.png`, sizes: `${s}x${s}`, type: 'image/png', purpose: 'any maskable' })),
}, null, 1));

// Сначала кэш (в поле сеть либо отсутствует, либо «висит»). Каждая сборка — свой кэш: новый sw.js скачивает все файлы версии разом
// и только потом заменяет старый кэш, поэтому страница и каталог всегда из одной версии (раньше по отдельности обновлялись — и не сходились)
const FILES = ['./', 'catalog-extra.js', 'stars-vis.js', 'version.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
write('sw.js', `const CACHE='sky-${n}-${Date.now().toString(36)}';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(${JSON.stringify(FILES)}.map(f=>new Request(f,{cache:'reload'})))));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('sky-')&&k!=CACHE&&k!='sky-ref').map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  // снимки обзора неба и версии библиотек не меняются: раз скачанное хранится навсегда и работает без сети. Кэш модели распознавания («transformers-cache») не трогаем
  if(u.hostname=='skyview.gsfc.nasa.gov'||u.hostname=='raw.githubusercontent.com'||u.hostname.endsWith('.wikimedia.org')||u.hostname=='cdn.jsdelivr.net'){e.respondWith(caches.open('sky-ref').then(c=>c.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{c.put(e.request,r.clone());return r}))));return}
  if(e.request.method!='GET'||u.origin!=location.origin)return;
  e.respondWith(caches.open(CACHE).then(c=>c.match(e.request,{ignoreSearch:true})).then(hit=>hit||fetch(e.request)));
});
`);

// Иконка: полумесяц акцентного цвета на фоне страницы. PNG пишем вручную, чтобы не тянуть зависимости
function png(size) {
  const row = size * 4 + 1, raw = Buffer.alloc(row * size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = (x + .5) / size, v = (y + .5) / size;
    const moon = Math.hypot(u - .5, v - .5) < .28 && Math.hypot(u - .6, v - .42) > .25;
    raw.set(moon ? [0xe9, 0xb6, 0x5c, 255] : [0x0c, 0x11, 0x1d, 255], y * row + 1 + x * 4);
  }
  const chunk = (type, data) => {
    const body = Buffer.concat([Buffer.from(type), data]), len = Buffer.alloc(4), crc = Buffer.alloc(4);
    len.writeUInt32BE(data.length); crc.writeUInt32BE(zlib.crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr.set([8, 6, 0, 0, 0], 8); // 8 бит, RGBA
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
for (const s of [192, 512]) write(`icon-${s}.png`, png(s));
console.log('Собрано в', out, '—', fs.readdirSync(out).join(', '));

if (process.argv[2] == 'serve') {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
  require('http').createServer((req, res) => {
    const name = path.basename(new URL(req.url, 'http://x').pathname) || 'index.html'; // basename — чтобы не выйти из папки
    fs.readFile(path.join(out, name), (err, data) => {
      res.writeHead(err ? 404 : 200, { 'Content-Type': types[path.extname(name)] || 'text/plain' });
      res.end(err ? 'not found' : data);
    });
  }).listen(8765, () => console.log('http://localhost:8765'));
}
