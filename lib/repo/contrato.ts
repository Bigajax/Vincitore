import type {
  Categoria,
  Config,
  FiltrosProduto,
  NovoProduto,
  Produto,
} from "@/lib/types";

export interface Repositorio {
  /** Só peças ativas — é o que a vitrine enxerga. */
  listarPublicos(filtros?: FiltrosProduto): Promise<Produto[]>;
  /** Tudo, inclusive inativas — só o painel usa. */
  listarTodos(): Promise<Produto[]>;
  buscarPorSlug(slug: string): Promise<Produto | null>;
  buscarPorId(id: string): Promise<Produto | null>;

  criarProduto(dados: NovoProduto): Promise<Produto>;
  atualizarProduto(id: string, dados: Partial<NovoProduto>): Promise<Produto>;
  alternarAtivo(id: string): Promise<void>;
  alternarDestaque(id: string): Promise<void>;
  removerProduto(id: string): Promise<void>;

  categorias(): Promise<Categoria[]>;
  config(): Promise<Config>;
  salvarConfig(dados: Config): Promise<void>;
}

/**
 * Filtragem em memória, compartilhada pelos dois adaptadores — assim a vitrine
 * se comporta igual com banco local e com Supabase.
 */
export function aplicarFiltros(
  produtos: Produto[],
  f: FiltrosProduto = {},
): Produto[] {
  let saida = produtos;

  if (f.categoriaSlug) {
    saida = saida.filter((p) => p.categoriaSlug === f.categoriaSlug);
  }
  if (f.tamanho) {
    saida = saida.filter((p) => p.tamanhos.includes(f.tamanho!));
  }
  if (f.destaque != null) {
    saida = saida.filter((p) => p.destaque === f.destaque);
  }
  if (f.busca) {
    const t = f.busca.toLowerCase().trim();
    saida = saida.filter(
      (p) =>
        p.nome.toLowerCase().includes(t) ||
        p.composicao.toLowerCase().includes(t) ||
        p.cores.some((c) => c.toLowerCase().includes(t)),
    );
  }
  return saida;
}

export function porOrdem(a: Produto, b: Produto): number {
  return a.ordem - b.ordem || a.nome.localeCompare(b.nome, "pt-BR");
}

export function destaquesPrimeiro(a: Produto, b: Produto): number {
  if (a.destaque !== b.destaque) return a.destaque ? -1 : 1;
  return porOrdem(a, b);
}
