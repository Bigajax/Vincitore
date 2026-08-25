"use client";

import { useMemo, useState } from "react";
import CardProduto from "@/components/site/CardProduto";
import type { Produto } from "@/lib/types";

/** Grade da categoria com filtro de tamanho — tudo client-side, sem recarga. */
export default function GradeCategoria({ produtos }: { produtos: Produto[] }) {
  const [tamanho, setTamanho] = useState<string | null>(null);

  const tamanhos = useMemo(() => {
    const ordem = ["PP", "P", "M", "G", "GG", "XG"];
    const set = new Set<string>();
    produtos.forEach((p) => p.tamanhos.forEach((t) => set.add(t)));
    return [...set].sort((a, b) => {
      const ia = ordem.indexOf(a);
      const ib = ordem.indexOf(b);
      if (ia >= 0 && ib >= 0) return ia - ib;
      if (ia >= 0) return -1;
      if (ib >= 0) return 1;
      return a.localeCompare(b, "pt-BR", { numeric: true });
    });
  }, [produtos]);

  const visiveis = tamanho
    ? produtos.filter((p) => p.tamanhos.includes(tamanho))
    : produtos;

  return (
    <>
      {tamanhos.length > 0 && (
        <div className="mt-10 flex flex-wrap items-center gap-3 pb-6">
          <span className="rotulo mr-1">Tamanho</span>
          <button
            type="button"
            onClick={() => setTamanho(null)}
            data-on={tamanho === null}
            className="pill"
          >
            Todos
          </button>
          {tamanhos.map((t) => (
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
      )}

      <hr className="costura" />

      {visiveis.length === 0 ? (
        <p className="py-24 text-center text-stone">
          Nenhuma peça neste tamanho por enquanto.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-14 md:grid-cols-3 md:gap-x-8 md:gap-y-16 lg:grid-cols-4">
          {visiveis.map((p, i) => (
            <CardProduto key={p.id} produto={p} prioridade={i < 4} />
          ))}
        </div>
      )}
    </>
  );
}
