-- Allow app (anon key) to read/write promotions
alter table public.promotions enable row level security;

create policy "Allow all on promotions for anon"
  on public.promotions
  for all
  to anon
  using (true)
  with check (true);
