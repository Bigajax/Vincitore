"use client";

import { useEffect, useRef } from "react";

/**
 * Diálogo do painel sobre o `<dialog>` nativo: já traz armadilha de foco,
 * Esc para fechar e o backdrop, sem biblioteca.
 *
 * O corpo rola por dentro, então o rodapé de ações fica sempre à vista — é
 * lá que mora o "Salvar peça", que aponta para o formulário por `form={id}`.
 */
export default function ModalPeca({
  titulo,
  eyebrow,
  aoFechar,
  rodape,
  children,
}: {
  titulo: string;
  eyebrow?: string;
  aoFechar: () => void;
  rodape?: React.ReactNode;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const corpo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (!d.open) d.showModal();

    // showModal() foca o primeiro elemento e o navegador rola até ele; o
    // diálogo abria no meio do formulário. Volta ao topo e foca o 1º campo.
    corpo.current?.scrollTo({ top: 0 });
    d.querySelector<HTMLElement>("input, select, textarea")?.focus({ preventScroll: true });

    const travado = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = travado;
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="dialogo"
      aria-label={titulo}
      onCancel={(e) => {
        e.preventDefault();
        aoFechar();
      }}
      // clicar no fundo fecha: o alvo do clique é o próprio dialog
      onClick={(e) => {
        if (e.target === ref.current) aoFechar();
      }}
    >
      <div className="flex h-screen w-screen items-center justify-center p-3 md:p-8">
        <div className="flex max-h-full w-full max-w-3xl flex-col border border-ink/12 bg-ivory-2 shadow-2xl">
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-ink/10 px-5 py-4 md:px-8">
            <div className="min-w-0">
              {eyebrow && <p className="eyebrow">{eyebrow}</p>}
              <h2 className="display mt-1 truncate text-2xl md:text-3xl">
                {titulo}
              </h2>
            </div>
            <button
              type="button"
              onClick={aoFechar}
              aria-label="Fechar"
              className="flex h-11 w-11 shrink-0 items-center justify-center text-stone transition-colors hover:text-ink"
            >
              <span aria-hidden className="relative block h-4 w-4">
                <span className="absolute top-1/2 left-0 block h-px w-4 rotate-45 bg-current" />
                <span className="absolute top-1/2 left-0 block h-px w-4 -rotate-45 bg-current" />
              </span>
            </button>
          </header>

          <div
            ref={corpo}
            className="min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-8"
          >
            {children}
          </div>

          {rodape && (
            <footer className="flex shrink-0 items-center gap-3 border-t border-ink/10 px-5 py-4 md:px-8">
              {rodape}
            </footer>
          )}
        </div>
      </div>
    </dialog>
  );
}
