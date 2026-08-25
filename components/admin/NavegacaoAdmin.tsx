import Link from "next/link";
import Logo from "@/components/marca/Logo";
import { acaoSair } from "@/app/admin/acoes";

export default function NavegacaoAdmin({ atual }: { atual: "pecas" | "config" }) {
  const item = (href: string, chave: string, texto: string) => (
    <Link
      href={href}
      className={`rotulo py-2 transition-colors ${
        atual === chave ? "text-ink" : "hover:text-ink"
      }`}
    >
      {texto}
      {atual === chave && <span className="mt-1 block h-px bg-camel" />}
    </Link>
  );

  return (
    <header className="border-b border-ink/10 bg-ivory">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-5">
          <Logo altura={22} />
          <span className="rotulo hidden text-camel sm:inline">Painel</span>
        </div>

        <nav className="flex items-center gap-6">
          {item("/admin", "pecas", "Peças")}
          {item("/admin/config", "config", "Dados da loja")}
          <Link
            href="/"
            target="_blank"
            className="rotulo transition-colors hover:text-ink"
          >
            Ver vitrine ↗
          </Link>
          <form action={acaoSair}>
            <button type="submit" className="rotulo transition-colors hover:text-bordo">
              Sair
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
