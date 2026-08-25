import Link from "next/link";
import { notFound } from "next/navigation";

import NavegacaoAdmin from "@/components/admin/NavegacaoAdmin";
import FormularioProduto from "@/components/admin/FormularioProduto";
import { repo } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function EditarPeca({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dados = repo();
  const [produto, categorias] = await Promise.all([
    dados.buscarPorId(id),
    dados.categorias(),
  ]);
  if (!produto) notFound();

  return (
    <>
      <NavegacaoAdmin atual="pecas" />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <Link href="/admin" className="rotulo hover:text-ink">
          ← Peças
        </Link>
        <div className="mt-6 mb-10 flex flex-wrap items-end justify-between gap-4">
          <h1 className="display text-4xl">{produto.nome}</h1>
          <Link
            href={`/p/${produto.slug}`}
            target="_blank"
            className="rotulo hover:text-ink"
          >
            Ver na vitrine ↗
          </Link>
        </div>
        <FormularioProduto categorias={categorias} produto={produto} />
      </main>
    </>
  );
}
