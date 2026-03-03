-- Promotions: เงื่อนไขราคาขั้นต่ำ (บาท) เพื่อใช้โปร — null = ใช้ได้ทุกราคา
alter table public.promotions
  add column if not exists min_order_amount numeric check (min_order_amount is null or min_order_amount >= 0);
