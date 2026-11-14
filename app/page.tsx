import StorefrontCatalog from "../components/storefront-catalog";
import { supabase } from "../lib/supabase";

type Category = { id: number; name: string; icon?: string | null; slug?: string | null };
type Product = { id:number; name:string; price:number; old_price:number|null; description:string|null; images:unknown; category_id:number|null; stock:number; colors:string[] };
type Variant = {id:number;product_id:number;color:string;size:string;price_override:number|null;stock:number;is_active:boolean};
type Rate = {id:number;wilaya:string;home_price:number;desk_price:number};
async function getStoreData() {
 if(!supabase)return {categories:[] as Category[],products:[] as Product[],variants:[] as Variant[],rates:[] as Rate[],settings:null as {whatsapp_number:string|null;instagram_url:string|null}|null,connected:false};
 try {
  const [c,p,v,r,s]=await Promise.all([
   supabase.from("categories").select("id,name,icon,slug").order("id"),
   supabase.from("products").select("id,name,price,old_price,description,images,category_id,stock,colors").eq("is_active",true).order("created_at",{ascending:false}),
   supabase.from("product_variants").select("id,product_id,color,size,price_override,stock,is_active").eq("is_active",true),
   supabase.from("shipping_rates").select("id,wilaya,home_price,desk_price").eq("active",true).order("wilaya"),\n   supabase.from("store_settings").select("whatsapp_number,instagram_url").eq("id",true).maybeSingle()
  ]);
  if(c.error||p.error||v.error||r.error||s.error)return {categories:[] as Category[],products:[] as Product[],variants:[] as Variant[],rates:[] as Rate[],settings:null as {whatsapp_number:string|null;instagram_url:string|null}|null,connected:false};
  return {categories:(c.data??[]) as Category[],products:(p.data??[]) as Product[],variants:(v.data??[]) as Variant[],rates:(r.data??[]) as Rate[],settings:s.data,connected:true};
 } catch {return {categories:[] as Category[],products:[] as Product[],variants:[] as Variant[],rates:[] as Rate[],connected:false};}
}
export default async function HomePage() {
 const {categories,products,variants,rates,settings,connected}=await getStoreData();
 const productsWithVariants=products.map(p=>({...p,variants:variants.filter(v=>v.product_id===p.id)}));
 return <main>
  <div className="announcement">توصيل إلى 58 ولاية · أناقة تستحقينها</div>
  <header className="site-header"><a className="brand" href="/" aria-label="Mimi Shopping"><span className="brand-mark">M</span><span><strong>Mimi</strong><small>SHOPPING</small></span></a><nav aria-label="القائمة الرئيسية"><a href="#home">الرئيسية</a><a href="#categories">الأقسام</a><a href="#products">تشكيلتنا</a><a href="#contact">اتصلوا بنا</a></nav><a className="header-link" href="#products">اكتشفي المجموعة <span>←</span></a></header>
  <section className="hero" id="home"><div className="hero-copy"><span className="eyebrow">MIMI SHOPPING · COLLECTION</span><h1>تفاصيل صغيرة،<br/><em>أناقة كبيرة.</em></h1><p>اختاري حقيبتك التي تشبهك. قطع أنيقة تضيف لمسة خاصة لكل يوم وكل مناسبة.</p><a className="primary-button" href="#products">تسوقي المجموعة <span>←</span></a><div className="hero-note"><span className="note-line"/> أناقة يومية بذوق مختلف</div></div><div className="hero-art" aria-label="مساحة صورة المجموعة الجديدة"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-card"><span className="art-label">THE NEW EDIT</span><div className="bag-illustration"><div className="bag-handle"/><div className="bag-body"><span className="bag-clasp"/></div></div><span className="art-caption">A touch of elegance</span></div><span className="art-star star-one">✳</span><span className="art-star star-two">✧</span></div></section>
  <section className="trust-strip"><div><strong>58</strong><span>ولاية جزائرية</span></div><div><strong>01</strong><span>اختيار بذوقك</span></div><div><strong>100%</strong><span>اهتمام بالتفاصيل</span></div></section>
  <section className="section" id="categories"><div className="section-heading"><div><span className="eyebrow">DISCOVER</span><h2>تسوقي حسب القسم</h2></div><p>اختيارات مصممة لترافق أسلوبك.</p></div><div className="category-grid">{(categories.length?categories:[{id:1,name:"حقائب نسائية",icon:"👜",slug:"women-bags"},{id:2,name:"حقائب رجالية",icon:"💼",slug:"men-bags"}]).map(c=><a className="category-card" href="#products" key={c.id}><span className="category-icon">{c.icon||"◇"}</span><span><strong>{c.name}</strong><small>اكتشف المجموعة</small></span><b>↙</b></a>)}</div></section>
  <section className="section products-section" id="products"><div className="section-heading"><div><span className="eyebrow">CURATED FOR YOU</span><h2>اختيارات Mimi</h2></div><p>تشكيلة تتجدد لتناسب كل الأذواق.</p></div>{products.length?<StorefrontCatalog products={productsWithVariants} rates={rates} whatsapp={settings?.whatsapp_number??""}/>:<div className="empty-products"><span>✧</span><h3>تشكيلتنا الجديدة قيد التحضير</h3><p>سنضيف صور المنتجات وتفاصيلها وأسعارها من لوحة الإدارة عند جاهزيتها.</p></div>}</section>
  <section className="closing-banner" id="contact"><span className="eyebrow">A LITTLE MORE YOU</span><h2>أسلوبكِ، حكايتكِ.</h2><p>تابعينا لاكتشاف جديد Mimi Shopping.</p><a href={settings?.instagram_url || "https://www.instagram.com/"} target="_blank" rel="noreferrer">تابعينا على Instagram ↗</a></section>
  <footer><a className="brand footer-brand" href="/"><span className="brand-mark">M</span><span><strong>Mimi</strong><small>SHOPPING</small></span></a><p>© {new Date().getFullYear()} Mimi Shopping · جميع الحقوق محفوظة</p><span className="footer-status">{connected?"الكتالوج متصل":"وضع المعاينة"}</span></footer>
 </main>;
}
