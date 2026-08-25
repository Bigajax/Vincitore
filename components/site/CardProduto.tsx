import Image from "next/image";
import Link from "next/link";
import { brl } from "@/lib/formato";
import { capa, segundaFoto, temDesconto, type Produto } from "@/lib/types";

export default function CardProduto({
  produto,
  prioridade = false,
  numeral,
}: {
  produto: Produto;
  prioridade?: boolean;
  /** numeral tipográfico grande — usado só na seção de destaques */
  numeral?: string;
}) {
  const primeira = capa(produto);
  const segunda = segundaFoto(produto);
  const desconto = temDesconto(produto);

  return (
    <Link href={`/p/${produto.slug}`} className="group block">
      <div className="moldura-peca">
        <div className="card-foto relative aspect-4/5 overflow-hidden bg-ivory-2">
        {primeira && (
          <Image
            src={primeira.url}
            alt={primeira.alt ?? produto.nome}
            fill
            priority={prioridade}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover"
          />
        )}
        {segunda && (
          <Image
            src={segunda.url}
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="foto-2 object-cover"
          />
        )}
        </div>
      </div>

      <div className="pt-6">
        {numeral && (
          <span
            aria-hidden
            className="display mb-1 block text-3xl leading-none text-camel/60 md:text-4xl"
          >
            {numeral}
          </span>
        )}
        <h3 className="display text-lg leading-snug transition-colors group-hover:text-bordo md:text-xl">
          {produto.nome}
        </h3>
        <p className="rotulo mt-1.5 normal-case tracking-normal text-stone">
          {produto.composicao}
        </p>
        <p className="preco mt-2 text-sm">
          {desconto && (
            <span className="mr-2 text-stone line-through">
              {brl(produto.preco)}
            </span>
          )}
          <span className={desconto ? "text-bordo" : "text-ink"}>
            {brl(produto.precoPromocional ?? produto.preco)}
          </span>
        </p>
      </div>
    </Link>
  );
}
