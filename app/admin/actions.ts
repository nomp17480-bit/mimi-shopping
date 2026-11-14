"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";

async function requireCatalogAccess() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: admin } = await supabase.from("admin_users").select("role").eq("user_id", user.id).maybeSingle();
  if (!admin || !["owner", "admin", "catalog"].includes(admin.role)) {
    throw new Error("ليست لديك صلاحية إدارة المنتجات.");
  }
  return supabase;
}

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function list(value: string) {
  return value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
}

function productValues(form: FormData) {
  const name = text(form, "name");
  const price = Number(text(form, "price"));
  const oldPriceRaw = text(form, "old_price");
  const stock = Number(text(form, "stock"));
  const categoryRaw = text(form, "category_id");
  if (!name) throw new Error("اسم المنتج مطلوب.");
  if (!Number.isFinite(price) || price < 0) throw new Error("السعر غير صالح.");
  if (!Number.isInteger(stock) || stock < 0) throw new Error("المخزون يجب أن يكون عدداً صحيحاً موجباً أو صفراً.");
  const oldPrice = oldPriceRaw ? Number(oldPriceRaw) : null;
  if (oldPrice !== null && (!Number.isFinite(oldPrice) || oldPrice < 0)) throw new Error("السعر القديم غير صالح.");
  return {
    name,
    price,
    old_price: oldPrice,
    stock,
    category_id: categoryRaw ? Number(categoryRaw) : null,
    description: text(form, "description") || null,
    material: text(form, "material") || null,
    size: text(form, "size") || null,
    dimensions: text(form, "dimensions") || null,
    colors: list(text(form, "colors")),
    images: list(text(form, "images")),
    features: list(text(form, "features")),
    is_active: form.get("is_active") === "on",
  };
}

export async function createProduct(form: FormData) {
  const supabase = await requireCatalogAccess();
  const values = productValues(form);
  const { error } = await supabase.from("products").insert(values);
  if (error) throw new Error("تعذرت إضافة المنتج: " + error.message);
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin?created=1");
}

export async function updateProduct(form: FormData) {
  const supabase = await requireCatalogAccess();
  const id = Number(text(form, "id"));
  if (!Number.isInteger(id) || id <= 0) throw new Error("معرّف المنتج غير صالح.");
  const values = productValues(form);
  const { error } = await supabase.from("products").update(values).eq("id", id);
  if (error) throw new Error("تعذر تحديث المنتج: " + error.message);
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin?updated=1");
}

export async function deleteProduct(form: FormData) {
  const supabase = await requireCatalogAccess();
  const id = Number(text(form, "id"));
  if (!Number.isInteger(id) || id <= 0) throw new Error("معرّف المنتج غير صالح.");
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error("تعذر حذف المنتج: " + error.message);
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin?deleted=1");
}

export async function createCategory(form: FormData) {
  const supabase = await requireCatalogAccess();
  const name = text(form, "name");
  const slug = text(form, "slug").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
  if (!name || !slug) throw new Error("اسم القسم ورمزه مطلوبان.");
  const { error } = await supabase.from("categories").insert({ name, slug, icon: text(form, "icon") || "👜" });
  if (error) throw new Error("تعذرت إضافة القسم: " + error.message);
  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin?categoryCreated=1");
}
