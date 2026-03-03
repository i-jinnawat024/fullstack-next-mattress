-- Allow app (anon key) to read/write sales_records and monthly_targets
alter table public.sales_records enable row level security;
create policy "Allow all on sales_records for anon"
  on public.sales_records for all to anon using (true) with check (true);

alter table public.monthly_targets enable row level security;
create policy "Allow all on monthly_targets for anon"
  on public.monthly_targets for all to anon using (true) with check (true);
