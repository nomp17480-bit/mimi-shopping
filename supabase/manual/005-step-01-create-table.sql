-- Step 1/8: create the private commune reference table.
begin;
create table if not exists public.store_communes (
  wilaya_code text not null,
  wilaya_name text not null,
  commune_name text not null,
  primary key (wilaya_code, commune_name)
);
revoke all on table public.store_communes from public, anon, authenticated;
commit;
