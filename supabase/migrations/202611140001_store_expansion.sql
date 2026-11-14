-- Mimi Shopping: additive schema expansion.
-- IMPORTANT: This file is intentionally NOT applied to the live Supabase database.
-- Review it, back up the database, and test it in a staging project before applying.

create table if not exists public.product_variants (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  sku text unique,
  color text not null default '',
  size text not null default '',
  price_override numeric(12,2),
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (product_id, color, size)
);

create index if not exists product_variants_product_id_idx
  on public.product_variants(product_id);

alter table public.orders
  add column if not exists order_number text,
  add column if not exists customer_email text,
  add column if not exists payment_method text not null default 'cod',
  add column if not exists payment_status text not null default 'pending',
  add column if not exists shipping_method text not null default 'home',
  add column if not exists shipping_fee numeric(12,2) not null default 0,
  add column if not exists currency text not null default 'DZD',
  add column if not exists customer_note text,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists orders_order_number_uidx
  on public.orders(order_number)
  where order_number is not null;

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  product_id bigint references public.products(id) on delete set null,
  variant_id bigint references public.product_variants(id) on delete set null,
  product_name text not null,
  sku text,
  selected_color text,
  selected_size text,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(12,2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx
  on public.order_items(order_id);

create table if not exists public.admin_users (
  id bigint generated always as identity primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','catalog','orders','support')),
  created_at timestamptz not null default now()
);

create or replace function public.is_store_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
  );
$$;

create or replace function public.is_store_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid() and role = 'owner'
  );
$$;

create table if not exists public.product_reviews (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create index if not exists product_reviews_product_status_idx
  on public.product_reviews(product_id, status);

create table if not exists public.coupons (
  id bigint generated always as identity primary key,
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage','fixed')),
  discount_value numeric(12,2) not null check (discount_value > 0),
  starts_at timestamptz,
  expires_at timestamptz,
  usage_limit integer check (usage_limit is null or usage_limit >= 0),
  usage_count integer not null default 0 check (usage_count >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (expires_at is null or starts_at is null or expires_at > starts_at)
);

-- Row Level Security: public visitors can only read storefront data.
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.admin_users enable row level security;
alter table public.product_reviews enable row level security;
alter table public.coupons enable row level security;
alter table public.shipping_rates enable row level security;

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories"
  on public.categories for select to anon, authenticated using (true);

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
  on public.products for select to anon, authenticated using (is_active = true);

drop policy if exists "Public can read active variants" on public.product_variants;
create policy "Public can read active variants"
  on public.product_variants for select to anon, authenticated
  using (
    is_active = true and exists (
      select 1 from public.products p
      where p.id = product_id and p.is_active = true
    )
  );

drop policy if exists "Public can read active shipping rates" on public.shipping_rates;
create policy "Public can read active shipping rates"
  on public.shipping_rates for select to anon, authenticated using (active = true);

drop policy if exists "Public can read approved reviews" on public.product_reviews;
create policy "Public can read approved reviews"
  on public.product_reviews for select to anon, authenticated using (status = 'approved');

drop policy if exists "Store admins manage categories" on public.categories;
create policy "Store admins manage categories"
  on public.categories for all to authenticated
  using (public.is_store_admin()) with check (public.is_store_admin());

drop policy if exists "Store admins manage products" on public.products;
create policy "Store admins manage products"
  on public.products for all to authenticated
  using (public.is_store_admin()) with check (public.is_store_admin());

drop policy if exists "Store admins manage variants" on public.product_variants;
create policy "Store admins manage variants"
  on public.product_variants for all to authenticated
  using (public.is_store_admin()) with check (public.is_store_admin());

drop policy if exists "Store admins manage shipping rates" on public.shipping_rates;
create policy "Store admins manage shipping rates"
  on public.shipping_rates for all to authenticated
  using (public.is_store_admin()) with check (public.is_store_admin());

drop policy if exists "Store admins manage orders" on public.orders;
create policy "Store admins manage orders"
  on public.orders for all to authenticated
  using (public.is_store_admin()) with check (public.is_store_admin());

drop policy if exists "Store admins manage order items" on public.order_items;
create policy "Store admins manage order items"
  on public.order_items for all to authenticated
  using (public.is_store_admin()) with check (public.is_store_admin());

drop policy if exists "Store admins manage reviews" on public.product_reviews;
create policy "Store admins manage reviews"
  on public.product_reviews for all to authenticated
  using (public.is_store_admin()) with check (public.is_store_admin());

drop policy if exists "Store admins manage coupons" on public.coupons;
create policy "Store admins manage coupons"
  on public.coupons for all to authenticated
  using (public.is_store_admin()) with check (public.is_store_admin());

drop policy if exists "Admins can read admin users" on public.admin_users;
create policy "Admins can read admin users"
  on public.admin_users for select to authenticated using (public.is_store_admin());

drop policy if exists "Only owner can manage admin users" on public.admin_users;
create policy "Only owner can manage admin users"
  on public.admin_users for all to authenticated
  using (public.is_store_owner()) with check (public.is_store_owner());

-- Order creation is intentionally not granted to anonymous clients here.
-- Add a validated server-side order endpoint before enabling public checkout.
-- Bootstrap the first owner manually from the Supabase SQL editor after creating
-- that person's Auth account; never expose a service_role key in the browser.
