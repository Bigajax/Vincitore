"use client";

import Image from "next/image";
import { useState } from "react";

import { brl } from "@/lib/formato";
import { imagensOrdenadas, temDesconto, type Produto } from "@/lib/types";
import { waProduto } from "@/lib/whatsapp";

export default function ProdutoCliente({
  produto,
  numero,
}: {
  produto: Produto;
  numero: string;
}) {
  const fotos = imagensOrdenadas(produto);
  const [atual, setAtual] = useState(0);
  const [tamanho, setTamanho] = useState<string | null>(
    produto.tamanhos.length === 1 ? produto.tamanhos[0] : null,
  );
  const [cor, setCor] = useState<string | null>(
    produto.cores.length === 1 ? produto.cores[0] : null,
  );

  const desconto = temDesconto(produto);
  const link = waProduto(produto, {
    tamanho: tamanho ?? undefined,
    cor: cor ?? undefined,
    numero,
  });

  return (
    <>
      <div className="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-16">
        {/* galeria */}
        <div>
          <div className="moldura-peca">
            <div className="relative aspect-4/5 overflow-hidden bg-ivory-2">
            {fotos[atual] && (
              <Image
                src={fotos[atual].url}
                alt={fotos[atual].alt ?? produto.nome}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 55vw"
                className="object-cover"
              />
              )}
            </div>
          </div>

          {fotos.length > 1 && (
            <div className="esconder-scroll mt-6 flex gap-3 overflow-x-auto">
              {fotos.map((f, i) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setAtual(i)}
                  aria-label={`Foto ${i + 1} de ${fotos.length}`}
                  aria-current={i === atual}
                  className={`relative aspect-4/5 w-20 shrink-0 overflow-hidden border transition-colors md:w-24 ${
                    i === atual ? "border-camel" : "border-camel/30"
                  }`}
                >
                  <Image
                    src={f.url}
                    alt=""
                    aria-hidden
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ficha */}
        <div className="md:sticky md:top-28 md:self-start">
          <h1 className="display text-4xl md:text-5xl">{produto.nome}</h1>
          <p className="rotulo mt-3 normal-case tracking-normal text-stone">
            {produto.composicao}
          </p>

          <p className="preco mt-6 text-2xl">
            {desconto && (
              <span className="mr-3 text-base text-stone line-through">
                {brl(produto.preco)}
              </span>
            )}
            <span className={desconto ? "text-bordo" : "text-ink"}>
              {brl(produto.precoPromocional ?? produto.preco)}
            </span>
          </p>

          <hr className="costura my-8 w-24" />

          {produto.descricao && (
            <p className="max-w-md text-sm leading-relaxed text-stone">
              {produto.descricao}
            </p>
          )}

          {produto.cores.length > 0 && (
            <div className="mt-8">
              <p className="rotulo">Cor</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {produto.cores.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCor(cor === c ? null : c)}
                    data-on={cor === c}
                    aria-pressed={cor === c}
                    className="pill"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {produto.tamanhos.length > 0 && (
            <div className="mt-6">
              <p className="rotulo">Tamanho</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {produto.tamanhos.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTamanho(tamanho === t ? null : t)}
                    data-on={tamanho === t}
                    aria-pressed={tamanho === t}
                    className="pill"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="btn btn-bordo mt-10 hidden w-full md:inline-flex"
          >
            Tenho interesse nesta peça
          </a>

          <p className="mt-4 hidden text-xs leading-relaxed text-stone md:block">
            A mensagem já vai preenchida com o nome da peça
            {tamanho ? ` e o tamanho ${tamanho}` : ""}. A compra é finalizada no
            WhatsApp ou na loja.
          </p>
        </div>
      </div>

      {/* barra sticky do mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-ivory/95 backdrop-blur-sm md:hidden">
        <div className="flex items-center justify-between gap-4 px-5 py-3">
          <div className="min-w-0">
            <p className="preco text-base">
              {brl(produto.precoPromocional ?? produto.preco)}
            </p>
            <p className="rotulo truncate">
              {tamanho ? `Tamanho ${tamanho}` : "Escolha o tamanho"}
            </p>
          </div>
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="btn btn-bordo shrink-0"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
