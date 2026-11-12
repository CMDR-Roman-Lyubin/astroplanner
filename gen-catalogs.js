// Собирает catalog-extra.js — дополнительные каталоги объектов из каталога Stellarium.
//   node gen-catalogs.js
// Исходники (каталог, имена, русские переводы имён) скачиваются в .cache/ один раз.
// Берём только то, что видно из северного полушария (склонение от −30°), и отсекаем то, что не достать 12″ телескопом.
const fs = require('fs'), path = require('path');
const cache = path.join(__dirname, '.cache');
const SRC = {
  'catalog.txt': 'nebulae/default/catalog.txt',
  'names.dat': 'nebulae/default/names.dat',
  'ru.po': 'po/stellarium-sky/ru.po',
};
// Звёзды и линии созвездий для карты неба — из d3-celestial (BSD-3), координаты в градусах
const CEL = 'https://cdn.jsdelivr.net/npm/d3-celestial@0.7.35/data/';
const CEL_FILES = ['stars.8.json', 'stars.6.json', 'constellations.lines.json', 'constellations.json'];
const MIN_DEC = -30;

// Порядок — как в Stellarium; [ключ, подпись, префикс в names.dat, формат обозначения]
const CATS = [
  ['M', 'Мессье', 'M', n => 'M' + n],
  ['C', 'Колдуэлл', 'C', n => 'C ' + n],
  ['NGC', 'Новый общий каталог', 'NGC', n => 'NGC ' + n],
  ['IC', 'Индекс-каталог', 'IC', n => 'IC ' + n],
  ['B', 'Барнард — тёмные туманности', 'B', n => 'B ' + n],
  ['Sh2', 'Шарплесс — области HII', 'SH2', n => 'Sh2-' + n],
  ['vdB', 'ван ден Берг — отражательные туманности', 'VDB', n => 'vdB ' + n],
  ['RCW', 'RCW — области Hα южного Млечного Пути', 'RCW', n => 'RCW ' + n],
  ['LDN', 'Линдс — тёмные туманности', 'LDN', n => 'LDN ' + n],
  ['LBN', 'Линдс — светлые туманности', 'LBN', n => 'LBN ' + n],
  ['Cr', 'Коллиндер — скопления', 'CR', n => 'Cr ' + n],
  ['Mel', 'Мелотт', 'MEL', n => 'Mel ' + n],
  ['PGC', 'PGC — галактики', 'PGC', n => 'PGC ' + n],
  ['UGC', 'Упсальский каталог галактик', 'UGC', n => 'UGC ' + n],
  ['Ced', 'Седерблад — диффузные туманности', 'CED', n => 'Ced ' + n],
  ['Arp', 'Арп — пекулярные галактики', 'ARP', n => 'Arp ' + n],
  ['VV', 'Воронцов-Вельяминов — взаимодействующие галактики', 'VV', n => 'VV ' + n],
  ['PK', 'Перек–Когоутек — планетарные туманности', 'PK', n => 'PK ' + n],
  ['PN G', 'Страсбургский каталог планетарных туманностей', 'PNG', n => 'PN G' + n],
  ['SNR G', 'Остатки сверхновых (Грин)', 'SNRG', n => 'SNR G' + n],
  ['ACO', 'Абелл — скопления галактик', 'ACO', n => 'ACO ' + n],
  ['HCG', 'Хиксон — компактные группы галактик', 'HCG', n => 'HCG ' + n],
  ['ESO', 'ESO/Уппсала', 'ESO', n => 'ESO ' + n],
  ['vdBH', 'ван ден Берг–Хербст', 'VDBH', n => 'vdBH ' + n],
  ['DWB', 'Дикель–Вендекер–Бьеритц — области HII', 'DWB', n => 'DWB ' + n],
  ['Tr', 'Трюмплер — скопления', 'TR', n => 'Tr ' + n],
  ['St', 'Сток — скопления', 'ST', n => 'St ' + n],
  ['Ru', 'Рупрехт — скопления', 'RU', n => 'Ru ' + n],
  ['vdB-Ha', 'ван ден Берг–Хаген — скопления', 'VDBHA', n => 'vdB-Ha ' + n],
];
// Колонка каталога для каждого ключа (с 17-й, по порядку колонок Stellarium)
const COL = { NGC: 16, IC: 17, M: 18, C: 19, B: 20, Sh2: 21, vdB: 22, RCW: 23, LDN: 24, LBN: 25, Cr: 26, Mel: 27, PGC: 28, UGC: 29, Ced: 30, Arp: 31, VV: 32,
  PK: 33, 'PN G': 34, 'SNR G': 35, ACO: 36, HCG: 37, ESO: 38, vdBH: 39, DWB: 40, Tr: 41, St: 42, Ru: 43, 'vdB-Ha': 44 };
// Какое обозначение показывать главным
const PRIMARY = ['M', 'NGC', 'IC', 'C', 'Sh2', 'B', 'vdB', 'Cr', 'Mel', 'Tr', 'St', 'Ru', 'vdB-Ha', 'Arp', 'HCG', 'ACO', 'UGC', 'PGC',
  'LBN', 'LDN', 'Ced', 'DWB', 'RCW', 'PK', 'PN G', 'SNR G', 'VV', 'ESO', 'vdBH'];
