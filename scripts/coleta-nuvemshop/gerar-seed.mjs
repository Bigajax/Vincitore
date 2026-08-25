/**
 * Gera data/seed.ts a partir de _nuvem/catalogo.json.
 *
 * O que vem da loja: nome, preço, preço riscado e fotos.
 * O que é escrito aqui: categoria, composição, tamanhos, cores e descrição —
 * a loja não expõe nada disso de forma confiável.
 */
import fs from "node:fs/promises";

const P = ["P", "M", "G", "GG"];
const N = ["38", "39", "40", "41", "42", "43", "44"];

// slug da Nuvemshop -> ficha editorial
const FICHA = {
  "sapato-social-masculino-classico-3y2hz": {
    nome: "Sapato Derby Brogue Marrom", cat: "calcados", tam: N, cores: ["Marrom"],
    comp: "Couro legítimo · solado de borracha",
    desc: "Derby com broguing na gala e na lateral. O sapato que resolve casamento, reunião e jantar sem trocar de par.",
  },
  "sapato-social-masculino-classico-3t7pa": {
    nome: "Sapato Social Bico Fino", cat: "calcados", tam: N, cores: ["Marrom"],
    comp: "Couro legítimo · forro em couro",
    desc: "Bico afilado e costura fechada. Discreto o bastante para usar todo dia, bonito o bastante para não parecer sapato de trabalho.",
  },
  "tenis-casual-em-camurca-masculina-45bmp": {
    nome: "Tênis Casual em Camurça", cat: "calcados", tam: N, cores: ["Cinza"],
    comp: "Camurça · solado leve",
    desc: "Camurça cinza e solado branco baixo. Vai com calça de alfaiataria sem soar esportivo.",
  },
  "jaqueta-leno-la-ecologica-vincitore-nr14k": {
    nome: "Jaqueta Leno em Lã Ecológica", cat: "sobretudos-casacos", tam: P, cores: ["Preto"],
    comp: "Lã ecológica · forro acetinado",
    desc: "Comprimento no quadril, gola esporte e zíper central. A peça de meia-estação que fecha o look sem pedir camisa.",
  },
  "casaco-100-la-montgomery-1ivlp": {
    nome: "Casaco Montgomery 100% Lã", cat: "sobretudos-casacos", tam: P, cores: ["Preto"],
    comp: "100% lã · gola xale em tricô",
    desc: "Gola xale em tricô, botões frontais e bolsos com aba. Lã pesada de verdade, para o frio que não pede licença.",
  },
  "casaco-la-ecologica-gola-shelb-bin-70i2o": {
    nome: "Casaco com Capuz em Lã Ecológica", cat: "sobretudos-casacos", tam: P, cores: ["Verde-escuro"],
    comp: "Lã ecológica · capuz forrado",
    desc: "Capuz forrado, fechos frontais e bolsos com aba. Estrutura no ombro e leveza no corpo.",
  },
  "jaqueta-em-veludo-96jxa": {
    nome: "Jaqueta em Veludo Cotelê", cat: "sobretudos-casacos", tam: P, cores: ["Preto"],
    comp: "Veludo cotelê · botões de pressão",
    desc: "Modelagem trucker em cotelê fino. O veludo dá textura onde o jeans daria só volume.",
  },
  "casaco-em-veludo-ingles-1djgs": {
    nome: "Casaco em Veludo Inglês", cat: "sobretudos-casacos", tam: P, cores: ["Grafite"],
    comp: "Veludo inglês · forro acetinado",
    desc: "Veludo de risca fechada, caimento reto e bolsos embutidos. Cai bem sobre tricô e sobre camisa.",
  },
  "casaco-de-la-madri-1rd06": {
    nome: "Casaco de Lã Madri", cat: "sobretudos-casacos", tam: P, cores: ["Cinza", "Azul"],
    comp: "Lã batida · gola alta em contraste",
    desc: "Gola alta em contraste e fechamento por botões. Corte curto que alonga sem encurtar o tronco.",
  },
  "casaco-de-la-ecologica-167pd": {
    nome: "Casaco de Lã Ecológica", cat: "sobretudos-casacos", tam: P,
    cores: ["Off-white", "Caramelo", "Azul", "Cinza"],
    comp: "Lã ecológica · forro acetinado",
    desc: "Modelagem estruturada no ombro e leve no corpo, comprimento até a coxa. É o casaco que atravessa estações.",
  },
  "jaqueta-2-1-impermeavel-chile-1d7r9": {
    nome: "Jaqueta 2 em 1 Impermeável", cat: "sobretudos-casacos", tam: P, cores: ["Verde militar", "Preto"],
    comp: "Tecido técnico impermeável · forro removível",
    desc: "Forro removível: casaco de inverno e corta-vento de meia-estação na mesma peça. Feita para chuva de verdade.",
  },
  "jaqueta-em-veludo-ingles-1nk0h": {
    nome: "Jaqueta em Veludo Inglês", cat: "sobretudos-casacos", tam: P, cores: ["Grafite"],
    comp: "Veludo inglês · punho canelado",
    desc: "A versão curta do veludo inglês, com punho canelado. Para quem quer a textura sem o comprimento.",
  },
  "camisa-fibra-de-bambu-7kadu": {
    nome: "Camisa Fibra de Bambu Branca", cat: "camisas", tam: P, cores: ["Branco"],
    comp: "Fibra de bambu",
    desc: "Toque frio e caimento fluido. O bambu respira melhor que o algodão no calor e não amassa como o linho.",
  },
  "camisa-fibra-de-bambu-b56c2": {
    nome: "Camisa Fibra de Bambu Azul-claro", cat: "camisas", tam: P, cores: ["Azul-claro", "Branco"],
    comp: "Fibra de bambu",
    desc: "A mesma camisa de bambu em azul-claro. Colarinho firme, sem entretela dura.",
  },
  "camisa-social-fibra-de-bambu-152iq": {
    nome: "Camisa Social Fibra de Bambu Marinho", cat: "camisas", tam: P, cores: ["Marinho"],
    comp: "Fibra de bambu",
    desc: "Marinho profundo com leve brilho acetinado. Camisa social que não precisa de gravata para funcionar.",
  },
  "camisa-social-fibra-de-bambu-6mr3e": {
    nome: "Camisa Social Fibra de Bambu", cat: "camisas", tam: P, cores: ["Marinho"],
    comp: "Fibra de bambu",
    desc: "Corte social com punho simples. Fibra de bambu cai melhor depois da terceira lavagem, não pior.",
  },
  "camiseta-pima-1dv03": {
    nome: "Camiseta Pima", cat: "t-shirts", tam: P, cores: ["Branco", "Bege", "Marinho"],
    comp: "Fio Pima",
    desc: "Gola careca reforçada e gramatura média. O básico que segura a forma, em fio pima, que é o que faz a diferença aqui.",
  },
  "sueter-classic-gola-v-vwfa1": {
    nome: "Suéter Classic Gola V", cat: "tricos", tam: P, cores: ["Preto"],
    comp: "Fio italiano",
    desc: "Gola V rasa e malha lisa. Vai por baixo do casaco sem criar volume no ombro.",
  },
  "tricot-tramado-vincitore-12o8u": {
    nome: "Tricô Tramado Bordô", cat: "tricos", tam: P, cores: ["Bordô"],
    comp: "Fio italiano com 6% cashmere",
    desc: "O ponto trançado fechado dá volume sem peso e sustenta a forma lavagem após lavagem. A peça-assinatura do inverno.",
  },
};

