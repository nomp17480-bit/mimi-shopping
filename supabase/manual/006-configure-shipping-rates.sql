-- Mimi Shopping: configure the owner-approved flat shipping prices.
-- Run once in Supabase SQL Editor after confirming the active project is Mimi Shopping.
-- Updates/inserts shipping rates only; does not touch products, orders, stock, or users.
-- Both home and desk delivery use the same fee as agreed in the project conversation.

begin;

insert into public.shipping_rates (wilaya, home_price, desk_price, active)
values
  ('01 - أدرار', 700, 700, true),
  ('02 - الشلف', 700, 700, true),
  ('03 - الأغواط', 700, 700, true),
  ('04 - أم البواقي', 700, 700, true),
  ('05 - باتنة', 700, 700, true),
  ('06 - بجاية', 700, 700, true),
  ('07 - بسكرة', 700, 700, true),
  ('08 - بشار', 700, 700, true),
  ('09 - البليدة', 700, 700, true),
  ('10 - البويرة', 700, 700, true),
  ('11 - تمنراست', 700, 700, true),
  ('12 - تبسة', 700, 700, true),
  ('13 - تلمسان', 700, 700, true),
  ('14 - تيارت', 700, 700, true),
  ('15 - تيزي وزو', 700, 700, true),
  ('16 - الجزائر', 350, 350, true),
  ('17 - الجلفة', 700, 700, true),
  ('18 - جيجل', 700, 700, true),
  ('19 - سطيف', 700, 700, true),
  ('20 - سعيدة', 700, 700, true),
  ('21 - سكيكدة', 700, 700, true),
  ('22 - سيدي بلعباس', 700, 700, true),
  ('23 - عنابة', 700, 700, true),
  ('24 - قالمة', 700, 700, true),
  ('25 - قسنطينة', 700, 700, true),
  ('26 - المدية', 700, 700, true),
  ('27 - مستغانم', 700, 700, true),
  ('28 - المسيلة', 700, 700, true),
  ('29 - معسكر', 700, 700, true),
  ('30 - ورقلة', 700, 700, true),
  ('31 - وهران', 700, 700, true),
  ('32 - البيض', 700, 700, true),
  ('33 - إليزي', 700, 700, true),
  ('34 - برج بوعريريج', 700, 700, true),
  ('35 - بومرداس', 700, 700, true),
  ('36 - الطارف', 700, 700, true),
  ('37 - تندوف', 700, 700, true),
  ('38 - تيسمسيلت', 700, 700, true),
  ('39 - الوادي', 700, 700, true),
  ('40 - خنشلة', 700, 700, true),
  ('41 - سوق أهراس', 700, 700, true),
  ('42 - تيبازة', 700, 700, true),
  ('43 - ميلة', 700, 700, true),
  ('44 - عين الدفلى', 700, 700, true),
  ('45 - النعامة', 700, 700, true),
  ('46 - عين تموشنت', 700, 700, true),
  ('47 - غرداية', 700, 700, true),
  ('48 - غليزان', 700, 700, true),
  ('49 - تيميمون', 700, 700, true),
  ('50 - برج باجي مختار', 700, 700, true),
  ('51 - أولاد جلال', 700, 700, true),
  ('52 - بني عباس', 700, 700, true),
  ('53 - عين صالح', 700, 700, true),
  ('54 - عين قزام', 700, 700, true),
  ('55 - تقرت', 700, 700, true),
  ('56 - جانت', 700, 700, true),
  ('57 - المغير', 700, 700, true),
  ('58 - المنيعة', 700, 700, true),
  ('59 - أفلو', 700, 700, true),
  ('60 - بريكة', 700, 700, true),
  ('61 - القنطرة', 700, 700, true),
  ('62 - بئر العاتر', 700, 700, true),
  ('63 - العريشة', 700, 700, true),
  ('64 - قصر الشلالة', 700, 700, true),
  ('65 - عين وسارة', 700, 700, true),
  ('66 - مسعد', 700, 700, true),
  ('67 - قصر البخاري', 700, 700, true),
  ('68 - بوسعادة', 700, 700, true),
  ('69 - الأبيض سيدي الشيخ', 700, 700, true)
on conflict (wilaya) do update
set home_price = excluded.home_price,
    desk_price = excluded.desk_price,
    active = excluded.active;

-- Verification: should return 69 rows; Wilaya 16 should be 350/350,
-- all other wilayas 700/700, and every row active.
select wilaya, home_price, desk_price, active
from public.shipping_rates
order by wilaya;

commit;
