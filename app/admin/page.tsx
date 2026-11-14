import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: admin, error } = await supabase.from("admin_users").select("role").eq("user_id", user.id).maybeSingle();
  if (error || !admin) return <main className="admin-shell"><section className="admin-panel"><a className="admin-brand" href="/">Mimi <span>SHOPPING</span></a><h1>الحساب غير مفعّل كمدير</h1><p>تم تسجيل الدخول، لكن هذا الحساب غير موجود ضمن قائمة مدراء المتجر. لا يمكن الوصول إلى لوحة التحكم قبل منح الصلاحية من قاعدة البيانات.</p><form action="/auth/signout" method="post"><button className="admin-secondary">تسجيل الخروج</button></form></section></main>;
  const [{ count: products }, { count: orders }, { count: categories }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
  ]);
  return <main className="admin-dashboard"><header className="admin-top"><Link href="/" className="admin-brand">Mimi <span>SHOPPING</span></Link><span>صلاحية: {admin.role}</span><form action="/auth/signout" method="post"><button className="admin-secondary">خروج</button></form></header><section className="admin-content"><span className="eyebrow">STORE MANAGEMENT</span><h1>لوحة إدارة Mimi Shopping</h1><p>مرحباً {user.email}. هذه لوحة الإدارة المحمية.</p><div className="admin-stats"><article><small>المنتجات</small><strong>{products ?? 0}</strong></article><article><small>الطلبات</small><strong>{orders ?? 0}</strong></article><article><small>الأقسام</small><strong>{categories ?? 0}</strong></article></div><div className="admin-notice">تم تجهيز بوابة الدخول والتحقق من دور المدير. أدوات تعديل المنتجات والطلبات ستُفعّل بعد تجهيز جداول الصلاحيات ومراجعة سياسات قاعدة البيانات.</div></section></main>;
}
