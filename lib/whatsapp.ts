import { site } from "@/data/site.config";
import { brl } from "@/lib/formato";
import { precoEfetivo, type Produto } from "@/lib/types";

/** O WhatsApp engasga com travessão e espaço não-quebrável. */
function limpar(texto: string): string {
  return texto
    .replace(/[—–]/g, "-")
    .replace(/ /g, " ")
    .replace(/ /g, " ");
}

export function waLink(mensagem: string, numero: string = site.whatsapp): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(limpar(mensagem))}`;
}

export function waGeral(numero?: string): string {
  return waLink(
    [
      `Olá! Vim pela vitrine da *${site.nome}*.`,
      "Gostaria de saber mais sobre as peças disponíveis.",
    ].join("\n"),
    numero,
  );
}

export function waAgendamento(numero?: string): string {
  return waLink(
    [
      `Olá! Vim pela vitrine da *${site.nome}*.`,
      "Gostaria de agendar um atendimento na loja.",
    ].join("\n"),
    numero,
  );
}

export function waProduto(
  produto: Pick<Produto, "nome" | "slug" | "preco" | "precoPromocional" | "composicao">,
  opcoes?: { tamanho?: string; cor?: string; numero?: string },
): string {
  const linhas: string[] = [
    `Olá! Tenho interesse na peça *${produto.nome}*.`,
  ];

  if (opcoes?.tamanho) linhas.push(`*TAMANHO* ${opcoes.tamanho}`);
  if (opcoes?.cor) linhas.push(`*COR* ${opcoes.cor}`);

  const valor = precoEfetivo(produto as Produto);
  if (valor != null) linhas.push(`*PREÇO NA VITRINE* ${brl(valor)}`);
  if (produto.composicao) linhas.push(`*COMPOSIÇÃO* ${produto.composicao}`);

  linhas.push("", `${site.url}/p/${produto.slug}`);
  return waLink(linhas.join("\n"), opcoes?.numero);
}
