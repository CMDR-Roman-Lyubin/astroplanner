# Звёзды до 11,5ᵐ (Tycho-2) на карте неба — отложено

Сейчас на карте звёзды до 7,5ᵐ (d3-celestial `stars.8.json`, в `catalog-extra.js`) и ползунок предела блеска.
12.11.2026 начали встраивать весь Tycho-2, затем решили оставить 7,5ᵐ. Ниже всё, чтобы продолжить без повторных поисков.

## Решения и цифры

| Предел | Звёзд | Размер | Вывод |
|---|---|---|---|
| 7,5ᵐ (сейчас) | ~26 тыс. | ~0,4 МБ | — |
| 9ᵐ | ~120 тыс. | ~2 МБ | |
| 10ᵐ | ~350 тыс. | ~6 МБ | разумный компромисс |
| 11,5ᵐ (весь Tycho-2) | 2,54 млн | ~10 МБ в упаковке ниже | выбирали этот |
| 14ᵐ | 30+ млн | сотни МБ | невозможно офлайн; вместо этого снимки DSS вокруг объектов плана |

## Откуда брать

- Основной сервер CDS (`cdsarc.cds.unistra.fr`, `cdsarc.u-strasbg.fr`, `vizier.iucaa.in`) из сети пользователя **не отвечает**.
- Работают зеркала VizieR: **`https://vizier.cfa.harvard.edu/ftp/cats/I/259/`** (CfA) и `http://vizier.nao.ac.jp/ftp/cats/I/259/`.
- Файлы `tyc2.dat.00.gz` … `tyc2.dat.19.gz` (по 127 000 строк, всего 2 539 913), ≈160 МБ сжатыми; кэшировать в `.cache/tycho2/` (в `.gitignore`).
- Поля (байты из ReadMe, считая с 1): `RAmdeg` 16–27, `DEmdeg` 29–40 (средняя позиция J2000; у флага `X` пусто — тогда `RAdeg` 153–164, `DEdeg` 166–177), `BTmag` 111–116, `VTmag` 124–129.
- Визуальная V из величин Tycho: `V ≈ VT − 0,090·(BT − VT)`; если BT нет — VT, если VT нет — BT.
- Брать только V > 7,5 (ярче уже есть в `catalog-extra.js`) и ≤ 12.

## Упаковка `tyc2.bin` (gen-stars.js)

- Участки: полосы по склонению 2°, каждая делится по RA на `n = max(1, ceil(360·cos(середина полосы)/2))`; ~10 тыс. участков.
- Little-endian: `'TYC2'`, `uint32 T` (число участков), `T+1` × `uint32` — номер первой звезды каждого участка (последний = всего звёзд),
  затем звёзды по 4 байта: `x(12 бит) << 20 | y(12 бит) << 8 | round(V·10)(8 бит)`, где x — доля RA внутри участка ×4095, y — доля Dec внутри полосы ×4095.
- Внутри участка звёзды отсортированы от ярких к слабым — при чтении можно остановиться на пределе блеска (`break`).
- Проверка формата на странице: `getUint32(0,true) == 0x32435954` ('TYC2') и `T` совпадает с разбивкой страницы.

