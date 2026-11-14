-- Public store contact settings; no payment or service secrets are stored here.
begin;
create table if not exists public.store_settings (
  id boolean primary key default true check (id = true),
  whatsapp_number text,
  instagram_url text,
  updated_at timestamptz not null default now()
);
insert into public.store_settings (id) values (true) on conflict (id) do nothing;
alter table public.store_settings enable row level security;
create policy "Public can read store contact settings"
  on public.store_settings for select to anon, authenticated using (true);
create policy "Store managers update contact settings"
  on public.store_settings for update to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id=auth.uid() and a.role in ('owner','admin')))
  with check (exists (select 1 from public.admin_users a where a.user_id=auth.uid() and a.role in ('owner','admin')));
commit;
