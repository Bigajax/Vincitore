"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import GerenciadorFotos from "@/components/admin/GerenciadorFotos";
import { acaoSalvarProduto, type Resposta } from "@/app/admin/acoes";
import { gerarSlug } from "@/lib/slug";
import type { Categoria, ImagemProduto, Produto } from "@/lib/types";

const TAMANHOS_PADRAO = ["PP", "P", "M", "G", "GG", "XG"];

/**
 * Uma tela só, campos na ordem do fluxo mental do lojista:
 * nome → categoria → preço → composição → tamanhos → cores → descrição → fotos.
 */
export default function FormularioProduto({
  categorias,
  produto,
  aoCancelar,
  idForm,
}: {
  categorias: Categoria[];
  produto?: Produto;
  /** dentro do modal, Cancelar fecha em vez de navegar */
  aoCancelar?: () => void;
  /** no modal o rodapé de ações vive fora do form e aponta para este id */
  idForm?: string;
}) {
  const [estado, acao, enviando] = useActionState<Resposta | null, FormData>(
    acaoSalvarProduto,
    null,
  );

  const [nome, setNome] = useState(produto?.nome ?? "");
  // peça já publicada mantém o endereço; peça nova deriva do nome
  const slugExistente = produto?.slug ?? "";
  const [tamanhos, setTamanhos] = useState<string[]>(produto?.tamanhos ?? []);
  const [cores, setCores] = useState<string[]>(produto?.cores ?? []);
  const [novaCor, setNovaCor] = useState("");
  const [fotos, setFotos] = useState<ImagemProduto[]>(produto?.imagens ?? []);

  const slugEfetivo = slugExistente || gerarSlug(nome);

  function alternarTamanho(t: string) {
    setTamanhos((atual) =>
      atual.includes(t) ? atual.filter((x) => x !== t) : [...atual, t],
    );
  }

  function adicionarCor() {
    const c = novaCor.trim();
    if (!c || cores.includes(c)) return;
    setCores([...cores, c]);
    setNovaCor("");
  }

  return (
    <form id={idForm} action={acao} className="space-y-10">
      {produto && <input type="hidden" name="id" value={produto.id} />}
      <input type="hidden" name="tamanhos" value={tamanhos.join(",")} />
      <input type="hidden" name="cores" value={cores.join(",")} />
      <input type="hidden" name="imagens" value={JSON.stringify(fotos)} />
      <input type="hidden" name="slug" value={slugEfetivo} />

      {/* identificação -------------------------------------------------- */}
      <section className="space-y-5">
        <div>
          <label htmlFor="nome" className="rotulo mb-2 block">
            Nome da peça *
          </label>
          <input
            id="nome"
            name="nome"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Suéter Tricô Trançado Bordô"
            className="campo"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="categoriaSlug" className="rotulo mb-2 block">
              Categoria *
            </label>
            <select
              id="categoriaSlug"
              name="categoriaSlug"
              required
              defaultValue={produto?.categoriaSlug ?? ""}
              className="campo"
            >
              <option value="" disabled>
                Escolha…
              </option>
              {categorias.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="composicao" className="rotulo mb-2 block">
              Composição
            </label>
            <input
              id="composicao"
              name="composicao"
              defaultValue={produto?.composicao ?? ""}
              placeholder="100% Algodão Egípcio"
              className="campo"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="preco" className="rotulo mb-2 block">
              Preço
            </label>
            <input
              id="preco"
              name="preco"
              inputMode="decimal"
              defaultValue={produto?.preco ?? ""}
              placeholder="899,90"
              className="campo"
            />
            <p className="mt-2 text-xs text-stone">Em branco = &quot;Consulte&quot;.</p>
          </div>

          <div>
            <label htmlFor="precoPromocional" className="rotulo mb-2 block">
              Preço promocional
            </label>
            <input
              id="precoPromocional"
              name="precoPromocional"
              inputMode="decimal"
              defaultValue={produto?.precoPromocional ?? ""}
              placeholder="699,90"
              className="campo"
            />
          </div>

          <div>
            <label htmlFor="ordem" className="rotulo mb-2 block">
              Ordem na categoria
            </label>
            <input
              id="ordem"
              name="ordem"
              type="number"
              min={1}
              defaultValue={produto?.ordem ?? 99}
              className="campo"
            />
          </div>
        </div>
      </section>

      {/* variações ------------------------------------------------------ */}
      <section className="space-y-5 border-t border-ink/10 pt-8">
        <div>
          <span className="rotulo mb-3 block">Tamanhos</span>
          <div className="flex flex-wrap gap-2">
            {TAMANHOS_PADRAO.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => alternarTamanho(t)}
                data-on={tamanhos.includes(t)}
                aria-pressed={tamanhos.includes(t)}
                className="pill"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="rotulo mb-3 block">Cores</span>
          <div className="flex flex-wrap items-center gap-2">
            {cores.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCores(cores.filter((x) => x !== c))}
                className="pill"
                data-on
                aria-label={`Remover cor ${c}`}
              >
                {c} ✕
              </button>
            ))}
            <input
              value={novaCor}
              onChange={(e) => setNovaCor(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  adicionarCor();
                }
              }}
              placeholder="Bordô"
              aria-label="Nova cor"
              className="campo !w-40 !py-2 text-sm"
            />
            <button type="button" onClick={adicionarCor} className="pill">
              Adicionar
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="descricao" className="rotulo mb-2 block">
            Descrição
          </label>
          <textarea
            id="descricao"
            name="descricao"
            rows={4}
            defaultValue={produto?.descricao ?? ""}
            placeholder="Duas a quatro linhas sobre o caimento, o fio e o uso."
            className="campo resize-y"
          />
        </div>
      </section>

      {/* fotos ---------------------------------------------------------- */}
      <section className="border-t border-ink/10 pt-8">
        <span className="rotulo mb-3 block">Fotos *</span>
        <GerenciadorFotos fotos={fotos} aoMudar={setFotos} />
      </section>

      {/* publicação ----------------------------------------------------- */}
      <section className="flex flex-wrap items-center gap-6 border-t border-ink/10 pt-8">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="ativo"
            defaultChecked={produto?.ativo ?? true}
            className="h-4 w-4 accent-[var(--bordo)]"
          />
          Visível na vitrine
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="destaque"
            defaultChecked={produto?.destaque ?? false}
            className="h-4 w-4 accent-[var(--bordo)]"
          />
          Mostrar nos destaques da home
        </label>
      </section>

      {estado?.mensagem && (
        <p role="alert" className="text-sm text-bordo">
          {estado.mensagem}
        </p>
      )}

      {/* no modal quem desenha as ações é o rodapé do diálogo */}
      {!idForm && (
        <div className="sticky bottom-0 -mx-5 flex items-center gap-3 border-t border-ink/10 bg-ivory-2/95 px-5 py-4 backdrop-blur-sm">
          <button type="submit" disabled={enviando} className="btn btn-bordo">
            {enviando ? "Salvando…" : "Salvar peça"}
          </button>
          {aoCancelar ? (
            <button type="button" onClick={aoCancelar} className="btn btn-linha">
              Cancelar
            </button>
          ) : (
            <Link href="/admin" className="btn btn-linha">
              Cancelar
            </Link>
          )}
        </div>
      )}
    </form>
  );
}
