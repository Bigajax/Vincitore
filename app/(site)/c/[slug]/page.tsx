import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { repo } from "@/lib/repo";
import { site } from "@/data/site.config";
import GradeCategoria from "@/components/site/GradeCategoria";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const categorias = await repo().categorias();
  return categorias.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categoria = (await repo().categorias()).find((c) => c.slug === slug);
  if (!categoria) return {};
  return {
    title: categoria.nome,
    description: `${categoria.nome} da ${site.nome}. ${site.slogan}`,
    alternates: { canonical: `/c/${categoria.slug}` },
  };
}

export default async function PaginaCategoria({ params }: Props) {
  const { slug } = await params;
  const dados = repo();
  const [categorias, produtos] = await Promise.all([
    dados.categorias(),
    dados.listarPublicos({ categoriaSlug: slug }),
  ]);

  const categoria = categorias.find((c) => c.slug === slug);
  if (!categoria) notFound();

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-10 md:py-20">
      <nav aria-label="Você está em" className="rotulo">
        <Link href="/" className="hover:text-ink">
          Início
        </Link>
        <span className="mx-2 text-camel">/</span>
        <span className="text-ink">{categoria.nome}</span>
      </nav>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-6 md:mt-12">
        <h1 className="display text-5xl md:text-7xl">{categoria.nome}</h1>
        <p className="rotulo">
          {produtos.length} {produtos.length === 1 ? "peça" : "peças"}
        </p>
      </div>

      {produtos.length === 0 ? (
        <div className="border-t border-ink/10 py-24 text-center">
          <p className="display text-2xl">Ainda não há peças nesta categoria.</p>
          <p className="mt-3 text-sm text-stone">
            Fale com a gente no WhatsApp. Provavelmente temos na loja.
          </p>
          <Link href="/" className="btn btn-linha mt-8">
            Voltar ao início
          </Link>
        </div>
      ) : (
        <GradeCategoria produtos={produtos} />
      )}
    </div>
  );
}
