import "server-only";
import { repo } from "@/lib/repo";
import type { Categoria } from "@/lib/types";

export type CategoriaComTotal = Categoria & { total: number };

/**
 * As categorias que a vitrine mostra: só as que têm peça.
 *
 * Categoria vazia não vira faixa "Em breve" nem entra no menu — o catálogo
 * mostra o que existe. A rota /c/<slug> continua respondendo (com o estado
 * vazio) para não quebrar link antigo, mas ninguém chega nela pela navegação.
 */
export async function categoriasComPecas(): Promise<CategoriaComTotal[]> {
  const dados = repo();
  const [categorias, produtos] = await Promise.all([
    dados.categorias(),
    dados.listarPublicos(),
  ]);

  const total = new Map<string, number>();
  produtos.forEach((p) =>
    total.set(p.categoriaSlug, (total.get(p.categoriaSlug) ?? 0) + 1),
  );

  return categorias
    .filter((c) => (total.get(c.slug) ?? 0) > 0)
    .map((c) => ({ ...c, total: total.get(c.slug) ?? 0 }));
}
