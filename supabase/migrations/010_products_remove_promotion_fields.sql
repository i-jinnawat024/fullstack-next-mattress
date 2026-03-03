-- Remove promotion-related columns from products (no longer linking product to promotion)
alter table public.products
  drop column if exists promotion_end_date,
  drop column if exists free_gifts,
  drop column if exists credit_promo_text;
