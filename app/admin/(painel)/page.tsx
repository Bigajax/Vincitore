import NavegacaoAdmin from "@/components/admin/NavegacaoAdmin";
import ListaPecas from "@/components/admin/ListaPecas";
import { repo } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function PainelPecas({
  searchParams,
}: {
  searchParams: Promise<{ salvo?: string }>;
}) {
  const { salvo } = await searchParams;
  const dados = repo();
  const [produtos, categorias] = await Promise.all([
    dados.listarTodos(),
    dados.categorias(),
  ]);

  return (
    <>
      <NavegacaoAdmin atual="pecas" />

      <main className="mx-auto max-w-5xl px-5 py-10">
        {salvo && (
          <p
            role="status"
            className="mb-6 border-l-2 border-camel bg-ivory px-4 py-3 text-sm"
          >
            Peça salva.
          </p>
        )}

        <ListaPecas produtos={produtos} categorias={categorias} />
      </main>
    </>
  );
}
