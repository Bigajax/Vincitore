import Link from "next/link";

import NavegacaoAdmin from "@/components/admin/NavegacaoAdmin";
import FormularioProduto from "@/components/admin/FormularioProduto";
import { repo } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function NovaPeca() {
  const categorias = await repo().categorias();

  return (
    <>
      <NavegacaoAdmin atual="pecas" />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <Link href="/admin" className="rotulo hover:text-ink">
          ← Peças
        </Link>
        <h1 className="display mt-6 mb-10 text-4xl">Nova peça</h1>
        <FormularioProduto categorias={categorias} />
      </main>
    </>
  );
}
