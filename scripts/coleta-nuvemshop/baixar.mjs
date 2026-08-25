import fs from 'node:fs/promises';
import path from 'node:path';

const catalogo = JSON.parse(await fs.readFile('_nuvem/catalogo.json', 'utf8'));
const destino = '_nuvem/fotos';
await fs.mkdir(destino, { recursive: true });

const H = { 'user-agent': 'Mozilla/5.0', referer: 'https://usevincitore.com.br/' };
let ok = 0, falhas = 0;

for (const p of catalogo) {
  for (const [i, url] of p.fotos.entries()) {
    const nome = `${p.slug}-${String(i).padStart(2, '0')}.webp`;
    const alvo = path.join(destino, nome);
    try {
      await fs.access(alvo);
      ok++;
      continue;
    } catch {}
    const r = await fetch(url, { headers: H });
    if (!r.ok) { falhas++; console.log(`  ! ${r.status} ${nome}`); continue; }
    await fs.writeFile(alvo, Buffer.from(await r.arrayBuffer()));
    ok++;
  }
}
console.log(`\n${ok} fotos, ${falhas} falhas`);
