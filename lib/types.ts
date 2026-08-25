export type Categoria = {
  id: string;
  nome: string;
  slug: string;
  ordem: number;
  ativa: boolean;
  /** foto de fundo da faixa, em full-bleed */
  capa?: string;
  /** enquadramento da capa (object-position), p.ex. "center 30%" */
  capaPos?: string;
};

export type ImagemProduto = {
  id: string;
  url: string;
  alt?: string;
  ordem: number;
};

export type Produto = {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  composicao: string;
  categoriaSlug: string;
  /** null = "Consulte" */
  preco: number | null;
  precoPromocional: number | null;
  tamanhos: string[];
  cores: string[];
  destaque: boolean;
  ativo: boolean;
  ordem: number;
  imagens: ImagemProduto[];
  criadoEm: string;
};

export type NovoProduto = Omit<Produto, "id" | "criadoEm">;

export type Config = {
  whatsapp: string;
  instagram: string;
  endereco: string;
  horarioSemana: string;
  horarioSabado: string;
  linkAgendamento: string;
};

export type FiltrosProduto = {
  categoriaSlug?: string;
  tamanho?: string;
  destaque?: boolean;
  busca?: string;
};

/** Preço efetivo: promocional quando existe. */
export function precoEfetivo(p: Produto): number | null {
  return p.precoPromocional ?? p.preco;
}

export function temDesconto(p: Produto): boolean {
  return p.precoPromocional != null && p.preco != null && p.precoPromocional < p.preco;
}

export function capa(p: Produto): ImagemProduto | undefined {
  return [...p.imagens].sort((a, b) => a.ordem - b.ordem)[0];
}

export function segundaFoto(p: Produto): ImagemProduto | undefined {
  return [...p.imagens].sort((a, b) => a.ordem - b.ordem)[1];
}

export function imagensOrdenadas(p: Produto): ImagemProduto[] {
  return [...p.imagens].sort((a, b) => a.ordem - b.ordem);
}
