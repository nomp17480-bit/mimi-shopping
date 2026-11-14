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
