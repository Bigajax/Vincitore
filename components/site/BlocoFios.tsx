import { Fragment } from "react";
import { fios, textos } from "@/data/site.config";
import Reveal from "@/components/site/Reveal";
import TituloSecao from "@/components/site/TituloSecao";

/**
 * A assinatura da página: três colunas separadas por alinhavo vertical,
 * numeral romano em serif. Sem caixa, sem ícone.
 */
export default function BlocoFios() {
  const ultimo = fios.length - 1;

  return (
    <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-32">
      <Reveal>
        <p className="eyebrow">{textos.fiosEyebrow}</p>
        <TituloSecao className="mt-4 text-4xl md:text-6xl">
          {textos.fiosTitulo}
        </TituloSecao>
      </Reveal>

      <div className="mt-12 md:mt-20 md:flex md:items-stretch">
        {fios.map((f, i) => (
          <Fragment key={f.nome}>
            {/* alinhavo vertical no lugar do fio sólido entre as colunas */}
            {i > 0 && (
              <span
                aria-hidden
                className="costura-vertical hidden shrink-0 md:block"
              />
            )}

            <Reveal
              atraso={i * 110}
              className={`md:flex-1 ${i === 0 ? "md:pr-10" : i === ultimo ? "md:pl-10" : "md:px-10"}`}
            >
              <div className="border-t border-ink/10 py-8 md:border-0 md:py-0">
                <span className="display block text-5xl leading-none text-camel md:text-6xl">
                  {f.numeral}
                </span>
                <h3 className="display mt-6 text-2xl md:text-3xl">{f.nome}</h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone">
                  {f.linha}
                </p>
              </div>
            </Reveal>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
