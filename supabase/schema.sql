-- ===========================================================================
-- VINCITORE — baseline do banco
--
-- COMO RODAR: cole este arquivo inteiro no SQL Editor do Supabase e execute.
-- É idempotente: pode rodar de novo sem quebrar nada (não apaga dados).
--
-- Domínio da aplicação é pt-BR; as colunas são em inglês (padrão do Postgres).
-- O mapeamento entre os dois vive em lib/repo/supabase.ts.
--
-- Depois de rodar, siga os 3 PASSOS FINAIS no fim do arquivo.
-- ===========================================================================

create extension if not exists pgcrypto;

-- --------------------------------------------------------------- tabelas ---

-- Quem pode escrever. O usuário é criado em Authentication > Users e o id
-- dele entra aqui (passo 2 no fim do arquivo).
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email   text,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id       uuid primary key default gen_random_uuid(),
  name     text not null,
  slug     text not null unique,
  position int  not null default 0,
  active   boolean not null default true,
  icon     text           -- desenho de linha da marca, para categoria vazia
);

create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  description   text,
  composition   text,
  category_slug text not null references public.categories (slug)
                  on update cascade on delete restrict,
  price         numeric(10, 2),   -- null = "Consulte" na vitrine
  sale_price    numeric(10, 2),
  sizes         text[] not null default '{}',
  colors        text[] not null default '{}',
  featured      boolean not null default false,
  active        boolean not null default true,
  position      int     not null default 99,
  created_at    timestamptz not null default now(),
  constraint promocional_menor_que_cheio
    check (sale_price is null or price is null or sale_price < price)
);

create table if not exists public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url        text not null,
  alt        text,
  position   int  not null default 0
);

-- Linha única com os dados da loja, editada em /admin/config.
create table if not exists public.settings (
  id             int primary key default 1,
  whatsapp       text,
  instagram      text,
  address        text,
  hours_weekday  text,
  hours_saturday text,
  booking_link   text,
  constraint linha_unica check (id = 1)
);

-- --------------------------------------------------------------- índices ---

create index if not exists products_categoria_idx
  on public.products (category_slug) where active;
create index if not exists products_destaque_idx
  on public.products (featured) where active;
create index if not exists product_images_produto_idx
  on public.product_images (product_id, position);

-- Garante uma única capa por peça (position = 0).
create unique index if not exists product_images_capa_unica
  on public.product_images (product_id) where position = 0;

-- ----------------------------------------------------------------- RLS -----

-- Helper com security definer: quebra a recursão de ler `admins` numa policy
-- que protege a própria `admins`.
create or replace function public.e_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

alter table public.admins         enable row level security;
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.product_images enable row level security;
alter table public.settings       enable row level security;

-- admins: só quem já é admin enxerga a tabela
drop policy if exists admins_ler on public.admins;
create policy admins_ler on public.admins
  for select using (public.e_admin());

-- categories: leitura pública das ativas
drop policy if exists categories_ler on public.categories;
create policy categories_ler on public.categories
  for select using (active or public.e_admin());

drop policy if exists categories_escrever on public.categories;
create policy categories_escrever on public.categories
  for all using (public.e_admin()) with check (public.e_admin());

-- products: a vitrine só vê as ativas; o painel vê tudo
drop policy if exists products_ler on public.products;
create policy products_ler on public.products
  for select using (active or public.e_admin());

drop policy if exists products_escrever on public.products;
create policy products_escrever on public.products
  for all using (public.e_admin()) with check (public.e_admin());

-- product_images: herdam a visibilidade da peça
drop policy if exists product_images_ler on public.product_images;
create policy product_images_ler on public.product_images
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_id and (p.active or public.e_admin())
    )
  );

drop policy if exists product_images_escrever on public.product_images;
create policy product_images_escrever on public.product_images
  for all using (public.e_admin()) with check (public.e_admin());

-- settings: leitura pública (rodapé e botões de WhatsApp dependem dela)
drop policy if exists settings_ler on public.settings;
create policy settings_ler on public.settings
  for select using (true);

drop policy if exists settings_escrever on public.settings;
create policy settings_escrever on public.settings
  for all using (public.e_admin()) with check (public.e_admin());

-- ------------------------------------------------------------- storage -----

insert into storage.buckets (id, name, public)
values ('produtos', 'produtos', true)
on conflict (id) do update set public = true;

drop policy if exists produtos_ler on storage.objects;
create policy produtos_ler on storage.objects
  for select using (bucket_id = 'produtos');

drop policy if exists produtos_enviar on storage.objects;
create policy produtos_enviar on storage.objects
  for insert with check (bucket_id = 'produtos' and public.e_admin());

drop policy if exists produtos_atualizar on storage.objects;
create policy produtos_atualizar on storage.objects
  for update using (bucket_id = 'produtos' and public.e_admin());

drop policy if exists produtos_remover on storage.objects;
create policy produtos_remover on storage.objects
  for delete using (bucket_id = 'produtos' and public.e_admin());

-- ---------------------------------------------------------------- seed -----

insert into public.categories (name, slug, position, active) values
  ('Tricôs',                'tricos',             1, true),
  ('Sobretudos & Casacos',  'sobretudos-casacos', 2, true),
  ('Camisas',               'camisas',            3, true),
  ('T-Shirts',              't-shirts',           4, true),
  ('Calças',                'calcas',             5, true),
  ('Calçados',              'calcados',           6, true)
on conflict (slug) do nothing;

insert into public.settings (
  id, whatsapp, instagram, address, hours_weekday, hours_saturday, booking_link
) values (
  1,
  '5551989431465',
  'https://www.instagram.com/vincitore.br/',
  'Rua Anápio Gomes, 1337 · Centro · Gravataí, RS · 94010-011',
  'Segunda a sexta · 09h às 19h',
  'Sábado · 09h às 18h',
  ''
) on conflict (id) do nothing;

-- ===========================================================================
-- 3 PASSOS FINAIS (fora deste arquivo)
--
-- 1. Authentication > Providers > Email: DESLIGUE "Enable signup".
--    Só o lojista entra no painel; ninguém pode criar conta sozinho.
--
-- 2. Authentication > Users > Add user: crie o usuário do lojista com e-mail
--    e senha. Copie o UID e rode:
--
--       insert into public.admins (user_id, email)
--       values ('COLE-O-UID-AQUI', 'email-do-lojista@exemplo.com');
--
-- 3. Preencha no .env.local (e nas variáveis da Vercel):
--       NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
--       NEXT_PUBLIC_SUPABASE_ANON_KEY=...
--    Preencher as duas liga o modo Supabase automaticamente.
--
-- Para levar o catálogo local para o banco: node scripts/seed-supabase.mjs
-- ===========================================================================
