/**
 * Conversão e redimensionamento no navegador, antes de subir.
 * Canvas puro — sem dependência nova. O lojista tira foto de 4 MB no celular
 * e o que sobe é um WebP de ~200 KB.
 */
export const LARGURA_MAX = 1400;
export const QUALIDADE = 0.8;

export async function prepararFoto(arquivo: File): Promise<File> {
  if (!arquivo.type.startsWith("image/")) return arquivo;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(arquivo);
  } catch {
    return arquivo; // formato que o navegador não decodifica — sobe como veio
  }

  const escala = Math.min(1, LARGURA_MAX / bitmap.width);
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d");
  if (!ctx) return arquivo;
  ctx.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", QUALIDADE),
  );
  if (!blob || blob.size >= arquivo.size) return arquivo;

  const nome = arquivo.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([blob], nome, { type: "image/webp" });
}
