import NavegacaoAdmin from "@/components/admin/NavegacaoAdmin";
import FormularioConfig from "@/components/admin/FormularioConfig";
import { repo } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function PainelConfig() {
  const config = await repo().config();

  return (
    <>
      <NavegacaoAdmin atual="config" />
      <main className="mx-auto max-w-xl px-5 py-10">
        <h1 className="display mb-2 text-4xl">Dados da loja</h1>
        <p className="mb-10 text-sm text-stone">
          Aparecem no rodapé, na seção da loja física e nos botões de WhatsApp.
        </p>
        <FormularioConfig config={config} />
      </main>
    </>
  );
}
