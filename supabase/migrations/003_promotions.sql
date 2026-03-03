-- Promotions: ชื่อโปร, isActive, startedDate, endDate, description, ประเภทการลด (percent/fixed)

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean not null default true,
  started_date date not null,
  end_date date not null,
  description text,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric not null check (discount_value >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promotions_dates check (end_date >= started_date),
  constraint promotions_percent_max check (
    (discount_type = 'percent' and discount_value <= 100) or (discount_type = 'fixed')
  )
);

create index if not exists idx_promotions_is_active on public.promotions (is_active);
create index if not exists idx_promotions_started_date on public.promotions (started_date);
create index if not exists idx_promotions_end_date on public.promotions (end_date);
