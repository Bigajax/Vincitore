/**
 * Leva o catálogo local (.dados/banco.json) para o Supabase.
 *
 * Rodar UMA vez, logo depois de executar supabase/schema.sql:
 *
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-supabase.mjs
 *
 * Precisa da service role key (não da anon) porque escreve passando por cima
 * do RLS. Ela NUNCA vai para o .env.local nem para o repositório — passe na
 * linha de comando e pronto.
 *
 * É idempotente por `slug`: rodar de novo atualiza as peças existentes em vez
 * de duplicar. As fotos do seed continuam em public/fotos/ (caminhos
 * relativos); só o que o lojista subir pelo painel vai para o Storage.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CHAVE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !CHAVE) {
  console.error(
    "Faltam variáveis.\n" +
      "  NEXT_PUBLIC_SUPABASE_URL   (pode vir do .env.local)\n" +
      "  SUPABASE_SERVICE_ROLE_KEY  (passe na linha de comando)",
  );
  process.exit(1);
}

// lê o .env.local só para pegar a URL, se ela não veio no ambiente
async function carregarEnv() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) return;
  try {
    const cru = await fs.readFile(path.join(process.cwd(), ".env.local"), "utf8");
    for (const linha of cru.split("\n")) {
      const m = linha.match(/^([A-Z_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {
    /* sem .env.local, tudo bem */
  }
}

await carregarEnv();

const sb = createClient(URL, CHAVE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const banco = JSON.parse(
  await fs.readFile(path.join(process.cwd(), ".dados", "banco.json"), "utf8"),
);

// ------------------------------------------------------------ categorias ---

for (const c of banco.categorias) {
  const { error } = await sb.from("categories").upsert(
    {
      name: c.nome,
      slug: c.slug,
      position: c.ordem,
      active: c.ativa,
      icon: c.icone ?? null,
    },
    { onConflict: "slug" },
  );
  if (error) throw new Error(`categoria ${c.slug}: ${error.message}`);
}
console.log(`categorias: ${banco.categorias.length}`);

// --------------------------------------------------------------- config ----

const cfg = banco.config;
const { error: erroCfg } = await sb.from("settings").upsert({
  id: 1,
  whatsapp: cfg.whatsapp,
  instagram: cfg.instagram,
  address: cfg.endereco,
  hours_weekday: cfg.horarioSemana,
  hours_saturday: cfg.horarioSabado,
  booking_link: cfg.linkAgendamento,
});
if (erroCfg) throw new Error(`config: ${erroCfg.message}`);
console.log("config: ok");

// --------------------------------------------------------------- peças -----

for (const p of banco.produtos) {
  const { data, error } = await sb
    .from("products")
    .upsert(
      {
        name: p.nome,
        slug: p.slug,
        description: p.descricao,
        composition: p.composicao,
        category_slug: p.categoriaSlug,
        price: p.preco,
        sale_price: p.precoPromocional,
        sizes: p.tamanhos,
        colors: p.cores,
        featured: p.destaque,
        active: p.ativo,
        position: p.ordem,
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();
  if (error) throw new Error(`peça ${p.slug}: ${error.message}`);

  await sb.from("product_images").delete().eq("product_id", data.id);
  if (p.imagens.length) {
    const { error: erroImg } = await sb.from("product_images").insert(
      p.imagens.map((i, idx) => ({
        product_id: data.id,
        url: i.url,
        alt: i.alt ?? null,
        position: idx,
      })),
    );
    if (erroImg) throw new Error(`fotos de ${p.slug}: ${erroImg.message}`);
  }
  console.log(`  ${p.slug} (${p.imagens.length} fotos)`);
}

console.log(`\npeças: ${banco.produtos.length}. Pronto.`);
