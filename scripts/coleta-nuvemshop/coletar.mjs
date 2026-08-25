/**
 * Varre usevincitore.com.br e monta o catálogo real.
 *
 * ARMADILHA: a página de produto renderiza também o carrossel de "produtos
 * relacionados". Pegar toda URL de /products/ traz as fotos dos VIZINHOS.
 * A âncora correta é o container `data-store="product-image-<LS.product.id>"`,
 * que é só do produto da página.
 *
 * O CDN da Nuvemshop não assina as URLs: o sufixo -1024-1024 vem direto.
 */
import fs from 'node:fs/promises';

const LOJA = 'https://usevincitore.com.br';
const H = { 'user-agent': 'Mozilla/5.0', referer: LOJA + '/' };
const RAIZ = 'https://dcdn-us.mitiendanube.com/stores/005/008/245/products/';

const pegar = async (u) => {
  const r = await fetch(u, { headers: H });
  if (!r.ok) throw new Error(`${r.status} em ${u}`);
  return r.text();
};

// ---------------------------------------------------------------- slugs ---
const slugs = new Set();
for (let p = 1; p <= 10; p++) {
  const html = await pegar(`${LOJA}/produtos/?page=${p}`);
  const antes = slugs.size;
  [...html.matchAll(/href="[^"]*\/produtos\/([a-z0-9-]+)\/"/g)].forEach((m) => slugs.add(m[1]));
  if (slugs.size === antes) break;
}
console.log(`${slugs.size} produtos na listagem`);

// ------------------------------------------------------------- produtos ---
const catalogo = [];
for (const slug of slugs) {
  const html = await pegar(`${LOJA}/produtos/${slug}/`);

  const id = html.match(/LS\.product\s*=\s*\{\s*id\s*:\s*(\d+)/)?.[1];
  if (!id) { console.log(`  ! sem id: ${slug}`); continue; }

  const nome = html
    .match(/<meta property="og:title" content="([^"]*)"/)?.[1]
    ?.replace(/\s*\|.*$/, '')
    .trim();

  // price_number é sempre o preço de venda; compare_at_price_number é o
  // riscado, quando há promoção. O regex não-guloso quebrava nas páginas com
  // array aninhado, então a varredura fecha os colchetes na mão.
  let preco = null, precoDe = null;
  const marca = html.indexOf("LS.variants");
  if (marca >= 0) {
    const ini = html.indexOf("[", marca);
    let nivel = 0, fim = ini;
    for (let i = ini; i < html.length; i++) {
      if (html[i] === "[") nivel++;
      else if (html[i] === "]" && --nivel === 0) { fim = i + 1; break; }
    }
    try {
      const a = JSON.parse(html.slice(ini, fim))[0] ?? {};
      preco = a.price_number ?? null;
      precoDe = a.compare_at_price_number ?? null;
    } catch {
      /* deixa nulo: vira "Consulte" na vitrine */
    }
  }

  // Só o que está dentro do container do próprio produto. O fim é o PRÓXIMO
  // `data-store="product-`: sem esse corte, a varredura invade o carrossel de
  // relacionados e a jaqueta acaba com fotos de camiseta.
  const abre = html.indexOf(`data-store="product-image-${id}"`);
  const bloco = html.slice(abre);
  const fim = bloco.indexOf('data-store="product-', 10);
  const galeria = fim > 0 ? bloco.slice(0, fim) : bloco;
  const fotos = [
    ...new Set(
      [...galeria.matchAll(/\/products\/([^"'\s?]+?)-\d+-\d+\.(webp|jpg|png)/g)].map(
        (m) => `${RAIZ}${m[1]}-1024-1024.${m[2]}`,
      ),
    ),
  ];

  // Produto de foto única não monta swiper, e aí o corte acima zera a lista.
  // O og:image é sempre a capa do próprio produto — serve de rede.
  if (!fotos.length) {
    const og = html.match(/<meta property="og:image" content="([^"]*)"/)?.[1] ?? "";
    const m = og.match(/\/products\/([^"'\s?]+?)-\d+-\d+\.(webp|jpg|png)/);
    if (m) fotos.push(`${RAIZ}${m[1]}-1024-1024.${m[2]}`);
  }

  const migalha = [...html.matchAll(/itemprop="name">\s*([^<]+?)\s*</g)].map((m) => m[1].trim());

  catalogo.push({ slug, id, nome, preco, precoDe, fotos, migalha });
  console.log(`  ${String(fotos.length)} foto(s)  R$${preco}${precoDe ? ` (de ${precoDe})` : ''}  ${nome}`);
}

await fs.writeFile('_nuvem/catalogo.json', JSON.stringify(catalogo, null, 2));
console.log(`\n${catalogo.length} produtos, ${catalogo.reduce((s, p) => s + p.fotos.length, 0)} fotos`);