// Типы Stellarium → типы приложения; остальное (звёзды, кандидаты, квазары, ИК-источники) не берём
const TYPE = {};
for (const t of ['Gx', 'AGx', 'G', 'IG', 'IG2', 'IG3', 'rG', 'RG', 'PoG', 'GiG']) TYPE[t] = 'G';
for (const t of ['ClG', 'CGG', 'MGr', 'GxCL']) TYPE[t] = 'GG';
for (const t of ['OC', 'CL', 'Cl', 'OpC', 'SA']) TYPE[t] = 'OC';
for (const t of ['HII', 'EN', 'GNe', 'NB', 'C+N', 'REG', 'SFR', 'ISM']) TYPE[t] = 'EN';
Object.assign(TYPE, { GC: 'GC', RN: 'RN', BN: 'RN', DN: 'DN', MoC: 'DN', SNR: 'SNR', PN: 'PN', PPN: 'PN' });
// Размер по умолчанию, если в каталоге 0, ′
const SIZE = { G: .5, GG: 5, OC: 5, GC: 3, EN: 5, RN: 3, DN: 5, SNR: 10, PN: .3 };
// У этих объектов основного списка в Stellarium другое главное обозначение
const BASE_ALIAS = { 'Abell 21': ['Sh2-274'], 'NGC 869/884': ['NGC 869', 'NGC 884'], 'NGC 5907': ['NGC 5906'] };

async function src(name) {
  const f = path.join(cache, name);
  if (!fs.existsSync(f)) {
    fs.mkdirSync(cache, { recursive: true });
    const r = await fetch(CEL_FILES.includes(name) ? CEL + name : 'https://raw.githubusercontent.com/Stellarium/stellarium/master/' + SRC[name]);
    if (!r.ok) throw new Error(name + ': HTTP ' + r.status);
    fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  }
  return fs.readFileSync(f, 'utf8');
}

