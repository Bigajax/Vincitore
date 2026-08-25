import type { MetadataRoute } from "next";
import { site } from "@/data/site.config";
import { repo } from "@/lib/repo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dados = repo();
  const [produtos, categorias] = await Promise.all([
    dados.listarPublicos(),
    dados.categorias(),
  ]);

  return [
    { url: site.url, lastModified: new Date(), priority: 1 },
    ...categorias.map((c) => ({
      url: `${site.url}/c/${c.slug}`,
      lastModified: new Date(),
      priority: 0.8,
    })),
    ...produtos.map((p) => ({
      url: `${site.url}/p/${p.slug}`,
      lastModified: new Date(p.criadoEm),
      priority: 0.7,
    })),
  ];
}
