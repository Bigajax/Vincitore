import Image from "next/image";
import { site } from "@/data/site.config";

/**
 * Logotipo oficial da marca (arte extraída do arquivo original, não recriada
 * em tipografia). PNG transparente — o mesmo lettering serve claro e escuro.
 */
export default function Logo({
  altura = 26,
  className = "",
  prioridade = false,
}: {
  altura?: number;
  className?: string;
  prioridade?: boolean;
}) {
  return (
    <Image
      src="/marca/vincitore-wordmark.png"
      alt={`${site.nome}, ${site.assinatura}`}
      width={794}
      height={200}
      priority={prioridade}
      sizes={`${Math.round(altura * 3.97)}px`}
      className={className}
      style={{ height: altura, width: "auto" }}
    />
  );
}
