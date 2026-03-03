-- Soft delete: add deleted_at to products

alter table public.products
  add column if not exists deleted_at timestamptz default null;

create index if not exists idx_products_deleted_at on public.products (deleted_at);

comment on column public.products.deleted_at is 'Soft delete: set to now() when deleted, null when active';
