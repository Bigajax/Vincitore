"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/marca/Logo";
import type { Categoria } from "@/lib/types";
import { site } from "@/data/site.config";

export default function Cabecalho({ categorias }: { categorias: Categoria[] }) {
  const [preso, setPreso] = useState(false);
  const [aberto, setAberto] = useState(false);
  const caminho = usePathname();

  useEffect(() => {
    const aoRolar = () => setPreso(window.scrollY > 24);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  useEffect(() => {
    document.body.style.overflow = aberto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [aberto]);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-500 ${
        preso || aberto ? "bg-ivory/95 backdrop-blur-sm" : ""
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-5 py-4 md:px-10">
        <div className="flex items-center gap-7">
          <Link
            href="/"
            aria-label={`${site.nome}, página inicial`}
            className="shrink-0"
          >
            <Logo altura={30} prioridade />
          </Link>
          {/* costura vertical: a emenda entre a marca e o menu */}
          <span
            aria-hidden
            className="costura-vertical hidden h-7 self-center lg:block"
          />
        </div>

        <nav className="hidden items-center gap-7 lg:flex">
          {categorias.map((c) => {
            const atual = caminho === `/c/${c.slug}`;
            return (
              <Link
                key={c.slug}
                href={`/c/${c.slug}`}
                aria-current={atual ? "page" : undefined}
                className="group rotulo pb-1 transition-colors hover:text-ink"
              >
                {c.nome}
                {/* alinhavo: aparece no hover, fica na categoria em que você está */}
                <span
                  aria-hidden
                  className={`costura mt-1 block transition-opacity duration-300 ${
                    atual ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={site.mapa}
            target="_blank"
            rel="noreferrer"
            className="etiqueta-mini rotulo hidden transition-colors hover:border-camel md:inline-block"
          >
            {site.cidade}
          </a>
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
            className="flex h-11 w-11 items-center justify-center lg:hidden"
          >
            <span className="relative block h-3 w-5">
              <span
                className={`absolute left-0 block h-px w-5 bg-ink transition-transform duration-300 ${
                  aberto ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 block h-px w-5 bg-ink transition-transform duration-300 ${
                  aberto ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* o cabeçalho é costurado à página, não colado com um fio sólido */}
      <span
        aria-hidden
        className={`costura block transition-opacity duration-500 ${
          preso || aberto ? "opacity-100" : "opacity-0"
        }`}
      />

      {aberto && (
        <div className="bg-ivory lg:hidden">
          <nav className="mx-auto flex max-w-[1400px] flex-col px-5 py-2">
            {categorias.map((c, i) => (
              <Link
                key={c.slug}
                href={`/c/${c.slug}`}
                onClick={() => setAberto(false)}
                className="display flex items-center justify-between gap-4 py-4 text-2xl"
              >
                <span className="flex items-baseline gap-4">
                  <span className="rotulo text-camel">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {c.nome}
                </span>
                <span aria-hidden className="ponto" />
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
