import Image from "next/image";
import Link from "next/link";
import type { CategoriaComTotal } from "@/lib/categorias";

/**
 * Categorias como faixas horizontais empilhadas, não cards.
 *
 * A foto sangra a faixa inteira. O véu é um degradê da esquerda para a direita:
 * pesado onde está o nome, leve do meio para a direita — assim o texto fica
 * legível sem apagar a imagem. No hover a cor volta e a foto avança de leve.
 */
export default function FaixaCategoria({
  categoria,
  indice,
}: {
  categoria: CategoriaComTotal;
  indice: number;
}) {
  return (
    <Link
      href={`/c/${categoria.slug}`}
      className="group relative flex h-36 items-center overflow-hidden border-b border-ivory/10 md:h-52"
    >
      {categoria.capa && (
        <Image
          src={categoria.capa}
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          style={{ objectPosition: categoria.capaPos ?? "center" }}
          className="object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
        />
      )}

      {/* véu em degradê: pesado à esquerda, leve à direita */}
      <div className="veu-faixa absolute inset-0 transition-opacity duration-700 group-hover:opacity-75" />

      <div className="relative flex w-full items-center justify-between gap-6 px-5 md:px-10">
        <div className="flex items-baseline gap-4 md:gap-8">
          <span className="display text-2xl leading-none text-camel md:text-4xl">
            {String(indice + 1).padStart(2, "0")}
          </span>
          <h3 className="marca text-lg text-ivory md:text-4xl">
            {categoria.nome}
          </h3>
        </div>

        <div className="flex shrink-0 items-center gap-5">
          <span className="etiqueta-mini rotulo selo-vidro">
            {categoria.total} {categoria.total === 1 ? "peça" : "peças"}
          </span>
          {/* alinhavo que se estica no hover, como o dos botões */}
          <span
            aria-hidden
            className="hidden h-px w-8 bg-camel transition-all duration-500 group-hover:w-16 md:block"
          />
        </div>
      </div>
    </Link>
  );
}
