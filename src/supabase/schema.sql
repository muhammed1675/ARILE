-- =====================================================================
-- ARÍLÉ — Supabase schema
-- Run this once in the Supabase SQL Editor (Dashboard → SQL → New query).
-- Safe to re-run: every statement is idempotent.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- PROFILES  (one row per auth user)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  full_name   text,
  phone       text,
  measurements jsonb default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- Create the profile row automatically on sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id               text primary key,
  slug             text unique not null,
  name             text not null,
  meaning          text,
  category         text not null check (
                     category in ('agbada','kaftan','buba','womens','accessories')
                   ),
  price            numeric(12,2) not null,
  compare_at_price numeric(12,2),
  images           jsonb not null default '[]'::jsonb,
  fabric           text,
  embroidery       text,
  occasion         text,
  description      text,
  colors           jsonb not null default '[]'::jsonb,
  variants         jsonb not null default '[]'::jsonb,
  availability     text not null default 'in_stock' check (
                     availability in ('in_stock','made_to_order','sold_out')
                   ),
  lead_time        text,
  featured         boolean not null default false,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

alter table public.products enable row level security;

-- Catalogue is public; writes happen with the service-role key only.
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (is_active = true);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_featured_idx on public.products (featured);

-- ---------------------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------------------
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  reference     text unique not null,
  user_id       uuid references auth.users on delete set null,
  status        text not null default 'pending' check (
                  status in ('pending','paid','in_production','shipped','delivered','cancelled')
                ),
  currency      text not null default 'NGN',
  subtotal      numeric(12,2) not null,
  shipping      numeric(12,2) not null default 0,
  total         numeric(12,2) not null,
  items         jsonb not null,
  customer      jsonb not null,
  payment_ref   text,
  paid_at       timestamptz,
  created_at    timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Guests can create an order (checkout without an account)
drop policy if exists "orders_insert_any" on public.orders;
create policy "orders_insert_any" on public.orders
  for insert with check (true);

-- Signed-in customers can read only their own orders
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders
  for select using (auth.uid() = user_id);

create index if not exists orders_reference_idx on public.orders (reference);
create index if not exists orders_user_idx on public.orders (user_id);

-- ---------------------------------------------------------------------
-- ENQUIRIES  (contact form + bespoke commissions)
-- ---------------------------------------------------------------------
create table if not exists public.enquiries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text,
  subject    text,
  message    text not null,
  type       text not null default 'general' check (
               type in ('general','bespoke','aso_ebi')
             ),
  handled    boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.enquiries enable row level security;

drop policy if exists "enquiries_insert_any" on public.enquiries;
create policy "enquiries_insert_any" on public.enquiries
  for insert with check (true);

-- ---------------------------------------------------------------------
-- NEWSLETTER
-- ---------------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "newsletter_insert_any" on public.newsletter_subscribers;
create policy "newsletter_insert_any" on public.newsletter_subscribers
  for insert with check (true);

-- =====================================================================
-- ADMIN ACCESS
-- Powers the /admin dashboard (orders, catalogue, enquiries).
-- Run this section even on a project that already has the tables above —
-- every statement is idempotent and safe to re-run.
-- =====================================================================

alter table public.profiles add column if not exists is_admin boolean not null default false;

-- Helper used inside RLS policies below. security definer so it can read
-- profiles regardless of the calling user's own row-level policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Orders — admins can see and update every order, not just their own.
drop policy if exists "orders_select_admin" on public.orders;
create policy "orders_select_admin" on public.orders
  for select using (public.is_admin());

drop policy if exists "orders_update_admin" on public.orders;
create policy "orders_update_admin" on public.orders
  for update using (public.is_admin());

-- Products — admins can see inactive items and edit the catalogue.
drop policy if exists "products_select_admin" on public.products;
create policy "products_select_admin" on public.products
  for select using (public.is_admin());

drop policy if exists "products_write_admin" on public.products;
create policy "products_write_admin" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- Enquiries — admins can read what customers send in.
drop policy if exists "enquiries_select_admin" on public.enquiries;
create policy "enquiries_select_admin" on public.enquiries
  for select using (public.is_admin());

drop policy if exists "enquiries_update_admin" on public.enquiries;
create policy "enquiries_update_admin" on public.enquiries
  for update using (public.is_admin());

-- Newsletter — admins can see the subscriber list.
drop policy if exists "newsletter_select_admin" on public.newsletter_subscribers;
create policy "newsletter_select_admin" on public.newsletter_subscribers
  for select using (public.is_admin());

-- =====================================================================
-- To make yourself an admin after signing up through the storefront's
-- normal /account page, run this once with your own email:
--
--   update public.profiles set is_admin = true
--   where id = (select id from auth.users where email = 'you@example.com');
-- =====================================================================

