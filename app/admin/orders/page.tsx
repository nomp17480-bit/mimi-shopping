import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { updateOrder } from "../actions";

const statuses = ["جديد","قيد التأكيد","مؤكد","قيد التحضير","تم الشحن","تم التسليم","ملغي","مرتجع"];
const paymentLabels: Record<string,string> = { pending:"بانتظار الدفع", paid:"مدفوع", failed:"فشل الدفع", refunded:"مسترجع" };
export default async function OrdersPage({searchParams}:{searchParams:Promise<{updated?:string}>}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {data:{user}} = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const {data:admin} = await supabase.from("admin_users").select("role").eq("user_id",user.id).maybeSingle();
  if (!admin || !["owner","admin","orders","support"].includes(admin.role)) return <main className="admin-shell"><section className="admin-panel"><h1>غير مصرح</h1><p>ليس لديك صلاحية إدارة الطلبات.</p><Link href="/admin">العودة للوحة الإدارة</Link></section></main>;
  const {data:orders,error} = await supabase.from("orders").select("id,order_number,customer_name,phone,wilaya,commune,address,status,total,payment_method,payment_status,shipping_method,shipping_fee,customer_note,created_at").order("created_at",{ascending:false}).limit(200);
  const ids = (orders ?? []).map(o=>o.id);
  const {data:items} = ids.length ? await supabase.from("order_items").select("order_id,product_name,selected_color,selected_size,unit_price,quantity,line_total").in("order_id",ids) : {data:[]};
  return <main className="admin-dashboard">
    <header className="admin-top"><Link href="/admin" className="admin-brand">Mimi <span>SHOPPING</span></Link><Link href="/admin">لوحة الإدارة</Link><form action="/auth/signout" method="post"><button className="admin-secondary">خروج</button></form></header>
    <section className="admin-content"><span className="eyebrow">ORDER MANAGEMENT</span><h1>إدارة الطلبات</h1><p>مرحباً {user.email} — آخر 200 طلب.</p>
      {params.updated ? <p className="admin-success">تم تحديث الطلب.</p> : null}
      {error ? <p className="admin-error">تعذر تحميل الطلبات: {error.message}</p> : null}
      {!(orders?.length) ? <section className="admin-section"><p className="admin-muted">لا توجد طلبات حالياً. ستظهر الطلبات هنا بعد تفعيل استقبال الطلبات الآمن.</p></section> : <div className="admin-product-list">{orders!.map(order=>{
        const orderItems=(items??[]).filter(item=>item.order_id===order.id);
        return <details className="admin-section" key={order.id} open><summary><strong>{order.order_number || "طلب #"+order.id} — {order.customer_name}</strong><span>{Number(order.total).toLocaleString("fr-DZ")} دج · {order.status}</span></summary>
          <div className="admin-order-info"><p>الهاتف: <a href={"tel:"+order.phone}>{order.phone}</a></p><p>الولاية: {order.wilaya || "—"} · البلدية: {order.commune || "—"}</p><p>العنوان: {order.address || "—"}</p><p>التوصيل: {order.shipping_method==="desk"?"مكتب":"للمنزل"} · {Number(order.shipping_fee).toLocaleString("fr-DZ")} دج</p><p>الدفع: {order.payment_method} · {paymentLabels[order.payment_status] || order.payment_status}</p>{order.customer_note?<p>ملاحظة: {order.customer_note}</p>:null}<h3>المنتجات</h3>{orderItems.map((item,i)=><p key={i}>{item.product_name} {item.selected_color||""} {item.selected_size||""} × {item.quantity} — {Number(item.line_total).toLocaleString("fr-DZ")} دج</p>)}</div>
          {admin.role!=="support"?<form action={updateOrder} className="admin-order-form"><input type="hidden" name="id" value={order.id}/><div><label>حالة الطلب</label><select name="status" defaultValue={order.status}>{statuses.map(s=><option key={s}>{s}</option>)}</select></div><div><label>حالة الدفع</label><select name="payment_status" defaultValue={order.payment_status}>{Object.entries(paymentLabels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div><button className="admin-primary">حفظ الحالة</button></form>:<p className="admin-muted">صلاحية الدعم: عرض فقط.</p>}
        </details>;
      })}</div>}
    </section>
  </main>;
}
