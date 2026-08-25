import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  Categoria,
  Config,
  FiltrosProduto,
  NovoProduto,
  Produto,
} from "@/lib/types";
import { slugUnico } from "@/lib/slug";
import {
  aplicarFiltros,
  destaquesPrimeiro,
  porOrdem,
  type Repositorio,
} from "@/lib/repo/contrato";

/** Domínio em pt-BR, banco em inglês — os mapeadores ficam todos aqui. */
type LinhaProduto = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  composition: string | null;
  category_slug: string;
  price: number | null;
  sale_price: number | null;
  sizes: string[] | null;
  colors: string[] | null;
  featured: boolean;
  active: boolean;
  position: number;
  created_at: string;
  product_images?: {
    id: string;
    url: string;
    alt: string | null;
    position: number;
  }[];
};

function paraProduto(l: LinhaProduto): Produto {
  return {
    id: l.id,
    nome: l.name,
    slug: l.slug,
    descricao: l.description ?? "",
    composicao: l.composition ?? "",
    categoriaSlug: l.category_slug,
    preco: l.price,
    precoPromocional: l.sale_price,
    tamanhos: l.sizes ?? [],
    cores: l.colors ?? [],
    destaque: l.featured,
    ativo: l.active,
    ordem: l.position,
    criadoEm: l.created_at,
    imagens: (l.product_images ?? []).map((i) => ({
      id: i.id,
      url: i.url,
      alt: i.alt ?? undefined,
      ordem: i.position,
    })),
  };
}

function paraLinha(d: Partial<NovoProduto>) {
  const linha: Record<string, unknown> = {};
  if (d.nome !== undefined) linha.name = d.nome;
  if (d.slug !== undefined) linha.slug = d.slug;
  if (d.descricao !== undefined) linha.description = d.descricao;
  if (d.composicao !== undefined) linha.composition = d.composicao;
  if (d.categoriaSlug !== undefined) linha.category_slug = d.categoriaSlug;
  if (d.preco !== undefined) linha.price = d.preco;
  if (d.precoPromocional !== undefined) linha.sale_price = d.precoPromocional;
  if (d.tamanhos !== undefined) linha.sizes = d.tamanhos;
  if (d.cores !== undefined) linha.colors = d.cores;
  if (d.destaque !== undefined) linha.featured = d.destaque;
  if (d.ativo !== undefined) linha.active = d.ativo;
  if (d.ordem !== undefined) linha.position = d.ordem;
  return linha;
}

const SELECT = "*, product_images(id, url, alt, position)";

export async function clienteSupabase(): Promise<SupabaseClient> {
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (lista) => {
          try {
            lista.forEach(({ name, value, options }) =>
              jar.set(name, value, options),
            );
          } catch {
            // chamado de um Server Component: o middleware já renova a sessão
          }
        },
      },
    },
  );
}

async function gravarImagens(
  sb: SupabaseClient,
  produtoId: string,
  imagens: NovoProduto["imagens"],
) {
  await sb.from("product_images").delete().eq("product_id", produtoId);
  if (!imagens.length) return;
  const { error } = await sb.from("product_images").insert(
    imagens.map((i, idx) => ({
      product_id: produtoId,
      url: i.url,
      alt: i.alt ?? null,
      position: i.ordem ?? idx,
    })),
  );
  if (error) throw new Error(error.message);
}

