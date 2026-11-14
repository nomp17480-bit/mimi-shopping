"use client";

import { FormEvent, useMemo, useState } from "react";

type Variant={id:number;product_id:number;color:string;size:string;price_override:number|null;stock:number;is_active:boolean};
type Product={id:number;name:string;price:number;old_price?:number|null;description?:string|null;images?:unknown;stock:number;colors?:string[];variants:Variant[]};
type Rate={id:number;wilaya:string;home_price:number;desk_price:number};
type CartLine={key:string;product_id:number;variant_id:number|null;name:string;price:number;quantity:number;stock:number;color:string;size:string};
function imageFor(images:unknown){if(!Array.isArray(images))return null;const v=images[0];if(typeof v==="string")return v;if(v&&typeof v==="object"&&"url" in v&&typeof v.url==="string")return v.url;return null}
export default function StorefrontCatalog({products,rates}:{products:Product[];rates:Rate[]}) {
 const [cart,setCart]=useState<CartLine[]>([]),[choices,setChoices]=useState<Record<number,number>>({});
 const [message,setMessage]=useState(""),[loading,setLoading]=useState(false),[confirmed,setConfirmed]=useState("");
 const [wilaya,setWilaya]=useState(rates[0]?.wilaya??""),[method,setMethod]=useState<"home"|"desk">("home");
 const subtotal=useMemo(()=>cart.reduce((s,l)=>s+l.price*l.quantity,0),[cart]);
 const selectedRate=rates.find(r=>r.wilaya===wilaya);
 const shipping=selectedRate?(method==="home"?Number(selectedRate.home_price):Number(selectedRate.desk_price)):0;
 const total=subtotal+shipping;
 function add(product:Product){
  const variant=product.variants.length?product.variants.find(v=>v.id===choices[product.id])??product.variants[0]:null;
  const stock=variant?variant.stock:product.stock;
  if(stock<1){setMessage("هذا المنتج غير متوفر حالياً.");return}
  const key=product.id+":"+(variant?.id??"none");
  setCart(old=>{const existing=old.find(x=>x.key===key);if(existing){if(existing.quantity>=Math.min(10,stock)){setMessage("وصلت إلى الحد المتاح من المخزون.");return old}return old.map(x=>x.key===key?{...x,quantity:x.quantity+1}:x)}
   return [...old,{key,product_id:product.id,variant_id:variant?.id??null,name:product.name,price:Number(variant?.price_override??product.price),quantity:1,stock,color:variant?.color??"",size:variant?.size??""}]});
  setMessage("أُضيف المنتج إلى السلة.");
 }
 function changeQty(key:string,quantity:number){setCart(old=>old.map(x=>x.key===key?{...x,quantity:Math.max(1,Math.min(x.stock,10,quantity))}:x))}
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setMessage("");setConfirmed("");
  if(!cart.length){setMessage("السلة فارغة.");return}
  if(!selectedRate){setMessage("اختر ولاية يتوفر فيها التوصيل.");return}
  const formElement=event.currentTarget; const form=new FormData(formElement);
  const payload={customer_name:String(form.get("customer_name")??""),phone:String(form.get("phone")??""),wilaya,commune:String(form.get("commune")??""),address:String(form.get("address")??""),shipping_method:method,payment_method:"cod",customer_note:String(form.get("customer_note")??""),items:cart.map(x=>({product_id:x.product_id,variant_id:x.variant_id,quantity:x.quantity}))};
  setLoading(true);
  try{const response=await fetch("/api/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const result=await response.json();if(!response.ok)throw new Error(result.error||"تعذر تسجيل الطلب.");setConfirmed(result.order?.order_number??"تم تسجيل طلبك");setCart([]);formElement.reset();setMessage("")}
  catch(error){setMessage(error instanceof Error?error.message:"حدث خطأ غير متوقع.")}
  finally{setLoading(false)}
 }
 return <>
  <div className="product-grid">
   {products.map(product=>{const selected=product.variants.find(v=>v.id===choices[product.id])??product.variants[0];const available=product.variants.length?selected?.stock??0:product.stock;return <article className="product-card" key={product.id}>
    <div className="product-image">{imageFor(product.images)?<img src={imageFor(product.images)!} alt={product.name}/>:<div className="image-placeholder">M</div>}<span className="product-tag">MIMI PICK</span></div>
    <div className="product-info"><h3>{product.name}</h3>{product.description?<p>{product.description}</p>:null}
     {product.variants.length?<div className="variant-select"><label>اللون / المقاس</label><select value={selected?.id??""} onChange={e=>setChoices(old=>({...old,[product.id]:Number(e.target.value)}))}>{product.variants.map(v=><option key={v.id} value={v.id}>{[v.color,v.size].filter(Boolean).join(" / ")||"الخيار"} — {v.stock} متوفر</option>)}</select></div>:null}
     <strong>{Number(selected?.price_override??product.price).toLocaleString("ar-DZ")} دج</strong><button className="add-cart-button" disabled={available<1} onClick={()=>add(product)}>{available>0?"أضيفي إلى السلة":"غير متوفر"}</button>
    </div>
   </article>})}
  </div>
  {cart.length>0?<section className="cart-checkout" id="checkout"><div className="cart-head"><div><span className="eyebrow">YOUR BAG</span><h2>سلة مشترياتك ({cart.reduce((s,x)=>s+x.quantity,0)})</h2></div><button type="button" className="cart-clear" onClick={()=>setCart([])}>إفراغ السلة</button></div>
   <div className="cart-lines">{cart.map(line=><div className="cart-line" key={line.key}><div><strong>{line.name}</strong><small>{[line.color,line.size].filter(Boolean).join(" / ")||"—"} · {line.price.toLocaleString("ar-DZ")} دج</small></div><div className="qty-control"><button type="button" onClick={()=>changeQty(line.key,line.quantity-1)}>−</button><span>{line.quantity}</span><button type="button" onClick={()=>changeQty(line.key,line.quantity+1)}>+</button></div><strong>{(line.price*line.quantity).toLocaleString("ar-DZ")} دج</strong></div>)}</div>
   <form className="checkout-form" onSubmit={submit}><h3>معلومات التوصيل</h3><div className="checkout-grid"><label>الاسم الكامل<input name="customer_name" required minLength={2} maxLength={120}/></label><label>رقم الهاتف<input name="phone" required type="tel" maxLength={30} placeholder="05 / 06 / 07 ..."/></label><label>الولاية<select value={wilaya} onChange={e=>setWilaya(e.target.value)} required>{rates.map(r=><option key={r.id} value={r.wilaya}>{r.wilaya}</option>)}</select></label><label>البلدية<input name="commune" required/></label></div><label>العنوان بالتفصيل<input name="address" required minLength={4}/></label><label>ملاحظة للطلب (اختياري)<textarea name="customer_note" rows={2}/></label><label>طريقة التوصيل<select value={method} onChange={e=>setMethod(e.target.value as "home"|"desk")}><option value="home">إلى المنزل</option><option value="desk">إلى مكتب التوصيل</option></select></label><div className="checkout-total"><span>المنتجات</span><strong>{subtotal.toLocaleString("ar-DZ")} دج</strong><span>التوصيل</span><strong>{shipping.toLocaleString("ar-DZ")} دج</strong><span>الإجمالي</span><strong>{total.toLocaleString("ar-DZ")} دج</strong></div><p className="cod-note">الدفع عند الاستلام. الدفع الإلكتروني سيُفعّل بعد ربط بوابة دفع معتمدة.</p><button className="primary-button checkout-submit" disabled={loading||!rates.length}>{loading?"جارٍ إرسال الطلب...":"تأكيد الطلب"}</button>{message?<p className="checkout-error">{message}</p>:null}</form>
  </section>:null}
  {confirmed?<div className="order-confirmation"><strong>تم استلام طلبك بنجاح</strong><p>رقم الطلب: {confirmed}</p><span>سنتواصل معك لتأكيد تفاصيل التوصيل.</span></div>:null}
 </>;
}
