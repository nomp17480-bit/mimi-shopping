"use client";

import { FormEvent, useMemo, useState } from "react";
import locationData from "../data/algeria-locations.json";

type Variant={id:number;product_id:number;color:string;size:string;price_override:number|null;stock:number;is_active:boolean};
type Product={id:number;name:string;price:number;old_price?:number|null;description?:string|null;images?:unknown;stock:number;colors?:string[];category_id:number|null;variants:Variant[]};
type Category={id:number;name:string;icon?:string|null};
type Rate={id:number;wilaya:string;home_price:number;desk_price:number};
type CartLine={key:string;product_id:number;variant_id:number|null;name:string;price:number;quantity:number;stock:number;color:string;size:string};
function imageList(images:unknown):string[]{let values:unknown[]=[];if(Array.isArray(images))values=images;else if(typeof images==="string"){const raw=images.trim();if(!raw)return [];try{const parsed=JSON.parse(raw);values=Array.isArray(parsed)?parsed:raw.split(/\r?\n/)}catch{values=raw.split(/\r?\n/)}}return values.map(v=>typeof v==="string"?v:v&&typeof v==="object"&&"url" in v&&typeof v.url==="string"?v.url:"").filter((v):v is string=>/^https?:\/\//i.test(v))}
export default function StorefrontCatalog({products,rates,whatsapp,categories}:{products:Product[];rates:Rate[];whatsapp:string;categories:Category[]}) {
 const [cart,setCart]=useState<CartLine[]>([]),[choices,setChoices]=useState<Record<number,number>>({});
 const [message,setMessage]=useState(""),[loading,setLoading]=useState(false),[confirmed,setConfirmed]=useState(""),[whatsappLink,setWhatsappLink]=useState("");
 const [search,setSearch]=useState(""),[categoryFilter,setCategoryFilter]=useState("all");
 const visibleProducts=useMemo(()=>products.filter(p=>(categoryFilter==="all"||String(p.category_id??"")===categoryFilter)&&(!search.trim()||p.name.toLocaleLowerCase("ar").includes(search.trim().toLocaleLowerCase("ar"))||(p.description??"").toLocaleLowerCase("ar").includes(search.trim().toLocaleLowerCase("ar")))),[products,categoryFilter,search]);
 const [wilayaCode,setWilayaCode]=useState(""),[commune,setCommune]=useState(""),[method,setMethod]=useState<"home"|"desk">("home");
 const wilayaOptions=locationData.wilayas;
 const selectedWilaya=wilayaOptions.find(w=>w.code===wilayaCode);
 const wilaya=selectedWilaya?selectedWilaya.code+" - "+selectedWilaya.name:"";
 const communes=useMemo(()=>locationData.communes.filter(c=>c.wilayaCode===wilayaCode),[wilayaCode]);
 const subtotal=useMemo(()=>cart.reduce((s,l)=>s+l.price*l.quantity,0),[cart]);
 const selectedRate=rates.find(r=>r.wilaya.trim()===wilaya);
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
  if(!selectedWilaya||!communes.some(c=>c.name===commune)){setMessage("اختر الولاية والبلدية من القائمتين.");return}
  if(!selectedRate){setMessage("التوصيل غير متاح حالياً في الولاية المختارة.");return}
  const formElement=event.currentTarget; const form=new FormData(formElement);
  const payload={customer_name:String(form.get("customer_name")??""),phone:String(form.get("phone")??""),wilaya,commune,address:String(form.get("address")??""),shipping_method:method,payment_method:"cod",customer_note:String(form.get("customer_note")??""),items:cart.map(x=>({product_id:x.product_id,variant_id:x.variant_id,quantity:x.quantity}))};
  setLoading(true);
  try{const response=await fetch("/api/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const result=await response.json();if(!response.ok)throw new Error(result.error||"تعذر تسجيل الطلب.");setConfirmed(result.order?.order_number??"تم تسجيل طلبك");const digits=whatsapp.replace(/[^0-9]/g,"");const note=encodeURIComponent("طلب جديد من Mimi Shopping\nرقم الطلب: "+(result.order?.order_number??"")+"\nالإجمالي: "+Number(result.order?.total??total).toLocaleString("ar-DZ")+" دج");setWhatsappLink(digits?"https://wa.me/"+digits+"?text="+note:"");setCart([]);formElement.reset();setWilayaCode("");setCommune("");setMessage("")}
  catch(error){setMessage(error instanceof Error?error.message:"حدث خطأ غير متوقع.")}
  finally{setLoading(false)}
 }
 return <>
  <div className="product-grid">
   {products.map(product=>{const selected=product.variants.find(v=>v.id===choices[product.id])??product.variants[0];const available=product.variants.length?selected?.stock??0:product.stock;return <article className="product-card" key={product.id}>
    <div className="product-image">{imageList(product.images).length?<img src={imageList(product.images)[0]} alt={product.name} loading="lazy" onError={e=>e.currentTarget.parentElement?.classList.add("image-failed")}/>:<div className="image-placeholder"><span>M</span><small>صورة المنتج قريباً</small></div>}<span className="product-tag">MIMI PICK</span>{available<1?<span className="stock-tag">نفد المخزون</span>:null}</div>
    <div className="product-info"><h3>{product.name}</h3>{product.description?<p>{product.description}</p>:null}
     {product.variants.length?<div className="variant-select"><label>اللون / المقاس</label><select value={selected?.id??""} onChange={e=>setChoices(old=>({...old,[product.id]:Number(e.target.value)}))}>{product.variants.map(v=><option key={v.id} value={v.id}>{[v.color,v.size].filter(Boolean).join(" / ")||"الخيار"} — {v.stock} متوفر</option>)}</select></div>:null}
     {!product.variants.length&&product.colors?.length?<div className="product-colors"><small>الألوان المتاحة:</small><span>{product.colors.join(" · ")}</span></div>:null}\n     <div className="product-price"><strong>{Number(selected?.price_override??product.price).toLocaleString("ar-DZ")} دج</strong>{product.old_price&&product.old_price>Number(selected?.price_override??product.price)?<del>{Number(product.old_price).toLocaleString("ar-DZ")} دج</del>:null}</div><small className="product-availability">{available>0?("متوفر · "+available+" في المخزون"):"غير متوفر حالياً"}</small><button className="add-cart-button" disabled={available<1} onClick={()=>add(product)}>{available>0?"أضيفي إلى السلة":"غير متوفر"}</button>
    </div>
   </article>})}
  </div>
  {cart.length>0?<section className="cart-checkout" id="checkout"><div className="cart-head"><div><span className="eyebrow">YOUR BAG</span><h2>سلة مشترياتك ({cart.reduce((s,x)=>s+x.quantity,0)})</h2></div><button type="button" className="cart-clear" onClick={()=>setCart([])}>إفراغ السلة</button></div>
   <div className="cart-lines">{cart.map(line=><div className="cart-line" key={line.key}><div><strong>{line.name}</strong><small>{[line.color,line.size].filter(Boolean).join(" / ")||"—"} · {line.price.toLocaleString("ar-DZ")} دج</small></div><div className="qty-control"><button type="button" onClick={()=>changeQty(line.key,line.quantity-1)}>−</button><span>{line.quantity}</span><button type="button" onClick={()=>changeQty(line.key,line.quantity+1)}>+</button></div><strong>{(line.price*line.quantity).toLocaleString("ar-DZ")} دج</strong></div>)}</div>
   <form className="checkout-form" onSubmit={submit}><h3>معلومات التوصيل</h3><div className="checkout-grid"><label>الاسم الكامل<input name="customer_name" required minLength={2} maxLength={120}/></label><label>رقم الهاتف<input name="phone" required type="tel" maxLength={30} placeholder="05 / 06 / 07 ..."/></label><label>الولاية<select value={wilayaCode} onChange={e=>{setWilayaCode(e.target.value);setCommune("");}} required><option value="">اختر الولاية</option>{wilayaOptions.map(w=><option key={w.code} value={w.code}>{w.code} - {w.name}</option>)}</select></label><label>البلدية<select name="commune" value={commune} onChange={e=>setCommune(e.target.value)} required disabled={!wilayaCode}><option value="">{wilayaCode?"اختر البلدية":"اختر الولاية أولاً"}</option>{communes.map((c,i)=><option key={c.name+"-"+c.daira+"-"+i} value={c.name}>{c.name}</option>)}</select></label></div>{selectedWilaya&&!selectedRate?<p className="checkout-error">التوصيل غير مفعّل حالياً في ولاية {selectedWilaya.name}. اختر ولاية أخرى أو تواصل معنا.</p>:null}<label>العنوان بالتفصيل<input name="address" required minLength={4}/></label><label>ملاحظة للطلب (اختياري)<textarea name="customer_note" rows={2}/></label><label>طريقة التوصيل<select value={method} onChange={e=>setMethod(e.target.value as "home"|"desk")} disabled={!selectedRate}><option value="home">إلى المنزل</option><option value="desk">إلى مكتب التوصيل</option></select></label><div className="checkout-total"><span>المنتجات</span><strong>{subtotal.toLocaleString("ar-DZ")} دج</strong><span>التوصيل</span><strong>{selectedRate?shipping.toLocaleString("ar-DZ")+" دج":"غير متاح"}</strong><span>الإجمالي</span><strong>{selectedRate?total.toLocaleString("ar-DZ")+" دج":"يُحسب بعد تفعيل التوصيل"}</strong></div><p className="cod-note">الدفع عند الاستلام. الدفع الإلكتروني سيُفعّل بعد ربط بوابة دفع معتمدة.</p><button className="primary-button checkout-submit" disabled={loading||!selectedRate}>{loading?"جارٍ إرسال الطلب...":"تأكيد الطلب"}</button>{message?<p className="checkout-error">{message}</p>:null}</form>
  </section>:null}
  {confirmed?<div className="order-confirmation"><strong>تم استلام طلبك بنجاح</strong><p>رقم الطلب: {confirmed}</p><span>سنتواصل معك لتأكيد تفاصيل التوصيل.</span>{whatsappLink?<p><a className="whatsapp-order-link" href={whatsappLink} target="_blank" rel="noreferrer">إرسال تفاصيل الطلب عبر WhatsApp</a></p>:<small>يمكن للمتجر تفعيل زر WhatsApp من إعدادات الإدارة.</small>}</div>:null}
 </>;
}
