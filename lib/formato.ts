export function brl(valor: number | null | undefined): string {
  if (valor == null) return "Consulte";
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

/** Aceita "1.299,90", "1299.90" ou "1299,9". Devolve null quando vazio. */
export function paraNumero(entrada: FormDataEntryValue | null): number | null {
  if (entrada == null) return null;
  const t = String(entrada).trim();
  if (!t) return null;
  const limpo = t.replace(/[^\d,.-]/g, "");
  const normalizado =
    limpo.includes(",") && limpo.lastIndexOf(",") > limpo.lastIndexOf(".")
      ? limpo.replace(/\./g, "").replace(",", ".")
      : limpo.replace(/,/g, "");
  const n = Number(normalizado);
  return Number.isFinite(n) ? n : null;
}

export function ligado(entrada: FormDataEntryValue | null): boolean {
  const t = String(entrada ?? "").toLowerCase();
  return t === "on" || t === "true" || t === "1";
}

export function inteiro(entrada: FormDataEntryValue | null, padrao = 0): number {
  const n = Number(String(entrada ?? "").trim());
  return Number.isInteger(n) ? n : padrao;
}

/** "P, M, G" ou "P\nM\nG" -> ["P","M","G"] */
export function paraLista(entrada: FormDataEntryValue | null): string[] {
  return String(entrada ?? "")
    .split(/[,\n;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}
