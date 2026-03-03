-- Add product image URL (e.g. from UploadThing)
alter table public.products
  add column if not exists image_url text;