const ORDEM_CAT = ["tricos", "sobretudos-casacos", "camisas", "t-shirts", "calcas", "calcados"];
const DESTAQUES = [
  "casaco-de-la-ecologica-167pd",
  "tricot-tramado-vincitore-12o8u",
  "casaco-100-la-montgomery-1ivlp",
];

const semAcento = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "");

const catalogo = JSON.parse(await fs.readFile("_nuvem/catalogo.json", "utf8"));
const contador = {};
const produtos = [];
const semFicha = [];

for (const p of catalogo) {
  const f = FICHA[p.slug];
  if (!f) { semFicha.push(`${p.slug} (${p.nome})`); continue; }

  contador[f.cat] = (contador[f.cat] ?? 0) + 1;
  const slug = semAcento(f.nome).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  produtos.push({
    id: `prd-${slug}`,
    nome: f.nome,
    slug,
    descricao: f.desc,
    composicao: f.comp,
    categoriaSlug: f.cat,
    preco: p.precoDe ?? p.preco,
    precoPromocional: p.precoDe ? p.preco : null,
    tamanhos: f.tam,
    cores: f.cores,
    destaque: DESTAQUES.includes(p.slug),
    ordem: contador[f.cat],
    imagens: p.fotos.map((_, i) => ({
      url: `/fotos/${p.slug}-${String(i).padStart(2, "0")}.webp`,
      alt: `${f.nome}${f.cores[i] ? ` na cor ${f.cores[i].toLowerCase()}` : ""}`,
      ordem: i,
    })),
  });
}

produtos.sort(
  (a, b) =>
    ORDEM_CAT.indexOf(a.categoriaSlug) - ORDEM_CAT.indexOf(b.categoriaSlug) ||
    a.ordem - b.ordem,
);

const j = (v) => JSON.stringify(v);
const corpo = produtos
  .map((p) => `  {
    id: ${j(p.id)},
    nome: ${j(p.nome)},
    slug: ${j(p.slug)},
    descricao:
      ${j(p.descricao)},
    composicao: ${j(p.composicao)},
    categoriaSlug: ${j(p.categoriaSlug)},
    preco: ${p.preco ?? "null"},
    precoPromocional: ${p.precoPromocional ?? "null"},
    tamanhos: ${j(p.tamanhos)},
    cores: ${j(p.cores)},
    destaque: ${p.destaque},
    ativo: true,
    ordem: ${p.ordem},
    imagens: [
${p.imagens.map((i) => `      img(${j(i.url)}, ${j(i.alt)}, ${i.ordem}),`).join("\n")}
    ],
    criadoEm: "2026-08-25T12:00:00.000Z",
  },`)
  .join("\n");

const antigo = await fs.readFile("data/seed.ts", "utf8");
const cabeca = antigo
  .slice(0, antigo.indexOf("export const produtosSeed"))
  .replace(
    " * As peças e as fotos vieram do feed do @vincitore.br (out/2026). Preços marcados",
    " * As peças, os preços e as fotos (1024x1280) vieram do catálogo da loja em\n * usevincitore.com.br. Preços marcados",
  );
const rabo = antigo.slice(antigo.indexOf("export const configSeed"));

await fs.writeFile(
  "data/seed.ts",
  `${cabeca}export const produtosSeed: Produto[] = [\n${corpo}\n];\n\n${rabo}`,
);

console.log(`${produtos.length} peças geradas`);
console.log(Object.entries(contador).map(([c, n]) => `  ${c}: ${n}`).join("\n"));
if (semFicha.length) console.log(`\nsem ficha (ignoradas):\n  ${semFicha.join("\n  ")}`);
