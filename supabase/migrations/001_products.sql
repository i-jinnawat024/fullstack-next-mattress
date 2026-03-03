-- Catalog: products (100% Supabase)
-- Run in Supabase SQL Editor or via supabase db push

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null,
  size_3_5_msrp numeric,
  size_5_msrp numeric,
  size_6_msrp numeric,
  discount_percent numeric not null default 0 check (discount_percent >= 0 and discount_percent <= 100),
  promotion_end_date date,
  free_gifts text,
  credit_promo_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional: RLS (enable if you use Supabase Auth)
-- alter table public.products enable row level security;
-- create policy "Allow read for anon" on public.products for select using (true);

-- Phase 2: sales & targets
create table if not exists public.sales_records (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete set null,
  sold_price numeric not null,
  customer_name text,
  bill_no text,
  sold_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.monthly_targets (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  month int not null check (month >= 1 and month <= 12),
  target_amount numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(year, month)
);

-- Index for search
create index if not exists idx_products_name on public.products (name);
create index if not exists idx_products_brand on public.products (brand);
