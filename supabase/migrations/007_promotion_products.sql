-- Junction: promotions <-> products (many-to-many)
create table if not exists public.promotion_products (
  promotion_id uuid not null references public.promotions(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  primary key (promotion_id, product_id),
  unique (promotion_id, product_id)
);

create index if not exists idx_promotion_products_product_id on public.promotion_products (product_id);
create index if not exists idx_promotion_products_promotion_id on public.promotion_products (promotion_id);

-- RLS: same as promotions (anon read/write for app)
alter table public.promotion_products enable row level security;

create policy "Allow all on promotion_products for anon"
  on public.promotion_products
  for all
  to anon
  using (true)
  with check (true);
