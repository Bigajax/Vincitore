import { protegerPagina } from "@/lib/auth";

export default async function LayoutPainel({
  children,
}: {
  children: React.ReactNode;
}) {
  // proteção real — o proxy.ts só faz a checagem barata de cookie
  await protegerPagina();
  return <>{children}</>;
}
