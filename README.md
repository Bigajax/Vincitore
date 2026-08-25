# VINCITORE — vitrine digital

Vitrine da VINCITORE, moda masculina premium em Gravataí/RS
(@vincitore.br). Tira o catálogo do feed do Instagram e coloca num link só,
organizado por categoria.

**Não é um e-commerce.** Não tem carrinho, checkout, frete nem conta de
cliente — cada peça tem um botão que abre o WhatsApp com a mensagem já
preenchida. A venda continua acontecendo no WhatsApp ou na loja física.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind 4 (tokens no `@theme` de `app/globals.css`, sem `tailwind.config`)
- Supabase (Postgres + Storage + Auth) — **opcional**, ver abaixo
- Zero dependência de UI, de fonte ou de animação

## Rodando

```bash
npm install
cp .env.example .env.local     # já vem funcionando sem editar nada
npm run dev
```

Vitrine em `http://localhost:3000`, painel em `/admin`
(senha padrão: `vincitore`, definida em `ADMIN_SENHA`).

## Os dois modos

O projeto escolhe o modo sozinho, olhando o `.env.local`
(`lib/repo/index.ts`):

| | Modo local (padrão) | Modo Supabase |
|---|---|---|
| Liga quando | `NEXT_PUBLIC_SUPABASE_*` vazias | as duas preenchidas |
| Catálogo | `.dados/banco.json` | Postgres |
| Fotos novas | `public/uploads/` | bucket `produtos` do Storage |
| Login do painel | só senha (`ADMIN_SENHA`) | e-mail + senha (Supabase Auth) |
| Serve para | desenvolver e demonstrar ao lojista | **produção** |

O modo local **não funciona na Vercel** — o disco é somente leitura, então
upload de foto quebra. Produção exige Supabase.

### Ligando o Supabase

1. Crie um projeto novo no Supabase (**um por cliente**, nunca reaproveitar).
2. Cole `supabase/schema.sql` inteiro no SQL Editor e execute.
3. Siga os 3 passos comentados no fim daquele arquivo: desligar o signup,
   criar o usuário do lojista e inserir o UID dele em `public.admins`.
4. Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Leve o catálogo local para o banco:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-supabase.mjs
   ```
6. Espelhe as variáveis do `.env.local` nas Environment Variables da Vercel.

## O que editar

| Quero mudar | Arquivo |
|---|---|
| Nome, WhatsApp, endereço, horários, redes | `data/site.config.ts` |
| Textos das seções da home, os três fios | `data/site.config.ts` |
| Catálogo inicial (peças e fotos) | `data/seed.ts` |
| Paleta e fontes | `app/globals.css` (`:root` + `@theme inline`) |
| Mensagens de WhatsApp | `lib/whatsapp.ts` — é o **único** lugar com `wa.me` |

O lojista edita o resto sozinho pelo painel; nada disso exige mexer no código.

## Estrutura

```
app/(site)/       vitrine: /, /c/[slug], /p/[slug]   — ISR de 60s
app/admin/        painel: login, peças, dados da loja — client-side
  acoes.ts        TODAS as Server Actions
proxy.ts          redireciona /admin sem cookie (só conveniência)
components/site/  UI da vitrine
components/admin/ UI do painel (fora do bundle público)
lib/repo/         contrato + adaptador local + adaptador Supabase
lib/whatsapp.ts   links e mensagens
lib/auth.ts       sessão (dual-mode), server-only
data/             site.config.ts (identidade) e seed.ts (catálogo inicial)
supabase/         schema.sql
scripts/          seed-supabase.mjs
public/fotos/     fotos do catálogo inicial
public/marca/     logotipo e ícones de categoria
_fotos-ig/        material bruto do Instagram — gitignored, não vai para o ar
```

## Proteção do painel

Três camadas, e só a primeira é dispensável:

1. `proxy.ts` — checagem barata de cookie. **Não é a proteção**, só evita
   renderizar o painel para quem claramente não tem sessão.
2. `app/admin/(painel)/layout.tsx` — `protegerPagina()`, redireciona.
3. Toda Server Action começa com `exigirAdmin()`. No modo Supabase o portão
   real é o RLS do banco.

## Pendências

- **Logotipo**: a arte em `public/marca/` foi extraída do arquivo de 823px do
  perfil. Se o cliente tiver o original (PNG transparente em alta), substituir
  `vincitore-wordmark.png` melhora o header e o favicon.
- **Camisas, Calças e Calçados** estão sem peça e aparecem como "Em breve" na
  home. O feed do Instagram só rendeu casacos e tricôs — o lojista cadastra o
  resto pelo painel.
- Excluir uma peça não apaga as fotos dela em `public/uploads/` (ou no
  bucket). Em escala de loja de bairro isso é irrelevante; se um dia incomodar,
  vira uma rotina de limpeza.
