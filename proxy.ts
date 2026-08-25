import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next 16 chama o antigo middleware de `proxy`.
 *
 * Isto é uma CONVENIÊNCIA, não a proteção: só evita renderizar o painel para
 * quem claramente não tem sessão. A proteção real está em
 * `app/admin/(painel)/layout.tsx` (protegerPagina) e em cada Server Action
 * (exigirAdmin), que é onde o RLS/segredo é de fato verificado.
 */
const COOKIES_SESSAO = ["vnc_sessao", "sb-"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin/entrar")) return NextResponse.next();

  const temCookie = request.cookies
    .getAll()
    .some((c) => COOKIES_SESSAO.some((p) => c.name.startsWith(p)));

  if (!temCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/entrar";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: "/admin/:path*" };
