import { textos } from "@/data/site.config";

/**
 * A ourela da página: uma fita de fios correndo devagar, como a etiqueta
 * costurada na gola. Alterna romano e itálico — o mesmo itálico do título do
 * hero — e separa os itens com ponto de alinhavo, não com bolinha.
 */
export default function Marquee() {
  const itens = [...textos.marquee, ...textos.marquee];

  return (
    <div
      className="marquee-pai ourela-borda overflow-hidden bg-ink py-6 md:py-7"
      aria-label="Os fios da VINCITORE"
    >
      <div className="marquee" aria-hidden>
        {itens.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="display flex shrink-0 items-center gap-7 pr-7 text-xl whitespace-nowrap text-ivory md:text-[1.7rem]"
          >
            <em className={i % 2 === 1 ? "font-normal italic" : "not-italic"}>
              {t}
            </em>
            <span className="ponto" />
          </span>
        ))}
      </div>

      {/* o leitor de tela recebe a lista uma vez só, sem a duplicata da animação */}
      <p className="sr-only">{textos.marquee.join(" · ")}</p>
    </div>
  );
}
