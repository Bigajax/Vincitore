/**
 * Identidade e canais da VINCITORE.
 * Tudo que muda de loja para loja mora aqui — nada de texto institucional
 * espalhado pelas páginas.
 */
/**
 * Variável de ambiente vazia conta como ausente.
 *
 * `??` só cai no padrão quando o valor é null/undefined. Na Vercel, uma
 * variável declarada sem valor chega como string vazia e passa direto — foi
 * assim que `new URL("")` derrubou o build.
 *
 * A leitura precisa ser literal: `process.env[chave]` não é inlinado no bundle.
 */
function comPadrao(valor: string | undefined, padrao: string): string {
  const limpo = valor?.trim();
  return limpo ? limpo : padrao;
}

export const site = {
  nome: "VINCITORE",
  assinatura: "Design in Italy · Milano 1991",
  slogan: "Alfaiataria contemporânea em fios nobres.",
  descricao:
    "Moda masculina premium em Gravataí/RS. Tricôs, sobretudos, camisas e calçados em algodão egípcio, pima e fio italiano. Atendimento por WhatsApp e loja física.",
  // sem barra no fim: a URL é concatenada em `${site.url}/p/${slug}`
  url: comPadrao(process.env.NEXT_PUBLIC_SITE_URL, "https://vincitore.com.br").replace(/\/+$/, ""),
  whatsapp: comPadrao(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMERO,
    "5551989431465",
  ).replace(/\D/g, ""),
  instagram: "https://www.instagram.com/vincitore.br/",
  instagramHandle: "@vincitore.br",
  tiktok: "https://www.tiktok.com/@vincitore.br",
  tiktokHandle: "@vincitore.br",
  email: "usevincitore@gmail.com",
  cidade: "Gravataí, RS",
  endereco: "Rua Anápio Gomes, 1337 · Centro",
  cep: "94010-011",
  mapa: "https://maps.app.goo.gl/cKfw1QXWiNTsKdEZ7",
  horarioSemana: "Segunda a sexta · 09h às 19h",
  horarioSabado: "Sábado · 09h às 18h",
} as const;

/** Os três fios — a assinatura da página inicial. */
export const fios = [
  {
    numeral: "I",
    nome: "Algodão Egípcio",
    linha:
      "Fibra extralonga colhida à mão. Rende um tecido mais liso, mais resistente e que não desbota com o uso.",
  },
  {
    numeral: "II",
    nome: "Fio Pima",
    linha:
      "Maciez imediata e caimento que não deforma. É o fio que faz uma camiseta simples parecer outra coisa.",
  },
  {
    numeral: "III",
    nome: "Fio Italiano",
    linha:
      "Torção fechada e acabamento de alfaiataria. Estrutura no ombro, leveza no corpo.",
  },
] as const;

/** Textos institucionais — centralizados, nunca hardcoded em página. */
export const textos = {
  /** A última palavra sai em itálico — é a inflexão de voz do título. */
  heroTitulo: {
    linha1: "A elegância",
    linha2: "não tem ",
    destaque: "pressa.",
  },
  heroLinha:
    "Peças selecionadas em algodão egípcio, pima e fio italiano. Para quem escolhe uma vez e usa por anos.",
  /** A etiqueta costurada no hero: os fatos da marca, em tarja de camel. */
  heroEtiqueta: ["Milano 1991", "Alfaiataria contemporânea", "Hora marcada"],
  /** Ourela: corre na vertical na emenda entre o texto e a foto (só no desktop). */
  heroOurela: "Design in Italy",
  /** Ourela: os fios que correm na faixa entre o hero e os destaques. */
  marquee: [
    "Algodão Egípcio",
    "Fio Pima",
    "Fio Italiano",
    "Alfaiataria Contemporânea",
    "6% Cashmere",
  ],
  destaquesEyebrow: "Seleção da estação",
  destaquesTitulo: "Inverno 26",
  categoriasEyebrow: "O catálogo",
  categoriasTitulo: "Por categoria",
  fiosEyebrow: "O que veste por dentro",
  fiosTitulo: "Os fios",
  lojaEyebrow: "Loja física",
  lojaTitulo: "Venha experimentar.",
  lojaLinha:
    "Atendimento presencial e agendado. Prove as peças, sinta o fio e leve no mesmo dia.",
  rodapeLinha: "Moda masculina premium desde sempre em fios nobres.",
} as const;
