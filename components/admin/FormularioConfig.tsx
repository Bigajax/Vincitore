"use client";

import { useActionState } from "react";
import { acaoSalvarConfig, type Resposta } from "@/app/admin/acoes";
import type { Config } from "@/lib/types";

export default function FormularioConfig({ config }: { config: Config }) {
  const [estado, acao, enviando] = useActionState<Resposta | null, FormData>(
    acaoSalvarConfig,
    null,
  );

  const campo = (
    id: keyof Config,
    rotulo: string,
    placeholder: string,
    ajuda?: string,
  ) => (
    <div>
      <label htmlFor={id} className="rotulo mb-2 block">
        {rotulo}
      </label>
      <input
        id={id}
        name={id}
        defaultValue={config[id] ?? ""}
        placeholder={placeholder}
        className="campo"
      />
      {ajuda && <p className="mt-2 text-xs text-stone">{ajuda}</p>}
    </div>
  );

  return (
    <form action={acao} className="space-y-6">
      {campo(
        "whatsapp",
        "WhatsApp",
        "5551989431465",
        "Só números, com DDI e DDD. É para onde vão todos os botões da vitrine.",
      )}
      {campo("instagram", "Instagram", "https://www.instagram.com/vincitore.br/")}
      {campo(
        "endereco",
        "Endereço",
        "Rua Anápio Gomes, 1337 · Centro · Gravataí, RS",
      )}
      {campo("horarioSemana", "Horário de segunda a sexta", "Segunda a sexta · 09h às 19h")}
      {campo("horarioSabado", "Horário de sábado", "Sábado · 09h às 18h")}
      {campo(
        "linkAgendamento",
        "Link de agendamento",
        "https://…",
        "Opcional. Deixe em branco para agendar direto pelo WhatsApp.",
      )}

      {estado?.mensagem && (
        <p
          role="status"
          className={`text-sm ${estado.ok ? "text-ink" : "text-bordo"}`}
        >
          {estado.mensagem}
        </p>
      )}

      <button type="submit" disabled={enviando} className="btn btn-bordo">
        {enviando ? "Salvando…" : "Salvar dados da loja"}
      </button>
    </form>
  );
}
