import Image from "next/image";
import Link from "next/link";

import { repo } from "@/lib/repo";
import { categoriasComPecas } from "@/lib/categorias";
import { site, textos } from "@/data/site.config";
import { waAgendamento } from "@/lib/whatsapp";

import Reveal from "@/components/site/Reveal";
import Marquee from "@/components/site/Marquee";
import CardProduto from "@/components/site/CardProduto";
import FaixaCategoria from "@/components/site/FaixaCategoria";
import BlocoFios from "@/components/site/BlocoFios";
import TituloSecao from "@/components/site/TituloSecao";

export const revalidate = 60;

export default async function Home() {
  const dados = repo();
  const [produtos, categorias, config] = await Promise.all([
    dados.listarPublicos(),
    categoriasComPecas(),
    dados.config(),
  ]);

  const destaques = produtos.filter((p) => p.destaque).slice(0, 3);
  return (
    <>
      {/* 1 — Hero assimétrico ------------------------------------------- */}
      <section className="relative border-b border-ink/10">
        <div className="mx-auto grid max-w-[1400px] items-center gap-0 md:grid-cols-2">
          <div className="relative flex flex-col justify-center px-5 py-14 md:px-10 md:py-24">
            <h1 className="display text-[2.75rem] leading-[1.03] md:text-6xl lg:text-7xl">
              <span className="block">{textos.heroTitulo.linha1}</span>
              <span className="block">
                {textos.heroTitulo.linha2}
                <em className="font-normal italic">
                  {textos.heroTitulo.destaque}
                </em>
              </span>
            </h1>

            {/* alinhavo: a linha de costura só aparece onde a marca fala */}
            <hr className="costura mt-8 w-24" />

            <p className="mt-6 max-w-md text-base leading-relaxed text-stone">
              {textos.heroLinha}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/c/sobretudos-casacos" className="btn btn-bordo">
                Ver a coleção
              </Link>
              <a
                href={waAgendamento(config.whatsapp || site.whatsapp)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-linha"
              >
                Agendar atendimento
              </a>
            </div>

            {/* a tarja costurada na gola */}
            <ul className="etiqueta rotulo mt-11 self-start">
              {textos.heroEtiqueta.map((item, i) => (
                <li key={item} className="flex items-center gap-3.5 whitespace-nowrap">
                  {item}
                  {i < textos.heroEtiqueta.length - 1 && (
                    <span aria-hidden className="ponto" />
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* a foto como prancha emoldurada, não como painel sangrado */}
          <div className="relative flex items-center justify-center px-11 py-14 md:px-16 md:py-20">
            <div className="moldura relative aspect-3/4 w-full max-w-[26rem]">
              <Image
                src="/fotos/ambiente-arara-sobretudos.jpg"
                alt="Arara com sobretudos de lã camel e navy sob a luz do sol"
                fill
                priority
                sizes="(max-width: 768px) 78vw, 26rem"
                className="object-cover object-center"
              />
            </div>

            {/* ourela: impressa na borda da prancha */}
            <span
              aria-hidden
              className="ourela absolute top-1/2 right-4 hidden -translate-y-1/2 lg:block"
            >
              {textos.heroOurela}
            </span>
          </div>
        </div>
      </section>

      {/* 2 — Faixa dos fios --------------------------------------------- */}
      <Marquee />

      {/* 3 — Destaques escalonados ------------------------------------- */}
      {destaques.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-32">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">{textos.destaquesEyebrow}</p>
              <TituloSecao className="mt-4 text-4xl md:text-6xl">
                {textos.destaquesTitulo}
              </TituloSecao>
            </div>
            <Link
              href="/c/sobretudos-casacos"
              className="group rotulo pb-1 text-camel transition-colors hover:text-ink"
            >
              Ver a coleção inteira
              <span className="costura mt-1.5 block w-full opacity-60 transition-opacity group-hover:opacity-100" />
            </Link>
          </Reveal>

          {/* escalonamento descendente: cada coluna desce um degrau,
              como uma dupla de página de editorial */}
          <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-[1.25fr_1fr_1fr] md:gap-8">
            {destaques.map((p, i) => (
              <Reveal
                key={p.id}
                atraso={i * 120}
                className={i === 1 ? "md:mt-20" : i === 2 ? "md:mt-40" : ""}
              >
                <CardProduto
                  produto={p}
                  prioridade={i === 0}
                  numeral={`0${i + 1}`}
                />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* 4 — Categorias em faixas --------------------------------------- */}
      <section className="bg-ink">
        <div className="mx-auto max-w-[1400px] px-5 pt-20 pb-2 md:px-10 md:pt-28">
          <p className="eyebrow text-ivory/40">{textos.categoriasEyebrow}</p>
          <TituloSecao className="mt-4 text-4xl text-ivory md:text-6xl">
            {textos.categoriasTitulo}
          </TituloSecao>
        </div>
        <div className="mx-auto mt-10 max-w-[1400px]">
          {categorias.map((c, i) => (
            <FaixaCategoria key={c.slug} categoria={c} indice={i} />
          ))}
        </div>
      </section>

      {/* 5 — Os fios (assinatura) --------------------------------------- */}
      <BlocoFios />

      {/* 6 — Loja física ------------------------------------------------- */}
      <section className="border-t border-ink/10 bg-ivory-2">
        <div className="mx-auto grid max-w-[1400px] gap-0 md:grid-cols-2">
          <div className="flex flex-col justify-center px-5 py-16 md:px-10 md:py-28">
            <p className="eyebrow">{textos.lojaEyebrow}</p>
            <TituloSecao className="mt-4 text-4xl md:text-5xl">
              {textos.lojaTitulo}
            </TituloSecao>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-stone">
              {textos.lojaLinha}
            </p>

            <hr className="costura my-8 w-24" />

            <address className="space-y-1 text-sm not-italic leading-relaxed">
              <a
                href={site.mapa}
                target="_blank"
                rel="noreferrer"
                className="block transition-colors hover:text-bordo"
              >
                {config.endereco || `${site.endereco} · ${site.cidade}`}
              </a>
              <span className="block pt-3 text-stone">
                {config.horarioSemana || site.horarioSemana}
              </span>
              <span className="block text-stone">
                {config.horarioSabado || site.horarioSabado}
              </span>
            </address>

            <a
              href={waAgendamento(config.whatsapp || site.whatsapp)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-bordo mt-8 self-start"
            >
              Agendar pelo WhatsApp
            </a>
          </div>

          {/* a loja fecha a página emoldurada, como o hero a abre */}
          <div className="flex items-center justify-center px-11 py-14 md:px-16 md:py-20">
            <div className="moldura relative aspect-3/4 w-full max-w-[26rem]">
              <Image
                src="/fotos/ambiente-arara-sueteres.jpg"
                alt="Arara de suéteres claros na loja VINCITORE"
                fill
                sizes="(max-width: 768px) 78vw, 26rem"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
