"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { repo } from "@/lib/repo";
import { entrar, exigirAdmin, sair } from "@/lib/auth";
import { ErroUpload, salvarFoto } from "@/lib/upload";
import { gerarSlug } from "@/lib/slug";
import { inteiro, ligado, paraLista, paraNumero } from "@/lib/formato";
import type { ImagemProduto, NovoProduto } from "@/lib/types";

export type Resposta = { ok: boolean; mensagem?: string };

function revalidarTudo() {
  revalidatePath("/", "layout");
}

/** Traduz qualquer exceção numa mensagem em português para o formulário. */
function comoResposta(e: unknown): Resposta {
  const mensagem =
    e instanceof ErroUpload || e instanceof Error
      ? e.message
      : "Não foi possível salvar. Tente de novo.";
  return { ok: false, mensagem };
}

// ---------------------------------------------------------------- sessão

export async function acaoEntrar(
  _anterior: Resposta | null,
  dados: FormData,
): Promise<Resposta> {
  const email = String(dados.get("email") ?? "").trim();
  const senha = String(dados.get("senha") ?? "");
  if (!senha) return { ok: false, mensagem: "Informe a senha." };

  const r = await entrar(email, senha);
  if (!r.ok) return { ok: false, mensagem: r.mensagem };
  redirect("/admin");
}

export async function acaoSair(): Promise<void> {
  await sair();
  redirect("/admin/entrar");
}

// ---------------------------------------------------------------- fotos

export async function acaoEnviarFotos(
  dados: FormData,
): Promise<{ ok: boolean; urls?: string[]; mensagem?: string }> {
  try {
    await exigirAdmin();
    const arquivos = dados
      .getAll("fotos")
      .filter((f): f is File => f instanceof File && f.size > 0);
    if (!arquivos.length) return { ok: false, mensagem: "Nenhuma foto enviada." };

    const urls: string[] = [];
    for (const arquivo of arquivos) urls.push(await salvarFoto(arquivo));
    return { ok: true, urls };
  } catch (e) {
    return comoResposta(e);
  }
}

// ---------------------------------------------------------------- peças

function lerFormulario(dados: FormData): NovoProduto {
  const nome = String(dados.get("nome") ?? "").trim();

  let imagens: ImagemProduto[] = [];
  try {
    const cru = JSON.parse(String(dados.get("imagens") ?? "[]"));
    if (Array.isArray(cru)) {
      imagens = cru.map((i, idx) => ({
        id: String(i.id ?? `${i.url}#${idx}`),
        url: String(i.url),
        alt: i.alt ? String(i.alt) : undefined,
        ordem: idx,
      }));
    }
  } catch {
    imagens = [];
  }

  return {
    nome,
    slug: gerarSlug(String(dados.get("slug") ?? "") || nome),
    descricao: String(dados.get("descricao") ?? "").trim(),
    composicao: String(dados.get("composicao") ?? "").trim(),
    categoriaSlug: String(dados.get("categoriaSlug") ?? "").trim(),
    preco: paraNumero(dados.get("preco")),
    precoPromocional: paraNumero(dados.get("precoPromocional")),
    tamanhos: paraLista(dados.get("tamanhos")),
    cores: paraLista(dados.get("cores")),
    destaque: ligado(dados.get("destaque")),
    ativo: ligado(dados.get("ativo")),
    ordem: inteiro(dados.get("ordem"), 99),
    imagens,
  };
}

function validar(p: NovoProduto): string | null {
  if (!p.nome) return "Dê um nome para a peça.";
  if (!p.categoriaSlug) return "Escolha uma categoria.";
  if (!p.imagens.length) return "Adicione pelo menos uma foto.";
  if (p.preco != null && p.preco < 0) return "O preço não pode ser negativo.";
  if (
    p.precoPromocional != null &&
    p.preco != null &&
    p.precoPromocional >= p.preco
  ) {
    return "O preço promocional precisa ser menor que o preço cheio.";
  }
  return null;
}

export async function acaoSalvarProduto(
  _anterior: Resposta | null,
  dados: FormData,
): Promise<Resposta> {
  let destino: string | null = null;
  try {
    await exigirAdmin();
    const id = String(dados.get("id") ?? "").trim();
    const produto = lerFormulario(dados);

    const erro = validar(produto);
    if (erro) return { ok: false, mensagem: erro };

    if (id) {
      await repo().atualizarProduto(id, produto);
    } else {
      await repo().criarProduto(produto);
    }
    revalidarTudo();
    destino = "/admin?salvo=1";
  } catch (e) {
    return comoResposta(e);
  }
  redirect(destino);
}

export async function acaoAlternarAtivo(id: string): Promise<Resposta> {
  try {
    await exigirAdmin();
    await repo().alternarAtivo(id);
    revalidarTudo();
    return { ok: true };
  } catch (e) {
    return comoResposta(e);
  }
}

export async function acaoAlternarDestaque(id: string): Promise<Resposta> {
  try {
    await exigirAdmin();
    await repo().alternarDestaque(id);
    revalidarTudo();
    return { ok: true };
  } catch (e) {
    return comoResposta(e);
  }
}

export async function acaoRemoverProduto(id: string): Promise<Resposta> {
  try {
    await exigirAdmin();
    await repo().removerProduto(id);
    revalidarTudo();
    return { ok: true };
  } catch (e) {
    return comoResposta(e);
  }
}

// ---------------------------------------------------------------- config

export async function acaoSalvarConfig(
  _anterior: Resposta | null,
  dados: FormData,
): Promise<Resposta> {
  try {
    await exigirAdmin();
    const whatsapp = String(dados.get("whatsapp") ?? "").replace(/\D/g, "");
    if (whatsapp && whatsapp.length < 12) {
      return {
        ok: false,
        mensagem: "WhatsApp incompleto. Use DDI + DDD + número (ex.: 5551989431465).",
      };
    }

    await repo().salvarConfig({
      whatsapp,
      instagram: String(dados.get("instagram") ?? "").trim(),
      endereco: String(dados.get("endereco") ?? "").trim(),
      horarioSemana: String(dados.get("horarioSemana") ?? "").trim(),
      horarioSabado: String(dados.get("horarioSabado") ?? "").trim(),
      linkAgendamento: String(dados.get("linkAgendamento") ?? "").trim(),
    });
    revalidarTudo();
    return { ok: true, mensagem: "Dados da loja salvos." };
  } catch (e) {
    return comoResposta(e);
  }
}
