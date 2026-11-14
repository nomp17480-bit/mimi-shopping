-- Mimi Shopping: least-privilege role policies.
-- Apply once in Supabase SQL Editor AFTER the existing bootstrap/activation scripts.
-- This changes permissions only; it does not modify store data, prices, products, or orders.
begin;

-- Catalog managers: owner, admin, catalog.
drop policy if exists "Store admins manage categories" on public.categories;
create policy "Catalog managers manage categories"
  on public.categories for all to authenticated
  using (exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid() and a.role in ('owner','admin','catalog')
  ))
  with check (exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid() and a.role in ('owner','admin','catalog')
  ));

drop policy if exists "Store admins manage products" on public.products;
create policy "Catalog managers manage products"
  on public.products for all to authenticated
  using (exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid() and a.role in ('owner','admin','catalog')
  ))
  with check (exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid() and a.role in ('owner','admin','catalog')
  ));

drop policy if exists "Store admins manage variants" on public.product_variants;
create policy "Catalog managers manage variants"
  on public.product_variants for all to authenticated
  using (exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid() and a.role in ('owner','admin','catalog')
  ))
  with check (exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid() and a.role in ('owner','admin','catalog')
  ));

drop policy if exists "Store admins manage shipping rates" on public.shipping_rates;
create policy "Catalog managers manage shipping rates"
  on public.shipping_rates for all to authenticated
  using (exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid() and a.role in ('owner','admin','catalog')
  ))
  with check (exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid() and a.role in ('owner','admin','catalog')
  ));

-- Order managers may read and update orders. Support may only read them.
drop policy if exists "Store admins manage orders" on public.orders;
create policy "Order managers manage orders"
  on public.orders for all to authenticated
  using (exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid() and a.role in ('owner','admin','orders')
  ))
  with check (exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid() and a.role in ('owner','admin','orders')
  ));
create policy "Support reads orders"
  on public.orders for select to authenticated
  using (exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid() and a.role = 'support'
  ));

-- Order items are read-only in the current admin UI.
drop policy if exists "Store admins manage order items" on public.order_items;
create policy "Order team reads order items"
  on public.order_items for select to authenticated
  using (exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid() and a.role in ('owner','admin','orders','support')
  ));

-- Reviews and coupons have no delegated UI yet: owner/admin only.
drop policy if exists "Store admins manage reviews" on public.product_reviews;
create policy "Managers manage reviews"
  on public.product_reviews for all to authenticated
  using (exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid() and a.role in ('owner','admin')
  ))
  with check (exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid() and a.role in ('owner','admin')
  ));

drop policy if exists "Store admins manage coupons" on public.coupons;
create policy "Managers manage coupons"
  on public.coupons for all to authenticated
  using (exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid() and a.role in ('owner','admin')
  ))
  with check (exists (
    select 1 from public.admin_users a
    where a.user_id = auth.uid() and a.role in ('owner','admin')
  ));

-- Admins can inspect their own role; only the owner can inspect the team.
drop policy if exists "Admins can read admin users" on public.admin_users;
create policy "Admins read own role or owner reads team"
  on public.admin_users for select to authenticated
  using (user_id = auth.uid() or public.is_store_owner());

-- Storage writes are limited to catalog managers.
drop policy if exists "Store admins upload Mimi product images" on storage.objects;
create policy "Catalog managers upload Mimi product images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'mimi-products'
    and exists (
      select 1 from public.admin_users a
      where a.user_id = auth.uid() and a.role in ('owner','admin','catalog')
    )
  );

drop policy if exists "Store admins update Mimi product images" on storage.objects;
create policy "Catalog managers update Mimi product images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'mimi-products'
    and exists (
      select 1 from public.admin_users a
      where a.user_id = auth.uid() and a.role in ('owner','admin','catalog')
    )
  )
  with check (
    bucket_id = 'mimi-products'
    and exists (
      select 1 from public.admin_users a
      where a.user_id = auth.uid() and a.role in ('owner','admin','catalog')
    )
  );

drop policy if exists "Store admins delete Mimi product images" on storage.objects;
create policy "Catalog managers delete Mimi product images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'mimi-products'
    and exists (
      select 1 from public.admin_users a
      where a.user_id = auth.uid() and a.role in ('owner','admin','catalog')
    )
  );

commit;
