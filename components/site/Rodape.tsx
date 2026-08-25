import Image from "next/image";
import Link from "next/link";
import { site, textos } from "@/data/site.config";
import { waGeral } from "@/lib/whatsapp";
import type { Categoria, Config } from "@/lib/types";

export default function Rodape({
  categorias,
  config,
}: {
  categorias: Categoria[];
  config: Config;
}) {
  const numero = config.whatsapp || site.whatsapp;

  return (
    <footer className="bg-ink text-ivory">
      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] md:gap-16">
          <div>
            <Image
              src="/marca/vincitore-wordmark.png"
              alt={`${site.nome}, ${site.assinatura}`}
              width={794}
              height={200}
              sizes="200px"
              style={{ height: 40, width: "auto" }}
            />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-ivory/55">
              {textos.rodapeLinha}
            </p>
            <a
              href={waGeral(numero)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-linha btn-claro mt-8"
            >
              Falar no WhatsApp
            </a>
          </div>

          <div>
            <p className="rotulo text-ivory/40">Catálogo</p>
            <ul className="mt-5 space-y-3">
              {categorias.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/c/${c.slug}`}
                    className="text-sm text-ivory/75 transition-colors hover:text-camel"
                  >
                    {c.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="rotulo text-ivory/40">A loja</p>
            <address className="mt-5 space-y-1 text-sm not-italic leading-relaxed text-ivory/75">
              <a
                href={site.mapa}
                target="_blank"
                rel="noreferrer"
                className="block transition-colors hover:text-camel"
              >
                {config.endereco || `${site.endereco} · ${site.cidade}`}
              </a>
              <span className="block pt-3 text-ivory/55">
                {config.horarioSemana || site.horarioSemana}
              </span>
              <span className="block text-ivory/55">
                {config.horarioSabado || site.horarioSabado}
              </span>
            </address>

            <ul className="mt-6 space-y-2 text-sm">
              <li>
                <a
                  href={config.instagram || site.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ivory/75 transition-colors hover:text-camel"
                >
                  Instagram {site.instagramHandle}
                </a>
              </li>
              <li>
                <a
                  href={site.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="text-ivory/75 transition-colors hover:text-camel"
                >
                  TikTok {site.tiktokHandle}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="text-ivory/75 transition-colors hover:text-camel"
                >
                  {site.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="costura mt-16" />

        <div className="mt-8 flex flex-col gap-3 pt-8 text-xs text-ivory/35 md:flex-row md:items-center md:justify-between">
          <span>
            © {new Date().getFullYear()} {site.nome}. {site.assinatura}.
          </span>
          <span>
            Vitrine digital. A compra é finalizada no WhatsApp ou na loja física.
          </span>
        </div>
      </div>
    </footer>
  );
}
