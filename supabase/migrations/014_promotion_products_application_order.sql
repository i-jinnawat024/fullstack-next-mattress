-- ลำดับการประยุกต์โปรต่อสินค้า (สำหรับการสะสมส่วนลดตามลำดับที่ใส่)
alter table public.promotion_products
  add column if not exists application_order smallint not null default 0;

create index if not exists idx_promotion_products_product_order
  on public.promotion_products (product_id, application_order);
