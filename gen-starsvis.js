// Собирает stars-vis.js — звёзды для визуала: переменные (GCVS), углеродные (CGCS) и двойные (WDS).
//   node gen-starsvis.js
// Источники — зеркало VizieR в CfA (основной сервер CDS из сети пользователя не отвечает) и d3-celestial (имена звёзд).
// Отбираются звёзды северного неба (склонение от −30°), интересные в любительский телескоп, — несколько сотен, а не весь каталог.
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const cache = path.join(__dirname, '.cache', 'stars'), MIN_DEC = -30;
const SRC = {
  'gcvs_cat.dat.gz': 'https://vizier.cfa.harvard.edu/ftp/cats/B/gcvs/gcvs_cat.dat.gz',
  'wds.dat.gz': 'https://vizier.cfa.harvard.edu/ftp/cats/B/wds/wds.dat.gz',
  'cgcs.dat.gz': 'https://vizier.cfa.harvard.edu/ftp/cats/III/227/catalog.dat.gz',
  'starnames.json': 'https://cdn.jsdelivr.net/npm/d3-celestial@0.7.35/data/starnames.json',
  'stars.6.json': 'https://cdn.jsdelivr.net/npm/d3-celestial@0.7.35/data/stars.6.json',
};
async function src(name) {
  const f = path.join(cache, name);
  if (!fs.existsSync(f)) {
    fs.mkdirSync(cache, { recursive: true });
    const r = await fetch(SRC[name]); if (!r.ok) throw new Error(name + ': HTTP ' + r.status);
    fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  }
  const b = fs.readFileSync(f);
  return name.endsWith('.gz') ? zlib.gunzipSync(b).toString('latin1') : b.toString('utf8');
}
const GREEK = { alf: 'α', bet: 'β', gam: 'γ', del: 'δ', eps: 'ε', zet: 'ζ', eta: 'η', the: 'θ', iot: 'ι', kap: 'κ', lam: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', omi: 'ο', pi: 'π', rho: 'ρ', sig: 'σ', tau: 'τ', ups: 'υ', phi: 'φ', chi: 'χ', khi: 'χ', psi: 'ψ', ome: 'ω' };
// известные русские названия, которых нет в именах звёзд d3-celestial
const NAMES = { 'ο Cet': 'Мира', 'Y CVn': 'Ла Суперба', 'R Lep': 'Багровая звезда Хайнда', 'μ Cep': 'Гранатовая звезда Гершеля', 'T CrB': 'Огненная Звезда' };
const sep = (a, b) => { const R = Math.PI / 180; return Math.acos(Math.min(1, Math.sin(a.dec * R) * Math.sin(b.dec * R) + Math.cos(a.dec * R) * Math.cos(b.dec * R) * Math.cos((a.ra - b.ra) * R))) / R };
const hms = (h, m, s) => (+h + +m / 60 + +s / 3600) * 15, dms = (sg, d, m, s) => (sg == '-' ? -1 : 1) * (+d + +m / 60 + +s / 3600);

(async () => {
  // яркие звёзды с HIP и именами — для подписи двойных и переменных: «Альбирео», «γ And», «61 Cyg»
  const names = JSON.parse(await src('starnames.json'));
  const bright = JSON.parse(await src('stars.6.json')).features.map(f => ({ ra: (f.geometry.coordinates[0] + 360) % 360, dec: f.geometry.coordinates[1], mag: f.properties.mag, n: names[f.id] }))
    .filter(s => s.n && s.dec > MIN_DEC - 1);
  const label = s => { const n = s.n; const d = n.bayer ? n.bayer.replace(/\d/, x => '¹²³⁴⁵⁶⁷⁸⁹'[x - 1]) : n.flam || n.var; return { desig: d ? `${d} ${n.c}` : '', ru: n.ru || '', en: n.name || '' } };
  const nearBright = (p, mag, r = .02) => { let best = null, bd = r; for (const s of bright) { if (Math.abs(s.dec - p.dec) > r) continue; const d = sep(s, p); if (d < bd && (mag == null || Math.abs(s.mag - mag) < 1.5)) { bd = d; best = s } } return best };

  // ---------- переменные (GCVS) ----------
  const vars = [];
  for (const l of (await src('gcvs_cat.dat.gz')).split('\n')) {
    const f = l.split('|'); if (f.length < 16) continue;
    const name = f[1].replace('*', '').trim().replace(/\s+/g, ' ').replace(/^([a-zA-Z])\. /, '$1 ').replace(/^V0+(\d)/, 'V$1'), c = f[2].trim().match(/^(\d\d)(\d\d)(\d\d\.\d+)\s+([+-])(\d\d)(\d\d)(\d\d\.?\d*)/);
    if (!c) continue;
    const ra = hms(c[1], c[2], c[3]), dec = dms(c[4], c[5], c[6], c[7]); if (dec < MIN_DEC) continue;
    const type = f[3].trim(), max = parseFloat(f[4]), minRaw = f[5], min = parseFloat(minRaw.replace(/[()<>]/g, ''));
    const isAmp = minRaw.includes('('), minMag = isNaN(min) ? NaN : isAmp ? max + min : min;
    const epoch = parseFloat(f[8]), period = parseFloat(f[10]), dur = parseFloat(f[11]), sp = f[12].trim();
    if (isNaN(max) || isNaN(minMag)) continue;
    // только величины, близкие к тому, что видит глаз: V, Hipparcos, фотографические; ИК-величины (I, K, R…) завышают яркость красных звёзд
    if (!/^(V|Hp|p|B|v|pg)$/.test(f[7].trim())) continue;
    const amp = minMag - max, carbon = /^(C|N|R)\d|^C[-\d]|^C\(|^N\d|^R\d/.test(sp);
    const t = type.split(/[/:+]/)[0];
    let keep = false;
    if (t == 'M') keep = max <= 7.5;                                        // мириды
    else if (/^(SR|SRA|SRB|SRC|SRD|L|LB|LC)$/.test(t)) keep = max <= 6.2 && amp >= .5 || carbon && max <= 8; // полуправильные и неправильные
    else if (/^(EA|EB|EW)$/.test(t)) keep = max <= 6 && amp >= .4;          // затменные
    else if (/^(DCEP|CEP|DCEPS|CW)$/.test(t)) keep = max <= 6.5 && amp >= .4; // цефеиды с заметным размахом (не Полярная)
    else if (/^(RCB|NR|UGSS|UGZ|ZAND|UG)$/.test(t)) keep = max <= 10;       // R CrB, повторные новые, карликовые новые
    if (!keep) continue;
    const g = name.match(/^([a-z]{2,3})\.?(\d?)\s+(\w+)$/), id = g && GREEK[g[1]] ? `${GREEK[g[1]]}${g[2] ? '¹²³⁴'[g[2] - 1] || '' : ''} ${g[3]}` : name;
    const b = nearBright({ ra, dec }, max), lb = b ? label(b) : { desig: '', ru: '', en: '' };
    vars.push({ id, ra, dec, type, max, min: +minMag.toFixed(2), period: period || 0, epoch: epoch ? epoch + 2400000 : 0, dur: dur || 0, sp, carbon, ru: NAMES[id] ?? lb.ru, en: lb.en });
  }

  // ---------- углеродные (CGCS): только те, которых нет среди переменных выше ----------
  const carbons = [];
  for (const l of (await src('cgcs.dat.gz')).split('\n')) {
    if (l.length < 60) continue;
    const ra = hms(l.slice(17, 19), l.slice(20, 22), l.slice(23, 27)), dec = dms(l[29], l.slice(30, 32), l.slice(33, 35), l.slice(36, 38));
    const v = parseFloat(l.slice(48, 52)); if (dec < MIN_DEC || !(v <= 8.5)) continue;
    const v0 = vars.find(x => sep(x, { ra, dec }) < .02);
    if (v0) { v0.carbon = true; continue }
    const nm = l.slice(94, 128).trim(), cgcs = +l.slice(11, 15);
    const vn = nm.split(',').map(s => s.trim()).find(s => /^[A-Z]{1,2} [A-Z][a-z]{2}$|^V\d+ [A-Z][a-z]{2}$/.test(s));
    const b = nearBright({ ra, dec }, v), lb = b ? label(b) : { desig: '', ru: '', en: '' };
    carbons.push({ id: vn || lb.desig || 'CGCS ' + cgcs, ra, dec, v, sp: l.slice(76, 94).trim(), ru: lb.ru, en: lb.en });
  }

  // ---------- двойные (WDS) ----------
  const dbl = [];
  for (const l of (await src('wds.dat.gz')).split('\n')) {
    if (l.length < 130 || l[111] == '!') continue;
    const ra = hms(l.slice(112, 114), l.slice(114, 116), l.slice(116, 121)), dec = dms(l[121], l.slice(122, 124), l.slice(124, 126), l.slice(126, 130));
    if (isNaN(ra) || isNaN(dec) || dec < MIN_DEC) continue;
    const m1 = parseFloat(l.slice(58, 64)), m2 = parseFloat(l.slice(64, 69)), s = parseFloat(l.slice(52, 58)), pa = parseInt(l.slice(42, 45));
    if (!(m1 <= 6.5 && m2 <= 9.5 && s >= .6 && s <= 90 && m2 - m1 <= 4)) continue;
    const disc = l.slice(10, 17).trim().replace(/^([A-Z]+)\s*(\d+)/, '$1 $2'), comp = l.slice(17, 22).trim();
    const b = nearBright({ ra, dec }, m1, .015), lb = b ? label(b) : { desig: '', ru: '', en: '' };
    dbl.push({ id: disc + (comp ? ' ' + comp : ''), ra, dec, m1, m2, sep: s, pa: isNaN(pa) ? null : pa, sp: l.slice(70, 80).trim(), desig: lb.desig, ru: lb.ru, en: lb.en });
  }
  // отбор: известные (с обозначением звезды) и яркие; одна пара — одна запись
  dbl.sort((a, b) => (!!b.desig - !!a.desig) || a.m1 - b.m1);
  const seen = new Set(), dsel = dbl.filter(d => !seen.has(d.id) && seen.add(d.id)).slice(0, 320);

  const out = `// Сгенерировано gen-starsvis.js — руками не править. Звёзды для визуала, северное небо (склонение от ${MIN_DEC}°).
// VAR_STARS: id;русское имя;RA°;Dec°;тип GCVS;макс;мин;период сут;эпоха JD;длит. затмения %;спектр;углеродная 0/1;англ. имя   (GCVS, Samus+ 2017)
// CARBON_STARS: id;русское имя;RA°;Dec°;V;спектр;англ. имя                                                     (CGCS, Alksnis+ 2001)
// DOUBLE_STARS: id WDS;обозначение звезды;русское имя;RA°;Dec°;m1;m2;расстояние″;угол°;спектр;англ. имя       (WDS, Mason+)
const VAR_STARS=${JSON.stringify(vars.map(v => [v.id, v.ru, v.ra.toFixed(4), v.dec.toFixed(4), v.type, v.max, v.min, v.period, v.epoch, v.dur, v.sp, v.carbon ? 1 : 0, v.en].join(';')).join('\n'))};
const CARBON_STARS=${JSON.stringify(carbons.map(c => [c.id, c.ru, c.ra.toFixed(4), c.dec.toFixed(4), c.v, c.sp, c.en].join(';')).join('\n'))};
const DOUBLE_STARS=${JSON.stringify(dsel.map(d => [d.id, d.desig, d.ru, d.ra.toFixed(4), d.dec.toFixed(4), d.m1, d.m2, d.sep, d.pa ?? '', d.sp, d.en].join(';')).join('\n'))};
`;
  fs.writeFileSync(path.join(__dirname, 'stars-vis.js'), out);
  const by = a => a.reduce((m, x) => (m[x] = (m[x] || 0) + 1, m), {});
  console.log('переменных', vars.length, by(vars.map(v => v.type.split(/[/:+]/)[0])), 'углеродных среди них', vars.filter(v => v.carbon).length);
  console.log('углеродных отдельно', carbons.length, '; двойных', dsel.length, 'из', dbl.length, '; размер', (out.length / 1024).toFixed(0), 'КБ');
  // самопроверка: классика на месте
  for (const id of ['ο Cet', 'β Per', 'R Leo', 'χ Cyg', 'Y CVn', 'μ Cep', 'δ Cep', 'R CrB', 'T CrB']) console.assert(vars.some(v => v.id == id), 'нет переменной ' + id);
  for (const d of ['β¹ Cyg', 'ζ UMa', 'γ¹ And', 'ε Boo']) console.assert(dsel.some(x => x.desig == d), 'нет двойной ' + d);
})();
