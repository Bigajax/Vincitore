"use client";

import { useActionState } from "react";
import Logo from "@/components/marca/Logo";
import { acaoEntrar, type Resposta } from "@/app/admin/acoes";
import { usandoSupabaseCliente } from "@/lib/ambiente";

export default function Entrar() {
  const [estado, acao, enviando] = useActionState<Resposta | null, FormData>(
    acaoEntrar,
    null,
  );
  const comEmail = usandoSupabaseCliente();

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <Logo altura={26} />

        <h1 className="display mt-10 text-3xl">Painel da loja</h1>
        <p className="mt-2 text-sm text-stone">
          Entre para cadastrar e editar as peças da vitrine.
        </p>

        <form action={acao} className="mt-8 space-y-4">
          {comEmail && (
            <div>
              <label htmlFor="email" className="rotulo mb-2 block">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                className="campo"
              />
            </div>
          )}

          <div>
            <label htmlFor="senha" className="rotulo mb-2 block">
              Senha
            </label>
            <input
              id="senha"
              name="senha"
              type="password"
              autoComplete="current-password"
              required
              autoFocus={!comEmail}
              className="campo"
            />
          </div>

          {estado?.mensagem && (
            <p role="alert" className="text-sm text-bordo">
              {estado.mensagem}
            </p>
          )}

          <button type="submit" disabled={enviando} className="btn btn-bordo w-full">
            {enviando ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
