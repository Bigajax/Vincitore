import type { Metadata, Viewport } from "next";
import { Newsreader, Inter } from "next/font/google";
import { site } from "@/data/site.config";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"], // o itálico é a inflexão de voz do título
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.nome} | Moda masculina premium em ${site.cidade}`,
    template: `%s | ${site.nome}`,
  },
  description: site.descricao,
  openGraph: {
    title: `${site.nome} | ${site.slogan}`,
    description: site.descricao,
    url: site.url,
    siteName: site.nome,
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/fotos/ambiente-arara-sobretudos.jpg",
        width: 1080,
        height: 1920,
        alt: "Arara com sobretudos de lã VINCITORE",
      },
    ],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f4f0e8",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${newsreader.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