(async () => {
  // русские имена: msgid → msgstr
  const ru = {};
  for (const m of (await src('ru.po')).matchAll(/^msgid "(.+)"\r?\nmsgstr "(.+)"\r?$/gm)) ru[m[1]] = m[2];
  // имена объектов: «ПРЕФИКС номер» → имя; известные (WK) — вперёд
  const names = {}, enNames = {};
  for (const l of (await src('names.dat')).split('\n')) {
    if (!l.trim() || l[0] == '#') continue;
    const key = l.slice(0, 5).trim() + ' ' + l.slice(5, 20).trim(), m = l.slice(20).match(/_\("(.+?)"\)(.*)/);
    if (!m) continue;
    const n = ru[m[1]] || m[1], wk = /\bWK\b/.test(m[2]);
    if (!names[key] || wk && !names[key].wk) names[key] = { n, wk };
    (enNames[key] || (enNames[key] = new Set())).add(m[1]); // все английские имена — для поиска («Pelican Nebula», «Ring Nebula»)
  }
  const en = {}; // id объекта → английские имена через «|»
  const addEn = (id, keys) => { const s = new Set(en[id] ? en[id].split('|') : []); for (const k of keys) for (const x of enNames[k] || []) s.add(x); if (s.size) en[id] = [...s].join('|') };
  const html = fs.readFileSync(path.join(__dirname, 'astro-planner.html'), 'utf8');
  const baseIds = html.match(/const CATALOG = `([^`]*)`/)[1].trim().split('\n').map(l => l.split(';')[0]);
  const baseOf = {}; // обозначение → id объекта основного списка
  for (const id of baseIds) for (const a of [id, ...(BASE_ALIAS[id] || [])]) baseOf[a] = id;

  const base = {}, extra = new Map();
  const stat = Object.fromEntries(CATS.map(c => [c[0], 0]));
  for (const l of (await src('catalog.txt')).split('\n')) {
    if (!l.trim() || l[0] == '#') continue;
    const r = l.split('\t').map(x => x.trim());
    const ids = [], keys = [];
    let mask = 0;
    CATS.forEach(([k, , pre, fmt], i) => {
      const v = r[COL[k]];
      if (v && v != '0') { ids.push([k, fmt(v)]); keys.push(pre + ' ' + v); mask |= 1 << i }
    });
    if (!ids.length) continue;
    // объект из основного списка — только запоминаем, в каких он каталогах
    const hit = ids.map(x => baseOf[x[1]]).find(Boolean);
    if (hit) { const e = base[hit] || (base[hit] = { m: 0, ids: new Set() }); e.m |= mask; ids.forEach(x => x[1] != hit && e.ids.add(x[1])); addEn(hit, keys); continue }
    const dec = +r[2], type = TYPE[r[5]];
    if (!(dec >= MIN_DEC) || !type) continue;

    const V = +r[4], Bm = +r[3];
    let mag = V < 99 ? V : Bm < 99 ? Bm : NaN;
    if (type == 'DN') mag = NaN; // у тёмных туманностей в этой колонке непрозрачность, не блеск
    const inCat = k => ids.some(x => x[0] == k);
    // что вообще имеет смысл искать в 12″: слабее этих порогов — только для больших телескопов и глубокой съёмки
    if (type == 'G' && !(mag <= (['M', 'NGC', 'IC', 'C', 'Arp', 'HCG'].some(inCat) ? 15 : 14))) continue;
    if (type == 'GG' && !(mag <= 15.5)) continue;
    if (type == 'PN' && !(mag <= 16) && !(+r[7] >= .5)) continue;
    const a = +r[7] || SIZE[type], b = +r[8] || a;
    // нет блеска — оцениваем его по типу из «типичной» поверхностной яркости и помечаем ~
    let est = false;
    const area = 2.5 * Math.log10(Math.PI / 4 * a * b);
    if (isNaN(mag)) {
      est = true;
      const bright = +(r[6].match(/(\d)\s*$/) || [])[1]; // яркость по Шарплессу: 1 — слабая, 3 — яркая
      const sb = type == 'DN' ? 19 - (+r[4] || 3)        // непрозрачность 1–6: чем темнее облако, тем заметнее
        : type == 'EN' ? (bright ? 16.5 - bright : 15) : { SNR: 15.5, RN: 14.5, PN: 15.5, OC: 13, GC: 13, G: 15, GG: 16 }[type];
      mag = sb - area;
    } else if (type == 'RN' && mag + area < 13.5) { est = true; mag = 13.5 - area } // у vdB блеск — освещающей звезды, а не туманности
    const order = PRIMARY.map(k => ids.find(x => x[0] == k)).filter(Boolean);
    const id = order[0][1];
    if (extra.has(id)) continue;
    const nm = keys.map(k => names[k]).find(Boolean);
    CATS.forEach((c, i) => { if (mask & 1 << i) stat[c[0]]++ });
    addEn(id, keys);
    extra.set(id, [id, (nm ? nm.n : '').replace(/[;`\\$]/g, ' '), type, (+r[1] / 15).toFixed(4), dec.toFixed(3), (est ? '~' : '') + +mag.toFixed(1),
      +a.toFixed(2), +b.toFixed(2), mask.toString(36), order.slice(1).map(x => x[1]).join(',')].join(';'));
  }
  // Карта неба: звёзды до 7,5ᵐ (слабые видны только при приближении) «RA,Dec,блеск» через «;», линии созвездий — ломаные «RA,Dec,RA,Dec…» через «;», подписи — «имя,RA,Dec»
  const ra = x => +((x + 360) % 360).toFixed(1), d1 = x => +x.toFixed(1);
  const stars = JSON.parse(await src('stars.8.json')).features.filter(f => f.properties.mag <= 7.5)
    .map(f => [ra(f.geometry.coordinates[0]), d1(f.geometry.coordinates[1]), d1(f.properties.mag)].join(',')).join(';');
  const lines = JSON.parse(await src('constellations.lines.json')).features.flatMap(f => f.geometry.coordinates)
    .map(l => l.flatMap(([x, y]) => [ra(x), d1(y)]).join(',')).join(';');
  const cnames = JSON.parse(await src('constellations.json')).features
    .map(f => [f.properties.ru, ra(f.geometry.coordinates[0]), d1(f.geometry.coordinates[1])].join(',')).join(';');
  const out = `// Сгенерировано gen-catalogs.js из каталога Stellarium (GPL) — руками не править.
// CAT_BASE: id основного списка → «маска каталогов;другие обозначения»; CAT_EXTRA: id;имя;тип;RA ч;Dec;блеск (~ — оценка);a′;b′;маска;другие обозначения
// Объекты северного неба (склонение от ${MIN_DEC}°) в пределах досягаемости 12″ телескопа.
const CAT_LIST=${JSON.stringify(CATS.map(c => [c[0], c[1]]))};
const CAT_BASE=${JSON.stringify(Object.fromEntries(Object.entries(base).map(([k, v]) => [k, v.m.toString(36) + ';' + [...v.ids].join(',')])))};
// CAT_EN: id → английские названия через «|» — только для поиска
const CAT_EN=${JSON.stringify(Object.fromEntries(Object.entries(en).filter(([id]) => extra.has(id) || base[id])))};
const SKY_STARS='${stars}';
const SKY_LINES='${lines}';
const SKY_NAMES='${cnames}';
const CAT_EXTRA=\`
${[...extra.values()].join('\n')}
\`;
`;
  fs.writeFileSync(path.join(__dirname, 'catalog-extra.js'), out);
  console.log('объектов:', extra.size, '; основного списка найдено в Stellarium:', Object.keys(base).length, 'из', baseIds.length,
    '; размер', (out.length / 1024).toFixed(0), 'КБ');
  console.log('новых объектов по каталогам:', stat);
  console.log('не найдены:', baseIds.filter(id => !base[id]).join(', '));
})();
