import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { usandoSupabase } from "@/lib/repo";
import { clienteSupabase } from "@/lib/repo/supabase";

export const BUCKET = "produtos";
const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
const TETO = 12 * 1024 * 1024; // 12 MB

export class ErroUpload extends Error {}

const EXTENSAO: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/**
 * Modo Supabase: bucket `produtos` do Storage.
 * Modo local: `public/uploads/` em disco.
 *
 * ATENÇÃO: o modo local NÃO funciona na Vercel (sistema de arquivos somente
 * leitura). Produção exige Supabase configurado.
 */
export async function salvarFoto(arquivo: File): Promise<string> {
  if (!TIPOS.includes(arquivo.type as (typeof TIPOS)[number])) {
    throw new ErroUpload(
      `Formato não aceito (${arquivo.type || "desconhecido"}). Use JPG, PNG, WebP ou AVIF.`,
    );
  }
  if (arquivo.size > TETO) {
    throw new ErroUpload("Foto acima de 12 MB. Escolha uma imagem menor.");
  }

  const nome = `${randomUUID()}.${EXTENSAO[arquivo.type] ?? "jpg"}`;

  if (usandoSupabase()) {
    const sb = await clienteSupabase();
    const { error } = await sb.storage
      .from(BUCKET)
      .upload(nome, arquivo, { contentType: arquivo.type, upsert: false });
    if (error) throw new ErroUpload(`Falha ao enviar a foto: ${error.message}`);
    const { data } = sb.storage.from(BUCKET).getPublicUrl(nome);
    return data.publicUrl;
  }

  const pasta = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(pasta, { recursive: true });
  await fs.writeFile(
    path.join(pasta, nome),
    Buffer.from(await arquivo.arrayBuffer()),
  );
  return `/uploads/${nome}`;
}
