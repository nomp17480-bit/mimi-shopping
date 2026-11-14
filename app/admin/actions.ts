"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";

async function requireRole(allowed: string[]) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: admin } = await supabase.from("admin_users").select("role").eq("user_id", user.id).maybeSingle();
  if (!admin || !allowed.includes(admin.role)) throw new Error("ليست لديك صلاحية تنفيذ هذا الإجراء.");
  return supabase;
}
const catalogRoles = ["owner", "admin", "catalog"];
const orderRoles = ["owner", "admin", "orders"];
function text(form: FormData, key: string) { return String(form.get(key) ?? "").trim(); }
function list(value: string) { return value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean); }

function productValues(form: FormData) {
  const name = text(form, "name"), price = Number(text(form, "price")), stock = Number(text(form, "stock"));
  const oldRaw = text(form, "old_price"), categoryRaw = text(form, "category_id");
  if (!name || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) throw new Error("تحقق من اسم المنتج والسعر والمخزون.");
  const old = oldRaw ? Number(oldRaw) : null;
  if (old !== null && (!Number.isFinite(old) || old < 0)) throw new Error("السعر السابق غير صالح.");
  const category = categoryRaw ? Number(categoryRaw) : null;
  if (category !== null && (!Number.isInteger(category) || category <= 0)) throw new Error("القسم غير صالح.");
  return { name, price, old_price: old, stock, category_id: category, description: text(form,"description") || null, material: text(form,"material") || null, size: text(form,"size") || null, dimensions: text(form,"dimensions") || null, colors: list(text(form,"colors")), images: list(text(form,"images")), features: list(text(form,"features")), is_active: form.get("is_active") === "on" };
}

export async function createProduct(form: FormData) {
  const supabase = await requireRole(catalogRoles);
  const { error } = await supabase.from("products").insert(productValues(form));
  if (error) throw new Error("تعذرت إضافة المنتج: " + error.message);
  revalidatePath("/admin"); revalidatePath("/");
  redirect("/admin?created=1");
}
export async function updateProduct(form: FormData) {
  const supabase = await requireRole(catalogRoles), id = Number(text(form,"id"));
  if (!Number.isInteger(id) || id <= 0) throw new Error("معرّف المنتج غير صالح.");
  const { error } = await supabase.from("products").update(productValues(form)).eq("id",id);
  if (error) throw new Error("تعذر تحديث المنتج: " + error.message);
  revalidatePath("/admin"); revalidatePath("/");
  redirect("/admin?updated=1");
}
export async function deleteProduct(form: FormData) {
  const supabase = await requireRole(catalogRoles), id = Number(text(form,"id"));
  if (!Number.isInteger(id) || id <= 0) throw new Error("معرّف المنتج غير صالح.");
  const { error } = await supabase.from("products").delete().eq("id",id);
  if (error) throw new Error("تعذر حذف المنتج: " + error.message);
  revalidatePath("/admin"); revalidatePath("/");
  redirect("/admin?deleted=1");
}
export async function createCategory(form: FormData) {
  const supabase = await requireRole(catalogRoles), name = text(form,"name");
  const slug = text(form,"slug").toLowerCase().replace(/[^a-z0-9-]/g,"-").replace(/-+/g,"-");
  if (!name || !slug) throw new Error("اسم القسم ورمزه مطلوبان.");
  const { error } = await supabase.from("categories").insert({name,slug,icon:text(form,"icon") || "👜"});
  if (error) throw new Error("تعذرت إضافة القسم: " + error.message);
  revalidatePath("/admin"); revalidatePath("/");
  redirect("/admin?categoryCreated=1");
}
export async function updateOrder(form: FormData) {
  const supabase = await requireRole(orderRoles);
  const id = Number(text(form,"id")), status = text(form,"status"), payment = text(form,"payment_status");
  const statuses = ["جديد","قيد التأكيد","مؤكد","قيد التحضير","تم الشحن","تم التسليم","ملغي","مرتجع"];
  const payments = ["pending","paid","failed","refunded"];
  if (!Number.isInteger(id) || id <= 0 || !statuses.includes(status) || !payments.includes(payment)) throw new Error("بيانات الطلب غير صالحة.");
  const { error } = await supabase.from("orders").update({status,payment_status:payment,updated_at:new Date().toISOString()}).eq("id",id);
  if (error) throw new Error("تعذر تحديث الطلب: " + error.message);
  revalidatePath("/admin/orders"); revalidatePath("/admin");
  redirect("/admin/orders?updated=1");
}
export async function createVariant(form: FormData) {
  const supabase = await requireRole(catalogRoles);
  const productId = Number(text(form,"product_id")), color = text(form,"color"), size = text(form,"size");
  const stock = Number(text(form,"stock")), rawPrice = text(form,"price_override"), price = rawPrice ? Number(rawPrice) : null;
  if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(stock) || stock < 0 || (price !== null && (!Number.isFinite(price) || price < 0))) throw new Error("تحقق من المنتج والمخزون والسعر.");
  const {error} = await supabase.from("product_variants").insert({product_id:productId,color,size,stock,price_override:price,sku:text(form,"sku")||null,is_active:form.get("is_active")==="on"});
  if (error) throw new Error("تعذرت إضافة تركيبة المخزون: "+error.message);
  revalidatePath("/admin/inventory"); revalidatePath("/admin");
  redirect("/admin/inventory?created=1");
}
export async function updateVariant(form: FormData) {
  const supabase = await requireRole(catalogRoles), id=Number(text(form,"id"));
  const stock=Number(text(form,"stock")), rawPrice=text(form,"price_override"), price=rawPrice?Number(rawPrice):null;
  if (!Number.isInteger(id)||id<=0||!Number.isInteger(stock)||stock<0||(price!==null&&(!Number.isFinite(price)||price<0))) throw new Error("بيانات المخزون غير صالحة.");
  const {error}=await supabase.from("product_variants").update({color:text(form,"color"),size:text(form,"size"),stock,price_override:price,sku:text(form,"sku")||null,is_active:form.get("is_active")==="on"}).eq("id",id);
  if(error) throw new Error("تعذر تحديث المخزون: "+error.message);
  revalidatePath("/admin/inventory"); revalidatePath("/admin");
  redirect("/admin/inventory?updated=1");
}
export async function deleteVariant(form: FormData) {
  const supabase=await requireRole(catalogRoles),id=Number(text(form,"id"));
  if(!Number.isInteger(id)||id<=0) throw new Error("معرّف المخزون غير صالح.");
  const {error}=await supabase.from("product_variants").delete().eq("id",id);
  if(error) throw new Error("تعذر حذف التركيبة: "+error.message);
  revalidatePath("/admin/inventory"); revalidatePath("/admin");
  redirect("/admin/inventory?deleted=1");
}