```js
// gen-stars.js — node gen-stars.js → tyc2.bin
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const dir = path.join(__dirname, '.cache', 'tycho2'), BAND = 2, MIN_MAG = 7.5, MAX_MAG = 12;
const bands = Array.from({ length: 180 / BAND }, (_, b) => Math.max(1, Math.ceil(360 * Math.cos((-90 + (b + .5) * BAND) * Math.PI / 180) / BAND)));
const first = []; let T = 0; for (const n of bands) { first.push(T); T += n }
async function part(i) {
  const name = `tyc2.dat.${String(i).padStart(2, '0')}.gz`, f = path.join(dir, name);
  if (!fs.existsSync(f)) {
    fs.mkdirSync(dir, { recursive: true });
    const r = await fetch('https://vizier.cfa.harvard.edu/ftp/cats/I/259/' + name);
    if (!r.ok) throw new Error(name + ': HTTP ' + r.status);
    fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  }
  return zlib.gunzipSync(fs.readFileSync(f)).toString('latin1');
}
(async () => {
  const tiles = Array.from({ length: T }, () => []); let total = 0, kept = 0;
  for (let i = 0; i < 20; i++) for (const l of (await part(i)).split('\n')) {
    if (l.length < 180) continue; total++;
    let ra = parseFloat(l.slice(15, 27)), dec = parseFloat(l.slice(28, 40));
    if (isNaN(ra) || isNaN(dec)) { ra = parseFloat(l.slice(152, 164)); dec = parseFloat(l.slice(165, 177)) }
    const bt = parseFloat(l.slice(110, 116)), vt = parseFloat(l.slice(123, 129));
    const v = !isNaN(vt) ? (!isNaN(bt) ? vt - .09 * (bt - vt) : vt) : bt;
    if (isNaN(ra) || isNaN(dec) || isNaN(v) || v <= MIN_MAG || v > MAX_MAG) continue;
    const b = Math.min(bands.length - 1, Math.floor((dec + 90) / BAND)), n = bands[b], j = Math.min(n - 1, Math.floor(ra / 360 * n));
    const x = Math.min(4095, Math.round((ra / 360 * n - j) * 4095)), y = Math.min(4095, Math.round(((dec + 90) / BAND - b) * 4095));
    tiles[first[b] + j].push(((x << 20) | (y << 8) | Math.min(255, Math.round(v * 10))) >>> 0); kept++;
  }
  const buf = Buffer.alloc(8 + 4 * (T + 1) + 4 * kept);
  buf.write('TYC2', 0, 'latin1'); buf.writeUInt32LE(T, 4);
  let k = 0, o = 8 + 4 * (T + 1);
  tiles.forEach((t, i) => { buf.writeUInt32LE(k, 8 + 4 * i); t.sort((a, b) => (a & 255) - (b & 255)); for (const s of t) { buf.writeUInt32LE(s, o); o += 4 } k += t.length });
  buf.writeUInt32LE(k, 8 + 4 * T);
  fs.writeFileSync(path.join(__dirname, 'tyc2.bin'), buf);
  console.log(`tyc2.bin: ${kept} из ${total}, ${T} участков, ${(buf.length / 1048576).toFixed(1)} МБ`);
})();
```

## Встраивание в страницу (astro-planner.html, drawMap)

- Загрузка при первом сильном приближении: `fetch('tyc2.bin')` → `TYC={off:new Uint32Array(b,8,T+1), s:new Uint32Array(b,8+4*(T+1))}`; состояние загрузки показывать рядом с масштабом.
- Хранение: в `sw.js` отдавать `tyc2.bin` cache-first из постоянного кэша `sky-ref` (не из версионного `sky-N`, иначе 10 МБ скачиваются при каждом обновлении). В `FILES` не добавлять. `build-pwa.js` — копировать в `docs/`; в git коммитить только `docs/tyc2.bin`, корневой — в `.gitignore`. Для claude.ai публиковать как файл артефакта (`files: {"tyc2.bin": "docs/tyc2.bin"}`).
- Предел блеска: `magLim = min(ползунок, 5 + 1,5·log2(z))`, верх ползунка (`#starLim`) поднять до 11,5.
- Выбор участков: центр поля — обратная проекция центра вида:
  `dx=200-cx, dy=200-cy, h=90-hypot(dx,dy)·90/R0, az=atan2(dx,dy)`; `dec=asin(sinφ·sin h + cosφ·cos h·cos az)`;
  `ra = LST − atan2(−sin az·cos h, cosφ·sin h − sinφ·cos h·cos az)`. Радиус ≈ `half·1,5·90/R0 + 2°`; брать участки, центр которых ближе радиуса.
- Распаковка: `ra=(j+(s>>>20)/4095)/n·360`, `dec=−90+(b+((s>>>8)&4095)/4095)·2`, `V=(s&255)/10`.
- Скорость: в Млечном Пути в поле 6° до ~10–15 тыс. звёзд. Рисовать не `<circle>`, а одним `<path>` на каждые полвеличины:
  точка = `M x y h0` с `stroke-linecap="round"`, `stroke-width = 2·r/z`. Проверить скорость на телефоне.
