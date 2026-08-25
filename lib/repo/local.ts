import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import type {
  Categoria,
  Config,
  FiltrosProduto,
  Produto,
} from "@/lib/types";
import { categoriasSeed, configSeed, produtosSeed } from "@/data/seed";
import { slugUnico } from "@/lib/slug";
import {
  aplicarFiltros,
  destaquesPrimeiro,
  porOrdem,
  type Repositorio,
} from "@/lib/repo/contrato";

type Banco = {
  produtos: Produto[];
  categorias: Categoria[];
  config: Config;
};

const PASTA = path.join(process.cwd(), ".dados");
const ARQUIVO = path.join(PASTA, "banco.json");

let cache: Banco | null = null;
/** Escritas serializadas para não intercalar dois writeFile no mesmo arquivo. */
let escrevendo: Promise<void> = Promise.resolve();

function bancoInicial(): Banco {
  return {
    produtos: structuredClone(produtosSeed),
    categorias: structuredClone(categoriasSeed),
    config: structuredClone(configSeed),
  };
}

async function ler(): Promise<Banco> {
  if (cache) return cache;
  try {
    const cru = await fs.readFile(ARQUIVO, "utf8");
    cache = JSON.parse(cru) as Banco;
  } catch {
    cache = bancoInicial();
    await gravar(cache);
  }
  return cache;
}

async function gravar(banco: Banco): Promise<void> {
  cache = banco;
  escrevendo = escrevendo.then(async () => {
    await fs.mkdir(PASTA, { recursive: true });
    await fs.writeFile(ARQUIVO, JSON.stringify(banco, null, 2), "utf8");
  });
  await escrevendo;
}

export function criarRepositorioLocal(): Repositorio {
  return {
    async listarPublicos(filtros: FiltrosProduto = {}) {
      const { produtos } = await ler();
      return aplicarFiltros(
        produtos.filter((p) => p.ativo),
        filtros,
      ).sort(destaquesPrimeiro);
    },

    async listarTodos() {
      const { produtos } = await ler();
      return [...produtos].sort(porOrdem);
    },

    async buscarPorSlug(slug) {
      const { produtos } = await ler();
      return produtos.find((p) => p.slug === slug) ?? null;
    },

    async buscarPorId(id) {
      const { produtos } = await ler();
      return produtos.find((p) => p.id === id) ?? null;
    },

    async criarProduto(dados) {
      const banco = await ler();
      const produto: Produto = {
        ...dados,
        id: randomUUID(),
        slug: slugUnico(dados.slug || dados.nome, banco.produtos),
        criadoEm: new Date().toISOString(),
      };
      banco.produtos.push(produto);
      await gravar(banco);
      return produto;
    },

    async atualizarProduto(id, dados) {
      const banco = await ler();
      const i = banco.produtos.findIndex((p) => p.id === id);
      if (i < 0) throw new Error("Peça não encontrada.");
      const atual = banco.produtos[i];
      const slug =
        dados.slug || dados.nome
          ? slugUnico(dados.slug || dados.nome || atual.nome, banco.produtos, id)
          : atual.slug;
      const atualizado: Produto = { ...atual, ...dados, slug, id };
      banco.produtos[i] = atualizado;
      await gravar(banco);
      return atualizado;
    },

    async alternarAtivo(id) {
      const banco = await ler();
      const p = banco.produtos.find((x) => x.id === id);
      if (!p) throw new Error("Peça não encontrada.");
      p.ativo = !p.ativo;
      await gravar(banco);
    },

    async alternarDestaque(id) {
      const banco = await ler();
      const p = banco.produtos.find((x) => x.id === id);
      if (!p) throw new Error("Peça não encontrada.");
      p.destaque = !p.destaque;
      await gravar(banco);
    },

    async removerProduto(id) {
      const banco = await ler();
      banco.produtos = banco.produtos.filter((p) => p.id !== id);
      await gravar(banco);
    },

    async categorias() {
      const banco = await ler();
      return [...banco.categorias]
        .filter((c) => c.ativa)
        .sort((a, b) => a.ordem - b.ordem);
    },

    async config() {
      const banco = await ler();
      return banco.config;
    },

    async salvarConfig(dados) {
      const banco = await ler();
      banco.config = dados;
      await gravar(banco);
    },
  };
}
