import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";

import { usandoSupabase } from "@/lib/repo";
import { clienteSupabase } from "@/lib/repo/supabase";

export const COOKIE = "vnc_sessao";
const DIAS = 7;

/** Variável declarada sem valor chega como string vazia e passaria pelo `??`. */
function preenchida(valor: string | undefined): string | null {
  const limpo = valor?.trim();
  return limpo ? limpo : null;
}

function segredo(): string {
  return (
    preenchida(process.env.ADMIN_SEGREDO) ??
    preenchida(process.env.ADMIN_SENHA) ??
    "vincitore-dev-nao-use-em-producao"
  );
}

function senhaLocal(): string {
  return preenchida(process.env.ADMIN_SENHA) ?? "vincitore";
}

function assinar(payload: string): string {
  return createHmac("sha256", segredo()).update(payload).digest("base64url");
}

function criarToken(): string {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + DIAS * 86_400_000 }),
  ).toString("base64url");
  return `${payload}.${assinar(payload)}`;
}

function tokenValido(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, assinatura] = token.split(".");
  if (!payload || !assinatura) return false;

  const esperada = Buffer.from(assinar(payload));
  const recebida = Buffer.from(assinatura);
  if (esperada.length !== recebida.length) return false;
  if (!timingSafeEqual(esperada, recebida)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

export async function estaAutenticado(): Promise<boolean> {
  if (usandoSupabase()) {
    const sb = await clienteSupabase();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return false;
    const { data } = await sb
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    return Boolean(data);
  }

  const jar = await cookies();
  return tokenValido(jar.get(COOKIE)?.value);
}

/** Para Server Actions: lança se não estiver autenticado. */
export async function exigirAdmin(): Promise<void> {
  if (!(await estaAutenticado())) {
    throw new Error("Sessão expirada. Entre novamente.");
  }
}

/** Para layouts: redireciona em vez de lançar. */
export async function protegerPagina(): Promise<void> {
  if (!(await estaAutenticado())) redirect("/admin/entrar");
}

export async function entrar(
  email: string,
  senha: string,
): Promise<{ ok: boolean; mensagem?: string }> {
  if (usandoSupabase()) {
    const sb = await clienteSupabase();
    const { error } = await sb.auth.signInWithPassword({ email, password: senha });
    if (error) return { ok: false, mensagem: "E-mail ou senha incorretos." };
    if (!(await estaAutenticado())) {
      await sb.auth.signOut();
      return { ok: false, mensagem: "Esta conta não tem acesso ao painel." };
    }
    return { ok: true };
  }

  const esperada = Buffer.from(senhaLocal());
  const recebida = Buffer.from(senha);
  if (
    esperada.length !== recebida.length ||
    !timingSafeEqual(esperada, recebida)
  ) {
    return { ok: false, mensagem: "Senha incorreta." };
  }

  const jar = await cookies();
  jar.set(COOKIE, criarToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DIAS * 86_400,
  });
  return { ok: true };
}

export async function sair(): Promise<void> {
  if (usandoSupabase()) {
    const sb = await clienteSupabase();
    await sb.auth.signOut();
    return;
  }
  const jar = await cookies();
  jar.delete(COOKIE);
}
