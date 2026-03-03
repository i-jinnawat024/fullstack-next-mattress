-- Remove discount_percent from products (discount comes from promotions only)
alter table public.products
  drop column if exists discount_percent;