const wilayas = ["أدرار","الشلف","الأغواط","أم البواقي","باتنة","بجاية","بسكرة","بشار","البليدة","البويرة","تمنراست","تبسة","تلمسان","تيارت","تيزي وزو","الجزائر","الجلفة","جيجل","سطيف","سعيدة","سكيكدة","سيدي بلعباس","عنابة","قالمة","قسنطينة","المدية","مستغانم","المسيلة","معسكر","ورقلة","وهران","البيض","إليزي","برج بوعريريج","بومرداس","الطارف","تندوف","تيسمسيلت","الوادي","خنشلة","سوق أهراس","تيبازة","ميلة","عين الدفلى","النعامة","عين تموشنت","غرداية","غليزان","تيميمون","برج باجي مختار","أولاد جلال","بني عباس","عين صالح","عين قزام","تقرت","جانت","المغير","المنيعة","أفلو","بريكة","القنطرة","بئر العاتر","العريشة","قصر الشلالة","عين وسارة","مسعد","قصر البخاري","بوسعادة","الأبيض سيدي الشيخ"];
export async function initializeWilayas() {
 const supabase=await requireRole(catalogRoles);
 const rows=wilayas.map((wilaya,i)=>({wilaya:String(i+1).padStart(2,"0")+" - "+wilaya,home_price:0,desk_price:0,active:false}));
 const {error}=await supabase.from("shipping_rates").upsert(rows,{onConflict:"wilaya",ignoreDuplicates:true});
 if(error) throw new Error("تعذر تجهيز الولايات: "+error.message);
 revalidatePath("/admin/shipping");
 redirect("/admin/shipping?initialized=1");
}
export async function updateShippingRate(form: FormData) {
 const supabase=await requireRole(catalogRoles),id=Number(text(form,"id"));
 const home=Number(text(form,"home_price")),desk=Number(text(form,"desk_price"));
 if(!Number.isInteger(id)||id<=0||!Number.isFinite(home)||home<0||!Number.isFinite(desk)||desk<0) throw new Error("أسعار التوصيل غير صالحة.");
 const {error}=await supabase.from("shipping_rates").update({home_price:home,desk_price:desk,active:form.get("active")==="on"}).eq("id",id);
 if(error) throw new Error("تعذر حفظ أسعار التوصيل: "+error.message);
 revalidatePath("/admin/shipping"); revalidatePath("/");
 redirect("/admin/shipping?updated=1");
}

