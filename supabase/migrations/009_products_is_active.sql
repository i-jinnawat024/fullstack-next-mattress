-- Product is_active: เปิด/ปิดการแสดงในแคตตาล็อก (ไม่ลบข้อมูล)
alter table public.products
  add column if not exists is_active boolean not null default true;

comment on column public.products.is_active is 'false = ไม่แสดงในแคตตาล็อก';
