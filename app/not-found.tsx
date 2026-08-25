import Link from "next/link";
import Logo from "@/components/marca/Logo";

export default function NaoEncontrado() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <Logo altura={26} />
      <p className="display mt-12 text-6xl text-camel md:text-8xl">404</p>
      <h1 className="display mt-4 text-3xl md:text-4xl">
        Esta peça saiu da arara.
      </h1>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone">
        O endereço não existe ou a peça foi retirada da vitrine.
      </p>
      <Link href="/" className="btn btn-bordo mt-10">
        Voltar ao início
      </Link>
    </div>
  );
}