export async function updateCategory(form: FormData) {
 const supabase=await requireRole(catalogRoles),id=Number(text(form,"id"));
 const name=text(form,"name"),slug=text(form,"slug").toLowerCase().replace(/[^a-z0-9-]/g,"-").replace(/-+/g,"-");
 if(!Number.isInteger(id)||id<=0||!name||!slug)throw new Error("بيانات القسم غير صالحة.");
 const {error}=await supabase.from("categories").update({name,slug,icon:text(form,"icon")||"👜"}).eq("id",id);
 if(error)throw new Error("تعذر تحديث القسم: "+error.message);
 revalidatePath("/admin");revalidatePath("/");
 redirect("/admin?categoryUpdated=1");
}
export async function deleteCategory(form: FormData) {
 const supabase=await requireRole(catalogRoles),id=Number(text(form,"id"));
 if(!Number.isInteger(id)||id<=0)throw new Error("معرّف القسم غير صالح.");
 const {error}=await supabase.from("categories").delete().eq("id",id);
 if(error)throw new Error("تعذر حذف القسم: "+error.message);
 revalidatePath("/admin");revalidatePath("/");
 redirect("/admin?categoryDeleted=1");
}
export async function createAdminUser(form: FormData) {
 const supabase=await requireRole(["owner"]),userId=text(form,"user_id"),role=text(form,"role");
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)||!["admin","catalog","orders","support"].includes(role))throw new Error("معرّف المستخدم أو الصلاحية غير صالحة.");
 const {error}=await supabase.from("admin_users").insert({user_id:userId,role});
 if(error)throw new Error("تعذر إضافة المدير. تأكد أن المستخدم موجود في Auth: "+error.message);
 revalidatePath("/admin/team");
 redirect("/admin/team?created=1");
}
export async function deleteAdminUser(form: FormData) {
 const supabase=await requireRole(["owner"]),id=Number(text(form,"id"));
 const {data:{user}}=await supabase.auth.getUser();
 if(!Number.isInteger(id)||id<=0)throw new Error("معرّف المدير غير صالح.");
 const {data:target}=await supabase.from("admin_users").select("user_id,role").eq("id",id).maybeSingle();
 if(!target||target.user_id===user?.id||target.role==="owner")throw new Error("لا يمكن حذف حساب المالك أو حسابك الحالي.");
 const {error}=await supabase.from("admin_users").delete().eq("id",id);
 if(error)throw new Error("تعذر حذف المدير: "+error.message);
 revalidatePath("/admin/team");
 redirect("/admin/team?deleted=1");
}

export async function updateStoreSettings(form: FormData) {
 const supabase=await requireRole(["owner","admin"]);
 const rawPhone=text(form,"whatsapp_number").replace(/[^0-9+]/g,"");
 const instagram=text(form,"instagram_url");
 if(rawPhone && !/^\+?[0-9]{8,15}$/.test(rawPhone))throw new Error("رقم WhatsApp غير صالح. استخدم رمز الدولة ثم الرقم.");
 if(instagram && !/^https:\/\/(www\.)?instagram\.com\//i.test(instagram))throw new Error("رابط Instagram غير صالح.");
 const {error}=await supabase.from("store_settings").update({whatsapp_number:rawPhone||null,instagram_url:instagram||null,updated_at:new Date().toISOString()}).eq("id",true);
 if(error)throw new Error("تعذر حفظ إعدادات المتجر: "+error.message);
 revalidatePath("/admin/settings");revalidatePath("/");
 redirect("/admin/settings?saved=1");
}
