-- Allow app (anon key) to read/write products — แก้ error "new row violates row-level security policy"
alter table public.products enable row level security;

create policy "Allow all on products for anon"
  on public.products
  for all
  to anon
  using (true)
  with check (true);
