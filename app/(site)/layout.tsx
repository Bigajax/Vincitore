import Cabecalho from "@/components/site/Cabecalho";
import Rodape from "@/components/site/Rodape";
import { repo } from "@/lib/repo";
import { categoriasComPecas } from "@/lib/categorias";

export const revalidate = 60;

export default async function LayoutSite({
  children,
}: {
  children: React.ReactNode;
}) {
  const dados = repo();
  const [categorias, config] = await Promise.all([
    categoriasComPecas(),
    dados.config(),
  ]);

  return (
    <>
      <Cabecalho categorias={categorias} />
      <main>{children}</main>
      <Rodape categorias={categorias} config={config} />
    </>
  );
}
