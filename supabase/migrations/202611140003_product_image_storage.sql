-- Public read-only product images; only authenticated store admins may upload/change/delete.
begin;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('mimi-products','mimi-products',true,5242880,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;

create policy "Public read Mimi product images"
on storage.objects for select to anon, authenticated
using (bucket_id = 'mimi-products');

create policy "Store admins upload Mimi product images"
on storage.objects for insert to authenticated
with check (bucket_id = 'mimi-products' and public.is_store_admin());

create policy "Store admins update Mimi product images"
on storage.objects for update to authenticated
using (bucket_id = 'mimi-products' and public.is_store_admin())
with check (bucket_id = 'mimi-products' and public.is_store_admin());

create policy "Store admins delete Mimi product images"
on storage.objects for delete to authenticated
using (bucket_id = 'mimi-products' and public.is_store_admin());
commit;
