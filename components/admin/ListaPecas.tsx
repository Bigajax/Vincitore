"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";

import ModalPeca from "@/components/admin/ModalPeca";
import FormularioProduto from "@/components/admin/FormularioProduto";
import {
  acaoAlternarAtivo,
  acaoAlternarDestaque,
  acaoRemoverProduto,
} from "@/app/admin/acoes";
import { brl } from "@/lib/formato";
import { capa, type Categoria, type Produto } from "@/lib/types";

const FORM_PECA = "form-peca";

export default function ListaPecas({
  produtos,
  categorias,
}: {
  produtos: Produto[];
  categorias: Categoria[];
}) {
  const [busca, setBusca] = useState("");
  const [pendente, iniciar] = useTransition();
  const [confirmando, setConfirmando] = useState<string | null>(null);
  /** null = fechado · "nova" = cadastro · Produto = edição */
  const [aberto, setAberto] = useState<Produto | "nova" | null>(null);

  const nomeCategoria = useMemo(
    () => new Map(categorias.map((c) => [c.slug, c.nome])),
    [categorias],
  );

  const visiveis = useMemo(() => {
    const t = busca.toLowerCase().trim();
    if (!t) return produtos;
    return produtos.filter(
      (p) =>
        p.nome.toLowerCase().includes(t) ||
        p.composicao.toLowerCase().includes(t) ||
        (nomeCategoria.get(p.categoriaSlug) ?? "").toLowerCase().includes(t),
    );
  }, [produtos, busca, nomeCategoria]);

  const naVitrine = produtos.filter((p) => p.ativo).length;
  const editando = aberto !== null && aberto !== "nova" ? aberto : undefined;

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-4xl">Peças</h1>
          <p className="rotulo mt-2">
            {produtos.length} cadastradas · {naVitrine} na vitrine
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAberto("nova")}
          className="btn btn-bordo"
        >
          Nova peça
        </button>
      </div>

      {produtos.length === 0 ? (
        <div className="border border-dashed border-ink/20 px-6 py-20 text-center">
          <p className="display text-2xl">Nenhuma peça cadastrada ainda.</p>
          <p className="mt-2 text-sm text-stone">Comece pela primeira.</p>
          <button
            type="button"
            onClick={() => setAberto("nova")}
            className="btn btn-bordo mt-8"
          >
            Cadastrar peça
          </button>
        </div>
      ) : (
        <>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, composição ou categoria"
            aria-label="Buscar peça"
            className="campo mb-6"
          />

          {visiveis.length === 0 ? (
            <p className="py-16 text-center text-sm text-stone">
              Nenhuma peça encontrada para “{busca}”.
            </p>
          ) : (
            <ul className="space-y-3">
              {visiveis.map((p) => {
                const foto = capa(p);
                return (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center gap-4 border border-ink/10 bg-ivory p-3"
                  >
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden border border-camel/30 bg-ivory-2">
                      {foto && (
                        <Image
                          src={foto.url}
                          alt=""
                          aria-hidden
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="display truncate text-lg">{p.nome}</p>
                      <p className="rotulo truncate">
                        {nomeCategoria.get(p.categoriaSlug) ?? p.categoriaSlug}
                        {p.tamanhos.length > 0 && ` · ${p.tamanhos.join(" ")}`}
                      </p>
                      <p className="preco mt-1 text-sm">
                        {brl(p.precoPromocional ?? p.preco)}
                      </p>
                    </div>

                    {/* estado: caixa. ação: texto. */}
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => iniciar(() => void acaoAlternarAtivo(p.id))}
                        disabled={pendente}
                        data-on={p.ativo}
                        className="pill"
                        aria-pressed={p.ativo}
                      >
                        {p.ativo ? "Visível" : "Oculta"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          iniciar(() => void acaoAlternarDestaque(p.id))
                        }
                        disabled={pendente}
                        data-on={p.destaque}
                        className="pill pill-camel"
                        aria-pressed={p.destaque}
                      >
                        Destaque
                      </button>

                      <span
                        aria-hidden
                        className="costura-vertical hidden h-6 md:block"
                      />

                      {confirmando === p.id ? (
                        <span className="flex items-center gap-3">
                          <span className="rotulo text-bordo">Excluir?</span>
                          <button
                            type="button"
                            onClick={() =>
                              iniciar(async () => {
                                await acaoRemoverProduto(p.id);
                                setConfirmando(null);
                              })
                            }
                            className="acao acao-risco text-bordo"
                          >
                            Confirmar
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmando(null)}
                            className="acao"
                          >
                            Não
                          </button>
                        </span>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setAberto(p)}
                            className="acao"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmando(p.id)}
                            className="acao acao-risco"
                          >
                            Excluir
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {aberto && (
        <ModalPeca
          titulo={editando ? editando.nome : "Nova peça"}
          eyebrow={editando ? "Editando" : "Cadastro"}
          aoFechar={() => setAberto(null)}
          rodape={
            <>
              <button type="submit" form={FORM_PECA} className="btn btn-bordo">
                Salvar peça
              </button>
              <button
                type="button"
                onClick={() => setAberto(null)}
                className="btn btn-linha"
              >
                Cancelar
              </button>
            </>
          }
        >
          <FormularioProduto
            key={editando?.id ?? "nova"}
            idForm={FORM_PECA}
            categorias={categorias}
            produto={editando}
            aoCancelar={() => setAberto(null)}
          />
        </ModalPeca>
      )}
    </>
  );
}
