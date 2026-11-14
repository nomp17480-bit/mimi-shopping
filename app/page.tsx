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
   supabase.from("shipping_rates").select("id,wilaya,home_price,desk_price").eq("active",true).order("wilaya"),
   supabase.from("store_settings").select("whatsapp_number,instagram_url").eq("id",true).maybeSingle()
  ]);
  if(c.error||p.error||v.error||r.error)return {categories:[] as Category[],products:[] as Product[],variants:[] as Variant[],rates:[] as Rate[],settings:null as {whatsapp_number:string|null;instagram_url:string|null}|null,connected:false};
  return {categories:(c.data??[]) as Category[],products:(p.data??[]) as Product[],variants:(v.data??[]) as Variant[],rates:(r.data??[]) as Rate[],settings:s.data,connected:true};
 } catch {return {categories:[] as Category[],products:[] as Product[],variants:[] as Variant[],rates:[] as Rate[],settings:null as {whatsapp_number:string|null;instagram_url:string|null}|null,connected:false};}
}
function Ornament(){return <svg className="andalusian-ornament" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 4 61 27 85 15 73 39 96 50 73 61 85 85 61 73 50 96 39 73 15 85 27 61 4 50 27 39 15 15 39 27Z"/><circle cx="50" cy="50" r="13"/><circle cx="50" cy="50" r="4"/></svg>}
function Icon({kind}:{kind:"bag"|"spark"|"pin"}){return <svg viewBox="0 0 24 24" aria-hidden="true" className="feature-icon">{kind==="bag"?<><path d="M4 8h16l-1 12H5L4 8Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></>:kind==="pin"?<><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/></>:<><path d="m12 2 2.2 6.1L20 10l-5.8 2.1L12 18l-2.2-5.9L4 10l5.8-1.9L12 2Z"/><path d="m19 15 1.2 2.8L23 19l-2.8 1.2L19 23l-1.2-2.8L15 19l2.8-1.2L19 15Z"/></>}</svg>}
export default async function HomePage() {
 const {categories,products,variants,rates,settings,connected}=await getStoreData();
 const productsWithVariants=products.map(p=>({...p,variants:variants.filter(v=>v.product_id===p.id)}));
 return <main className="andalusian-store">
  <div className="announcement"><Ornament/><span>توصيل إلى ولايات الوطن · اختاري أناقتكِ من Mimi</span><Ornament/></div>
  <header className="site-header">
   <a className="brand" href="/" aria-label="Mimi Shopping"><span className="brand-mark"><Ornament/></span><span><strong>Mimi</strong><small>SHOPPING · ALGERIA</small></span></a>
   <nav aria-label="القائمة الرئيسية"><a href="#home">الرئيسية</a><a href="#categories">الأقسام</a><a href="#products">تشكيلتنا</a><a href="#contact">تواصل معنا</a></nav>
   <a className="header-link" href="#products">اكتشفي التشكيلة <span>↙</span></a>
  </header>
  <section className="hero" id="home">
   <div className="hero-copy"><span className="eyebrow">MIMI SHOPPING <i/> لمسة من الأصالة</span><h1>أناقة من روح<br/><em>التراث الجزائري.</em></h1><p>حقائب تختارها ذائقتكِ، بتفاصيل تستلهم جمال العمارة الأندلسية الجزائرية وتواكب أسلوبكِ اليومي.</p><a className="primary-button" href="#products">اكتشفي مجموعتنا <span>↙</span></a><div className="hero-note"><span className="note-line"/> جمال التفاصيل… وأناقة تدوم</div></div>
   <div className="hero-art" aria-label="زخرفة مستوحاة من العمارة الأندلسية الجزائرية"><div className="hero-arch"><div className="arch-inner"><div className="arch-medallion"><Ornament/><span>M</span></div><span className="arch-caption">أصالة · أناقة · تفرّد</span></div></div><span className="art-seal">صُنع<br/>بذوق</span><span className="art-star star-one">✧</span><span className="art-star star-two">✳</span></div>
  </section>
  <section className="trust-strip"><div><Icon kind="bag"/><span><strong>اختيارات منتقاة</strong><small>تفاصيل تليق بكِ</small></span></div><div><Icon kind="pin"/><span><strong>توصيل عبر الولايات</strong><small>حسب المناطق المفعّلة</small></span></div><div><Icon kind="spark"/><span><strong>أناقة بطابع جزائري</strong><small>لمسة أصيلة بروح عصرية</small></span></div></section>
  <section className="section" id="categories"><div className="section-heading"><div><span className="eyebrow">اكتشفي ما يناسبكِ</span><h2>تسوّقي حسب القسم</h2></div><p>لكل إطلالة حقيبة تحكي حكايتها.</p></div><div className="category-grid">{(categories.length?categories:[{id:1,name:"حقائب نسائية",icon:"",slug:"women-bags"},{id:2,name:"حقائب رجالية",icon:"",slug:"men-bags"}]).map((c,i)=><a className="category-card" href="#products" key={c.id}><span className="category-icon"><Ornament/></span><span><strong>{c.name}</strong><small>اكتشفي الاختيارات</small></span><b>↙</b></a>)}</div></section>
  <section className="section products-section" id="products"><div className="section-heading"><div><span className="eyebrow">اختيارات Mimi</span><h2>تشكيلتنا المختارة</h2></div><p>قطع أنيقة تضيف إلى يومكِ لمسة خاصة.</p></div>{products.length?<StorefrontCatalog products={productsWithVariants} rates={rates} whatsapp={settings?.whatsapp_number??""} categories={categories}/>:<div className="empty-products"><span>✧</span><h3>تشكيلتنا الجديدة قيد التحضير</h3><p>سنضيف صور المنتجات وتفاصيلها وأسعارها من لوحة الإدارة عند جاهزيتها.</p></div>}</section>
  <section className="closing-banner" id="contact"><Ornament/><span className="eyebrow">MIMI SHOPPING · ALGERIA</span><h2>أناقتكِ… بطابعكِ.</h2><p>{settings?.instagram_url?"تابعينا لاكتشاف جديد Mimi Shopping.":"سنضيف حسابات التواصل عند جاهزيتها."}</p>{settings?.instagram_url?<a href={settings.instagram_url} target="_blank" rel="noreferrer">تابعينا على Instagram ↗</a>:null}</section>
  <footer><a className="brand footer-brand" href="/"><span className="brand-mark"><Ornament/></span><span><strong>Mimi</strong><small>SHOPPING · ALGERIA</small></span></a><p>© {new Date().getFullYear()} Mimi Shopping · جميع الحقوق محفوظة</p><span className="footer-status">{connected?"المتجر متصل":"وضع المعاينة"}</span></footer>
 </main>;
}