export function criarRepositorioSupabase(): Repositorio {
  return {
    async listarPublicos(filtros: FiltrosProduto = {}) {
      const sb = await clienteSupabase();
      const { data, error } = await sb
        .from("products")
        .select(SELECT)
        .eq("active", true);
      if (error) throw new Error(error.message);
      return aplicarFiltros(
        (data as LinhaProduto[]).map(paraProduto),
        filtros,
      ).sort(destaquesPrimeiro);
    },

    async listarTodos() {
      const sb = await clienteSupabase();
      const { data, error } = await sb.from("products").select(SELECT);
      if (error) throw new Error(error.message);
      return (data as LinhaProduto[]).map(paraProduto).sort(porOrdem);
    },

    async buscarPorSlug(slug) {
      const sb = await clienteSupabase();
      const { data } = await sb
        .from("products")
        .select(SELECT)
        .eq("slug", slug)
        .maybeSingle();
      return data ? paraProduto(data as LinhaProduto) : null;
    },

    async buscarPorId(id) {
      const sb = await clienteSupabase();
      const { data } = await sb
        .from("products")
        .select(SELECT)
        .eq("id", id)
        .maybeSingle();
      return data ? paraProduto(data as LinhaProduto) : null;
    },

    async criarProduto(dados) {
      const sb = await clienteSupabase();
      const { data: existentes } = await sb.from("products").select("id, slug");
      const slug = slugUnico(
        dados.slug || dados.nome,
        (existentes ?? []) as { id: string; slug: string }[],
      );
      const { data, error } = await sb
        .from("products")
        .insert({ ...paraLinha(dados), slug })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      await gravarImagens(sb, data.id, dados.imagens);
      const criado = await this.buscarPorId(data.id);
      if (!criado) throw new Error("Peça criada mas não encontrada.");
      return criado;
    },

    async atualizarProduto(id, dados) {
      const sb = await clienteSupabase();
      const linha = paraLinha(dados);
      if (dados.slug || dados.nome) {
        const { data: existentes } = await sb.from("products").select("id, slug");
        linha.slug = slugUnico(
          dados.slug || dados.nome!,
          (existentes ?? []) as { id: string; slug: string }[],
          id,
        );
      }
      const { error } = await sb.from("products").update(linha).eq("id", id);
      if (error) throw new Error(error.message);
      if (dados.imagens) await gravarImagens(sb, id, dados.imagens);
      const atualizado = await this.buscarPorId(id);
      if (!atualizado) throw new Error("Peça não encontrada.");
      return atualizado;
    },

    async alternarAtivo(id) {
      const sb = await clienteSupabase();
      const atual = await this.buscarPorId(id);
      if (!atual) throw new Error("Peça não encontrada.");
      const { error } = await sb
        .from("products")
        .update({ active: !atual.ativo })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },

    async alternarDestaque(id) {
      const sb = await clienteSupabase();
      const atual = await this.buscarPorId(id);
      if (!atual) throw new Error("Peça não encontrada.");
      const { error } = await sb
        .from("products")
        .update({ featured: !atual.destaque })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },

    async removerProduto(id) {
      const sb = await clienteSupabase();
      const { error } = await sb.from("products").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },

    async categorias(): Promise<Categoria[]> {
      const sb = await clienteSupabase();
      const { data, error } = await sb
        .from("categories")
        .select("*")
        .eq("active", true)
        .order("position");
      if (error) throw new Error(error.message);
      return (data ?? []).map((c) => ({
        id: c.id,
        nome: c.name,
        slug: c.slug,
        ordem: c.position,
        ativa: c.active,
        icone: c.icon ?? undefined,
      }));
    },

    async config(): Promise<Config> {
      const sb = await clienteSupabase();
      const { data } = await sb.from("settings").select("*").limit(1).maybeSingle();
      return {
        whatsapp: data?.whatsapp ?? "",
        instagram: data?.instagram ?? "",
        endereco: data?.address ?? "",
        horarioSemana: data?.hours_weekday ?? "",
        horarioSabado: data?.hours_saturday ?? "",
        linkAgendamento: data?.booking_link ?? "",
      };
    },

    async salvarConfig(dados) {
      const sb = await clienteSupabase();
      const { error } = await sb.from("settings").upsert({
        id: 1,
        whatsapp: dados.whatsapp,
        instagram: dados.instagram,
        address: dados.endereco,
        hours_weekday: dados.horarioSemana,
        hours_saturday: dados.horarioSabado,
        booking_link: dados.linkAgendamento,
      });
      if (error) throw new Error(error.message);
    },
  };
}
