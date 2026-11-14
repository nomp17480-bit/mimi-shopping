import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { createAdminUser, deleteAdminUser } from "../actions";
const roles:Record<string,string>={owner:"مالك",admin:"مدير",catalog:"المنتجات والمخزون",orders:"الطلبات",support:"الدعم"};
export default async function TeamPage({searchParams}:{searchParams:Promise<{created?:string;deleted?:string}>}) {
 const params=await searchParams,supabase=await createSupabaseServerClient();
 const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/admin/login");
 const {data:admin}=await supabase.from("admin_users").select("role").eq("user_id",user.id).maybeSingle();
 if(admin?.role!=="owner")return <main className="admin-shell"><section className="admin-panel"><h1>هذه الصفحة للمالك فقط</h1><Link href="/admin">العودة</Link></section></main>;
 const {data:members}=await supabase.from("admin_users").select("id,user_id,role,created_at").order("created_at");
 return <main className="admin-dashboard"><header className="admin-top"><Link href="/admin" className="admin-brand">Mimi <span>SHOPPING</span></Link><Link href="/admin">لوحة الإدارة</Link></header><section className="admin-content"><span className="eyebrow">TEAM ACCESS</span><h1>المدراء والصلاحيات</h1><p>أضف مستخدماً أنشأته مسبقاً في Supabase Auth باستخدام UID الخاص به. لا تُدخل كلمة مروره هنا.</p>{params.created?<p className="admin-success">تمت إضافة المدير.</p>:null}{params.deleted?<p className="admin-success">تم حذف صلاحية المدير.</p>:null}
 <section className="admin-section"><h2>إضافة مدير</h2><form action={createAdminUser} className="admin-product-form"><label>معرّف المستخدم UID</label><input name="user_id" required placeholder="UUID من Supabase Auth → Users"/><label>الصلاحية</label><select name="role"><option value="admin">مدير كامل (دون إدارة المالكين)</option><option value="catalog">المنتجات والمخزون</option><option value="orders">الطلبات</option><option value="support">الدعم (دخول فقط حالياً)</option></select><button className="admin-primary">إضافة الصلاحية</button></form></section>
 <section className="admin-section"><h2>الحسابات الحالية</h2><div className="admin-product-list">{(members??[]).map(m=><div className="admin-product" key={m.id}><strong>{roles[m.role]??m.role}</strong><p style={{fontSize:11,wordBreak:"break-all"}}>{m.user_id}</p>{m.role!=="owner"&&m.user_id!==user.id?<form action={deleteAdminUser}><input type="hidden" name="id" value={m.id}/><button className="admin-danger">إلغاء الصلاحية</button></form>:<small>حساب محمي</small>}</div>)}</div></section></section></main>;
}
