"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";

import { acaoEnviarFotos } from "@/app/admin/acoes";
import { prepararFoto } from "@/lib/imagem";
import type { ImagemProduto } from "@/lib/types";

/**
 * Upload múltiplo com reordenação por BOTÕES, não por arrastar: o lojista
 * cadastra pelo celular e o drag erra demais em tela de toque.
 * A primeira foto é sempre a capa.
 */
export default function GerenciadorFotos({
  fotos,
  aoMudar,
}: {
  fotos: ImagemProduto[];
  aoMudar: (fotos: ImagemProduto[]) => void;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const [enviando, iniciar] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [preparando, setPreparando] = useState(false);

  async function aoEscolher(e: React.ChangeEvent<HTMLInputElement>) {
    const escolhidos = Array.from(e.target.files ?? []);
    if (!escolhidos.length) return;
    setErro(null);
    setPreparando(true);

    const pacote = new FormData();
    for (const arquivo of escolhidos) {
      pacote.append("fotos", await prepararFoto(arquivo));
    }
    setPreparando(false);
    if (entrada.current) entrada.current.value = "";

    iniciar(async () => {
      const r = await acaoEnviarFotos(pacote);
      if (!r.ok || !r.urls) {
        setErro(r.mensagem ?? "Não foi possível enviar as fotos.");
        return;
      }
      aoMudar([
        ...fotos,
        ...r.urls.map((url, i) => ({
          id: `${url}#${fotos.length + i}`,
          url,
          ordem: fotos.length + i,
        })),
      ]);
    });
  }

  function mover(de: number, para: number) {
    if (para < 0 || para >= fotos.length) return;
    const copia = [...fotos];
    const [item] = copia.splice(de, 1);
    copia.splice(para, 0, item);
    aoMudar(copia.map((f, i) => ({ ...f, ordem: i })));
  }

  function remover(i: number) {
    aoMudar(fotos.filter((_, idx) => idx !== i).map((f, idx) => ({ ...f, ordem: idx })));
  }

  function definirAlt(i: number, alt: string) {
    aoMudar(fotos.map((f, idx) => (idx === i ? { ...f, alt } : f)));
  }

  const ocupado = enviando || preparando;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={entrada}
          type="file"
          accept="image/*"
          multiple
          onChange={aoEscolher}
          className="hidden"
          id="entrada-fotos"
        />
        <label
          htmlFor="entrada-fotos"
          className="btn btn-linha cursor-pointer"
          aria-disabled={ocupado}
        >
          {preparando
            ? "Preparando…"
            : enviando
              ? "Enviando…"
              : "Adicionar fotos"}
        </label>
        <span className="text-xs text-stone">
          A primeira foto é a capa. As imagens são reduzidas automaticamente
          antes de subir.
        </span>
      </div>

      {erro && (
        <p role="alert" className="mt-3 text-sm text-bordo">
          {erro}
        </p>
      )}

      {fotos.length === 0 ? (
        <p className="mt-5 border border-dashed border-ink/20 px-4 py-10 text-center text-sm text-stone">
          Nenhuma foto ainda. Adicione ao menos uma.
        </p>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {fotos.map((f, i) => (
            <li key={f.id} className="border border-ink/10 bg-ivory p-2">
              <div className="relative aspect-4/5 overflow-hidden bg-ivory-2">
                <Image
                  src={f.url}
                  alt={f.alt || `Foto ${i + 1}`}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
                {i === 0 && (
                  <span className="rotulo absolute top-2 left-2 bg-ink px-2 py-1 text-ivory">
                    Capa
                  </span>
                )}
              </div>

              <input
                type="text"
                value={f.alt ?? ""}
                onChange={(e) => definirAlt(i, e.target.value)}
                placeholder="Descrição da foto"
                aria-label={`Descrição da foto ${i + 1}`}
                className="campo mt-2 !py-1.5 text-xs"
              />

              <div className="mt-2 flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => mover(i, i - 1)}
                    disabled={i === 0}
                    aria-label="Mover para trás"
                    className="pill !min-h-11 !min-w-11 !px-0 disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => mover(i, i + 1)}
                    disabled={i === fotos.length - 1}
                    aria-label="Mover para frente"
                    className="pill !min-h-11 !min-w-11 !px-0 disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remover(i)}
                  className="rotulo px-2 text-bordo hover:underline"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
