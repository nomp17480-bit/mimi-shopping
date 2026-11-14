-- Mimi Shopping: secure public COD checkout.
-- Run AFTER bootstrap.sql. This creates one SECURITY DEFINER RPC; clients cannot insert orders directly.
begin;

create or replace function public.place_public_order(
  p_customer_name text,
  p_phone text,
  p_wilaya text,
  p_commune text,
  p_address text,
  p_shipping_method text,
  p_payment_method text,
  p_customer_note text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_item jsonb;
  v_product record;
  v_variant record;
  v_product_id bigint;
  v_variant_id bigint;
  v_qty integer;
  v_price numeric(12,2);
  v_subtotal numeric(12,2) := 0;
  v_shipping numeric(12,2);
  v_total numeric(12,2);
  v_lines jsonb := '[]'::jsonb;
  v_order_id bigint;
  v_order_number text;
begin
  if length(trim(coalesce(p_customer_name,''))) < 2 or length(trim(p_customer_name)) > 120 then
    raise exception 'يرجى إدخال اسم صحيح.';
  end if;
  if length(regexp_replace(coalesce(p_phone,''),'[^0-9+]','','g')) < 8 or length(p_phone) > 30 then
    raise exception 'رقم الهاتف غير صالح.';
  end if;
  if length(trim(coalesce(p_wilaya,''))) = 0 or length(trim(coalesce(p_commune,''))) = 0 or length(trim(coalesce(p_address,''))) < 4 then
    raise exception 'يرجى إكمال الولاية والبلدية والعنوان.';
  end if;
  if p_shipping_method not in ('home','desk') then
    raise exception 'طريقة التوصيل غير صالحة.';
  end if;
  if coalesce(p_payment_method,'') <> 'cod' then
    raise exception 'الدفع الإلكتروني غير مفعل بعد؛ اختر الدفع عند الاستلام.';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 20 then
    raise exception 'السلة فارغة أو تحتوي على عدد كبير من المنتجات.';
  end if;
  if (select count(*) from public.orders where phone = trim(p_phone) and created_at > now() - interval '10 minutes') >= 3 then
    raise exception 'تم تسجيل عدة طلبات بهذا الرقم مؤخراً. حاول بعد قليل.';
  end if;

  select case when p_shipping_method = 'home' then home_price else desk_price end
    into v_shipping
  from public.shipping_rates
  where wilaya = trim(p_wilaya) and active = true;
  if not found then
    raise exception 'التوصيل غير متاح لهذه الولاية حالياً.';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::bigint;
    v_variant_id := nullif(v_item->>'variant_id','')::bigint;
    v_qty := (v_item->>'quantity')::integer;
    if v_qty is null or v_qty < 1 or v_qty > 10 then
      raise exception 'كمية المنتج غير صالحة.';
    end if;

    select id, name, price, stock, is_active
      into v_product
    from public.products
    where id = v_product_id
    for update;
    if not found or not v_product.is_active then
      raise exception 'أحد المنتجات لم يعد متاحاً.';
    end if;

    if v_variant_id is not null then
      select id, product_id, color, size, price_override, stock, is_active, sku
        into v_variant
      from public.product_variants
      where id = v_variant_id and product_id = v_product_id
      for update;
      if not found or not v_variant.is_active then
        raise exception 'إحدى خيارات اللون أو المقاس لم تعد متاحة.';
      end if;
      if v_variant.stock < v_qty then
        raise exception 'المخزون غير كافٍ للمنتج: ' || v_product.name;
      end if;
      update public.product_variants set stock = stock - v_qty where id = v_variant_id;
      v_price := coalesce(v_variant.price_override, v_product.price);
      v_lines := v_lines || jsonb_build_array(jsonb_build_object(
        'product_id',v_product_id,'variant_id',v_variant_id,'product_name',v_product.name,
        'sku',v_variant.sku,'selected_color',v_variant.color,'selected_size',v_variant.size,
        'unit_price',v_price,'quantity',v_qty,'line_total',v_price*v_qty
      ));
    else
      if v_product.stock < v_qty then
        raise exception 'المخزون غير كافٍ للمنتج: ' || v_product.name;
      end if;
      update public.products set stock = stock - v_qty where id = v_product_id;
      v_price := v_product.price;
      v_lines := v_lines || jsonb_build_array(jsonb_build_object(
        'product_id',v_product_id,'variant_id',null,'product_name',v_product.name,
        'sku',null,'selected_color',null,'selected_size',null,
        'unit_price',v_price,'quantity',v_qty,'line_total',v_price*v_qty
      ));
    end if;
    v_subtotal := v_subtotal + (v_price * v_qty);
  end loop;

  v_total := v_subtotal + v_shipping;
  v_order_number := 'MIMI-' || to_char(clock_timestamp(),'YYMMDDHH24MISS') || '-' || lpad((floor(random()*10000))::text,4,'0');
  insert into public.orders (
    customer_name,phone,wilaya,commune,address,status,total,order_number,
    payment_method,payment_status,shipping_method,shipping_fee,currency,customer_note
  ) values (
    trim(p_customer_name),trim(p_phone),trim(p_wilaya),trim(p_commune),trim(p_address),
    'جديد',v_total,v_order_number,'cod','pending',p_shipping_method,v_shipping,'DZD',
    nullif(trim(coalesce(p_customer_note,'')),'')
  ) returning id into v_order_id;

  insert into public.order_items (
    order_id,product_id,variant_id,product_name,sku,selected_color,selected_size,
    unit_price,quantity,line_total
  )
  select v_order_id,
    (line->>'product_id')::bigint,
    nullif(line->>'variant_id','')::bigint,
    line->>'product_name',line->>'sku',line->>'selected_color',line->>'selected_size',
    (line->>'unit_price')::numeric,(line->>'quantity')::integer,(line->>'line_total')::numeric
  from jsonb_array_elements(v_lines) line;

  return jsonb_build_object('order_id',v_order_id,'order_number',v_order_number,'subtotal',v_subtotal,'shipping_fee',v_shipping,'total',v_total);
end;
$$;

revoke all on function public.place_public_order(text,text,text,text,text,text,text,text,jsonb) from public;
grant execute on function public.place_public_order(text,text,text,text,text,text,text,text,jsonb) to anon, authenticated;

commit;
