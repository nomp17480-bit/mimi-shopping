import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { updateStoreSettings } from "../actions";
export default async function SettingsPage({searchParams}:{searchParams:Promise<{saved?:string}>}) {
 const params=await searchParams,supabase=await createSupabaseServerClient();
 const {data:{user}}=await supabase.auth.getUser();if(!user)redirect("/admin/login");
 const {data:admin}=await supabase.from("admin_users").select("role").eq("user_id",user.id).maybeSingle();
 if(!admin||!["owner","admin"].includes(admin.role))return <main className="admin-shell"><section className="admin-panel"><h1>غير مصرح</h1><Link href="/admin">العودة</Link></section></main>;
 const {data:settings}=await supabase.from("store_settings").select("whatsapp_number,instagram_url").eq("id",true).maybeSingle();
 return <main className="admin-dashboard"><header className="admin-top"><Link href="/admin" className="admin-brand">Mimi <span>SHOPPING</span></Link><Link href="/admin">لوحة الإدارة</Link></header><section className="admin-content"><span className="eyebrow">STORE SETTINGS</span><h1>إعدادات التواصل</h1><p>يُستخدم رقم WhatsApp لإظهار زر إرسال تفاصيل الطلب للمتجر بعد إتمام الطلب.</p>{params.saved?<p className="admin-success">تم حفظ الإعدادات.</p>:null}<section className="admin-section"><form action={updateStoreSettings} className="admin-product-form"><label>رقم WhatsApp مع رمز الدولة</label><input name="whatsapp_number" type="tel" defaultValue={settings?.whatsapp_number??""} placeholder="+213xxxxxxxxx"/><small>مثال الجزائر: +213 ثم الرقم دون الصفر الأول.</small><label>رابط Instagram</label><input name="instagram_url" type="url" defaultValue={settings?.instagram_url??""} placeholder="https://www.instagram.com/yourstore/"/><button className="admin-primary">حفظ الإعدادات</button></form></section></section></main>;
}
