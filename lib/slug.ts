export function gerarSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

/** Garante unicidade acrescentando -2, -3, ... */
export function slugUnico(
  base: string,
  existentes: { slug: string; id: string }[],
  ignorarId?: string,
): string {
  const raiz = gerarSlug(base) || "peca";
  const usados = new Set(
    existentes.filter((e) => e.id !== ignorarId).map((e) => e.slug),
  );
  if (!usados.has(raiz)) return raiz;
  let n = 2;
  while (usados.has(`${raiz}-${n}`)) n++;
  return `${raiz}-${n}`;
}
