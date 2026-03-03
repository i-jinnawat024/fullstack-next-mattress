-- กำหนด name เป็น unique ของ products (ห้ามชื่อซ้ำ)
alter table public.products
  add constraint products_name_key unique (name);
