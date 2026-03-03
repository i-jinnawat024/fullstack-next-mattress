-- Add image_url to promotions (banner/cover image)
alter table public.promotions
  add column if not exists image_url text;
