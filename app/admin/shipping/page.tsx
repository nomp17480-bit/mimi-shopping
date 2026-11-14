import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { initializeWilayas, updateShippingRate } from "../actions";
export default async function ShippingPage({searchParams}:{searchParams:Promise<{initialized?:string;updated?:string}>}) {
 const params=await searchParams,supabase=await createSupabaseServerClient();
 const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/admin/login");
 const {data:admin}=await supabase.from("admin_users").select("role").eq("user_id",user.id).maybeSingle();
 if(!admin||!["owner","admin","catalog"].includes(admin.role))return <main className="admin-shell"><section className="admin-panel"><h1>غير مصرح</h1><Link href="/admin">العودة</Link></section></main>;
 const {data:rates,error}=await supabase.from("shipping_rates").select("id,wilaya,home_price,desk_price,active").order("wilaya");
 return <main className="admin-dashboard"><header className="admin-top"><Link href="/admin" className="admin-brand">Mimi <span>SHOPPING</span></Link><Link href="/admin">لوحة الإدارة</Link></header><section className="admin-content"><span className="eyebrow">DELIVERY SETTINGS</span><h1>أسعار التوصيل للولايات</h1><p>الأسعار الافتراضية صفر حتى تضبط الأسعار الفعلية. لا يتم تخمين أي سعر.</p>
 {params.initialized?<p className="admin-success">تم تجهيز قائمة الولايات الـ58. أدخل أسعارك.</p>:null}{params.updated?<p className="admin-success">تم حفظ سعر التوصيل.</p>:null}
 {!(rates?.length)?<section className="admin-section"><h2>تجهيز قائمة الولايات</h2><p className="admin-muted">سيُنشئ 58 ولاية بقيم توصيل صفرية لتقوم بإدخال الأسعار الحقيقية لاحقاً.</p><form action={initializeWilayas}><button className="admin-primary">تجهيز الولايات الـ58</button></form></section>:<section className="admin-section"><h2>الولايات ({rates?.length??0}/58)</h2><div className="admin-product-list">{(rates??[]).map(r=><form className="admin-product-form admin-rate-row" action={updateShippingRate} key={r.id}><input type="hidden" name="id" value={r.id}/><strong>{r.wilaya}</strong><div className="admin-field-grid"><div><label>توصيل للمنزل (دج)</label><input type="number" name="home_price" min="0" step="1" defaultValue={r.home_price} required/></div><div><label>توصيل للمكتب (دج)</label><input type="number" name="desk_price" min="0" step="1" defaultValue={r.desk_price} required/></div></div><label className="admin-check"><input type="checkbox" name="active" defaultChecked={r.active}/> التوصيل متاح</label><button className="admin-primary">حفظ السعر</button></form>)}</div></section>}
 </section></main>;
}
