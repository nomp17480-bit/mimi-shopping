import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { createProduct, updateProduct, deleteProduct, createCategory } from "./actions";

type Product = {
  id: number; name: string; price: number; old_price: number | null; stock: number;
  category_id: number | null; description: string | null; colors: string[]; images: string[];
  material: string | null; size: string | null; dimensions: string | null; features: string[];
  is_active: boolean;
};
type Category = { id: number; name: string };

function ProductFields({ product, categories }: { product?: Product; categories: Category[] }) {
  return <>
    <label>اسم المنتج *</label><input name="name" required defaultValue={product?.name ?? ""} placeholder="مثال: حقيبة كلاسيكية" />
    <div className="admin-field-grid">
      <div><label>السعر (دج) *</label><input name="price" type="number" min="0" step="0.01" required defaultValue={product?.price ?? ""} /></div>
      <div><label>السعر قبل التخفيض</label><input name="old_price" type="number" min="0" step="0.01" defaultValue={product?.old_price ?? ""} /></div>
      <div><label>المخزون الإجمالي</label><input name="stock" type="number" min="0" step="1" required defaultValue={product?.stock ?? 0} /></div>
      <div><label>القسم</label><select name="category_id" defaultValue={product?.category_id ?? ""}><option value="">بدون قسم</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
    </div>
    <label>الوصف</label><textarea name="description" rows={3} defaultValue={product?.description ?? ""} />
    <label>الألوان (افصل بينها بفاصلة)</label><input name="colors" defaultValue={product?.colors?.join(", ") ?? ""} placeholder="أسود، بيج، بني" />
    <label>روابط الصور (رابط في كل سطر)</label><textarea name="images" rows={3} defaultValue={product?.images?.join("\n") ?? ""} placeholder="https://..." />
    <div className="admin-field-grid">
      <div><label>المادة</label><input name="material" defaultValue={product?.material ?? ""} /></div>
      <div><label>المقاس</label><input name="size" defaultValue={product?.size ?? ""} /></div>
    </div>
    <label>الأبعاد</label><input name="dimensions" defaultValue={product?.dimensions ?? ""} placeholder="الطول × العرض × الارتفاع" />
    <label>المميزات (افصل بينها بفاصلة)</label><input name="features" defaultValue={product?.features?.join(", ") ?? ""} />
    <label className="admin-check"><input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} /> عرض المنتج في المتجر</label>
  </>;
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ created?: string; updated?: string; deleted?: string; categoryCreated?: string }> }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: admin, error: adminError } = await supabase.from("admin_users").select("role").eq("user_id", user.id).maybeSingle();
  if (adminError || !admin) return <main className="admin-shell"><section className="admin-panel"><a className="admin-brand" href="/">Mimi <span>SHOPPING</span></a><h1>الحساب غير مفعّل كمدير</h1><p>هذا الحساب غير موجود ضمن قائمة مدراء المتجر.</p><form action="/auth/signout" method="post"><button className="admin-secondary">تسجيل الخروج</button></form></section></main>;
  const [{ count: productsCount }, { count: ordersCount }, { data: categoriesData }, { data: productsData, error: productsError }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("id,name").order("id"),
    supabase.from("products").select("id,name,price,old_price,stock,category_id,description,colors,images,material,size,dimensions,features,is_active").order("created_at", { ascending: false }),
  ]);
  const categories = (categoriesData ?? []) as Category[];
  const products = (productsData ?? []) as Product[];
  const canManageCatalog = ["owner", "admin", "catalog"].includes(admin.role);
  return <main className="admin-dashboard">
    <header className="admin-top"><Link href="/" className="admin-brand">Mimi <span>SHOPPING</span></Link><span>صلاحية: {admin.role}</span><form action="/auth/signout" method="post"><button className="admin-secondary">خروج</button></form></header>
    <section className="admin-content">
      <span className="eyebrow">STORE MANAGEMENT</span><h1>لوحة إدارة Mimi Shopping</h1><p>مرحباً {user.email}. إدارة المتجر محمية بحسابك.</p>
      <div className="admin-stats"><article><small>المنتجات</small><strong>{productsCount ?? 0}</strong></article><article><small>الطلبات</small><strong>{ordersCount ?? 0}</strong></article><article><small>الأقسام</small><strong>{categories.length}</strong></article></div>
      {params.created ? <p className="admin-success">تمت إضافة المنتج بنجاح.</p> : null}{params.updated ? <p className="admin-success">تم حفظ تعديلات المنتج.</p> : null}{params.deleted ? <p className="admin-success">تم حذف المنتج.</p> : null}{params.categoryCreated ? <p className="admin-success">تمت إضافة القسم.</p> : null}
      {productsError ? <p className="admin-error">تعذر تحميل المنتجات: {productsError.message}</p> : null}
      {canManageCatalog ? <>
        <section className="admin-section"><h2>إضافة منتج جديد</h2><form className="admin-product-form" action={createProduct}><ProductFields categories={categories}/><button className="admin-primary">حفظ المنتج</button></form></section>
        <section className="admin-section"><h2>المنتجات الحالية ({products.length})</h2>{products.length ? <div className="admin-product-list">{products.map(product=><details className="admin-product" key={product.id}><summary><span>{product.name}</span><span>{Number(product.price).toLocaleString("fr-DZ")} دج · مخزون {product.stock} · {product.is_active ? "نشط" : "مخفي"}</span></summary><form className="admin-product-form" action={updateProduct}><input type="hidden" name="id" value={product.id}/><ProductFields product={product} categories={categories}/><button className="admin-primary">حفظ التعديلات</button></form><form action={deleteProduct} className="admin-delete-form"><input type="hidden" name="id" value={product.id}/><button className="admin-danger">حذف المنتج</button></form></details>)}</div> : <p className="admin-muted">لم تتم إضافة أي منتجات بعد.</p>}</section>
        <section className="admin-section"><h2>إضافة قسم</h2><form action={createCategory} className="admin-category-form"><label>اسم القسم</label><input name="name" required placeholder="مثال: حقائب السفر"/><label>رمز القسم بالإنجليزية</label><input name="slug" required placeholder="travel-bags"/><label>الأيقونة</label><input name="icon" defaultValue="👜" maxLength={8}/><button className="admin-primary">إضافة القسم</button></form></section>
      </> : <p className="admin-notice">حسابك لديه صلاحيات محدودة ولا يمكنه إدارة المنتجات.</p>}
    </section>
  </main>;
}
