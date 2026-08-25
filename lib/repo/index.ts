import "server-only";
import type { Repositorio } from "@/lib/repo/contrato";
import { criarRepositorioLocal } from "@/lib/repo/local";
import { criarRepositorioSupabase } from "@/lib/repo/supabase";

export function usandoSupabase(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

let local: Repositorio | null = null;

/**
 * Enquanto não houver credenciais do Supabase, tudo roda em `.dados/banco.json`
 * — inclusive o painel. Basta preencher o `.env.local` para virar a chave.
 */
export function repo(): Repositorio {
  if (usandoSupabase()) return criarRepositorioSupabase(); // por requisição (cookies)
  return (local ??= criarRepositorioLocal()); // memoizado
}

export type { Repositorio } from "@/lib/repo/contrato";
