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
function BagArtwork(){return <svg viewBox="0 0 460 430" role="img" aria-label="رسم فني لحقيبة أنيقة"><defs><linearGradient id="bagLeather" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#b58a35"/><stop offset="1" stopColor="#4b1559"/></linearGradient><linearGradient id="bagShade" x1="0" x2="1"><stop offset="0" stopColor="#d8bd8b"/><stop offset="1" stopColor="#6d3478"/></linearGradient></defs><ellipse cx="232" cy="365" rx="145" ry="22" fill="#243b32" opacity=".12"/><path d="M142 170c0-68 36-112 88-112s88 44 88 112" fill="none" stroke="#3b1648" strokeWidth="17" strokeLinecap="round"/><path d="M115 155q0-16 17-16h196q17 0 17 16l24 177q3 22-20 22H111q-23 0-20-22z" fill="url(#bagLeather)" stroke="#2b0b35" strokeWidth="4"/><path d="M118 162h224l-4 32H122z" fill="url(#bagShade)" opacity=".8"/><path d="M112 205h236" stroke="#ead9b5" strokeWidth="3" opacity=".7"/><rect x="207" y="218" width="48" height="45" rx="8" fill="#c7a04d" stroke="#4b1559" strokeWidth="3"/><path d="M231 227v26m-10-13h20" stroke="#4b1559" strokeWidth="2"/><path d="M106 315q120 20 248 0" fill="none" stroke="#3b1648" strokeWidth="3" opacity=".55"/><circle cx="230" cy="286" r="7" fill="#e0c27c"/></svg>}
export default async function HomePage() {
 const {categories,products,variants,rates,settings,connected}=await getStoreData();
 const productsWithVariants=products.map(p=>({...p,variants:variants.filter(v=>v.product_id===p.id)}));
 const displayCategories=categories.length?categories:[{id:1,name:"حقائب نسائية",icon:"",slug:"women-bags"},{id:2,name:"حقائب رجالية",icon:"",slug:"men-bags"}];
 return <main className="mimi-redesign">
  <div className="mimi-topline"><span>اختيارات أنيقة، وتفاصيل تستحقّينها</span><span className="topline-location">MIMI SHOPPING · ALGERIA</span></div>
  <header className="mimi-header">
   <a className="mimi-brand" href="/" aria-label="Mimi Shopping"><span className="mimi-brand-symbol">m.</span><span><strong>MIMI</strong><small>SHOPPING</small></span></a>
   <nav aria-label="القائمة الرئيسية"><a href="#home">الرئيسية</a><a href="#categories">الأقسام</a><a href="#products">الحقائب</a><a href="#about">عن Mimi</a></nav>
   <a className="mimi-header-cta" href="#products">تسوّقي الآن <span>↗</span></a>
  </header>
  <section className="mimi-hero" id="home">
   <div className="mimi-hero-copy"><span className="mimi-kicker"><i/> أسلوبك يبدأ من التفاصيل</span><h1>حقيبتكِ…<br/><em>تفصيلتكِ الأجمل.</em></h1><p>اكتشفي اختيارات Mimi Shopping من الحقائب، بتصميم يجمع البساطة والأناقة ولمسة تستلهم روح التراث الجزائري.</p><div className="mimi-hero-actions"><a className="mimi-button" href="#products">اكتشفي التشكيلة <span>↙</span></a><a className="mimi-text-link" href="#categories">تصفّحي الأقسام</a></div><div className="mimi-hero-foot"><span>01 / 03</span><span className="mimi-foot-line"/><span>أناقة يومية بروح جزائرية</span></div></div>
   <div className="mimi-hero-visual"><div className="mimi-visual-backdrop"><span className="visual-orbit orbit-a"/><span className="visual-orbit orbit-b"/><div className="mimi-art-label">THE EVERYDAY<br/>EDIT <b>✳</b></div><BagArtwork/><span className="mimi-visual-caption">MIMI · SIGNATURE STYLE</span></div><span className="mimi-vertical-note">ELEGANCE IN EVERY DETAIL</span></div>
  </section>
  <div className="mimi-benefits"><div><span className="benefit-number">01</span><span><strong>اختيارات منتقاة</strong><small>تفاصيل تليق بإطلالتكِ</small></span></div><div><span className="benefit-number">02</span><span><strong>توصيل عبر الولايات</strong><small>حسب المناطق المفعّلة</small></span></div><div><span className="benefit-number">03</span><span><strong>الدفع عند الاستلام</strong><small>اطلبي وادفعي عند وصول طلبكِ</small></span></div></div>
  <section className="mimi-section mimi-categories" id="categories"><div className="mimi-section-head"><div><span className="mimi-kicker"><i/> اختاري ما يشبهكِ</span><h2>تسوّقي حسب <em>القسم</em></h2></div><p>لكل يوم أسلوبه، ولكل أسلوب حقيبته.</p></div><div className="mimi-category-grid">{displayCategories.map((c,i)=><a className={"mimi-category-card category-"+(i+1)} href="#products" key={c.id}><span className="category-index">0{i+1}</span><span className="category-copy"><strong>{c.name}</strong><small>اكتشفي المجموعة</small></span><span className="category-arrow">↗</span><span className="category-watermark">{i===0?"M":"S"}</span></a>)}</div></section>
  <section className="mimi-section mimi-products" id="products"><div className="mimi-section-head"><div><span className="mimi-kicker"><i/> مجموعة Mimi</span><h2>قطع تلفت النظر، <em>ببساطة.</em></h2></div><p>اختاري القطعة التي تكمل حضوركِ.</p></div>{products.length?<StorefrontCatalog products={productsWithVariants} rates={rates} whatsapp={settings?.whatsapp_number??""} categories={categories}/>:<div className="mimi-empty"><div className="empty-mark">m.</div><span className="mimi-kicker">COMING SOON · MIMI SHOPPING</span><h3>تشكيلتنا الأولى قيد التحضير</h3><p>نعمل على تجهيز اختياراتنا الأولى. ستظهر المنتجات هنا فور إضافتها من لوحة الإدارة.</p></div>}</section>
  <section className="mimi-about" id="about"><div className="about-stamp">M<br/><small>ALGERIA</small></div><div><span className="mimi-kicker"><i/> حكاية Mimi</span><h2>أناقة معاصرة،<br/><em>بروح من هنا.</em></h2><p>هوية تستلهم جمال التفاصيل الجزائرية والأندلسية، وتقدّمها بأسلوب بسيط يناسب يومكِ.</p></div><div className="about-side"><span>01</span><p>البساطة هي سرّ الأناقة.</p><span className="about-line"/></div></section>
  <section className="mimi-contact"><div><span className="mimi-kicker"><i/> MIMI SHOPPING · ALGERIA</span><h2>جاهزة لاختياركِ القادم؟</h2><p>{settings?.instagram_url?"تابعينا لاكتشاف جديد Mimi Shopping.":"سنضيف حسابات التواصل عند جاهزيتها."}</p></div><a href="#products">ابدئي التسوّق <span>↗</span></a></section>
  <footer className="mimi-footer"><a className="mimi-brand footer-mimi-brand" href="/"><span className="mimi-brand-symbol">m.</span><span><strong>MIMI</strong><small>SHOPPING</small></span></a><p>© {new Date().getFullYear()} Mimi Shopping · جميع الحقوق محفوظة</p><span className="footer-status">{connected?"المتجر متصل":"وضع المعاينة"}</span></footer>
 </main>;
}
