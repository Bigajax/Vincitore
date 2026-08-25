import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { repo } from "@/lib/repo";
import { site } from "@/data/site.config";
import { capa, type Produto } from "@/lib/types";
import ProdutoCliente from "@/components/site/ProdutoCliente";
import CardProduto from "@/components/site/CardProduto";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const produtos = await repo().listarPublicos();
  return produtos.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const produto = await repo().buscarPorSlug(slug);
  if (!produto) return {};
  const foto = capa(produto);
  return {
    title: produto.nome,
    description: produto.descricao || `${produto.nome}, ${produto.composicao}`,
    alternates: { canonical: `/p/${produto.slug}` },
    openGraph: {
      title: `${produto.nome} | ${site.nome}`,
      description: produto.descricao,
      url: `${site.url}/p/${produto.slug}`,
      type: "website",
      images: foto ? [{ url: foto.url, alt: foto.alt ?? produto.nome }] : [],
    },
  };
}

export default async function PaginaProduto({ params }: Props) {
  const { slug } = await params;
  const dados = repo();
  const produto = await dados.buscarPorSlug(slug);
  if (!produto || !produto.ativo) notFound();

  const [categorias, config, mesmaCategoria] = await Promise.all([
    dados.categorias(),
    dados.config(),
    dados.listarPublicos({ categoriaSlug: produto.categoriaSlug }),
  ]);

  const categoria = categorias.find((c) => c.slug === produto.categoriaSlug);
  const relacionados: Produto[] = mesmaCategoria
    .filter((p) => p.id !== produto.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 pb-28 md:px-10 md:py-16 md:pb-24">
      <nav aria-label="Você está em" className="rotulo mb-8 md:mb-12">
        <Link href="/" className="hover:text-ink">
          Início
        </Link>
        <span className="mx-2 text-camel">/</span>
        {categoria && (
          <>
            <Link href={`/c/${categoria.slug}`} className="hover:text-ink">
              {categoria.nome}
            </Link>
            <span className="mx-2 text-camel">/</span>
          </>
        )}
        <span className="text-ink">{produto.nome}</span>
      </nav>

      <ProdutoCliente
        produto={produto}
        numero={config.whatsapp || site.whatsapp}
      />

      {relacionados.length > 0 && (
        <section className="mt-24 border-t border-ink/10 pt-14 md:mt-32">
          <h2 className="display text-3xl md:text-4xl">Da mesma família</h2>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-8">
            {relacionados.map((p) => (
              <CardProduto key={p.id} produto={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
