/**
 * Título de seção com a última palavra em itálico.
 *
 * É a assinatura tipográfica da casa: a mesma inflexão do "pressa." do hero,
 * repetida em toda seção. Passe o texto inteiro; o componente cuida do corte.
 */
export default function TituloSecao({
  children,
  className = "",
  as: Tag = "h2",
}: {
  children: string;
  className?: string;
  as?: "h1" | "h2";
}) {
  const palavras = children.trim().split(" ");
  const ultima = palavras.pop() ?? "";
  const inicio = palavras.join(" ");

  return (
    <Tag className={`display ${className}`}>
      {inicio && `${inicio} `}
      <em className="font-normal italic">{ultima}</em>
    </Tag>
  );
}
