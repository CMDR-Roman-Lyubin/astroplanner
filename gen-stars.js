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
