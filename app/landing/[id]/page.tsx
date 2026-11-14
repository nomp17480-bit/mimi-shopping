import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StorefrontCatalog from "../../../components/storefront-catalog";
import { supabase } from "../../../lib/supabase";
import "./landing.module.css";

type Product = {
  id: number;
  name: string;
  price: number;
  old_price: number | null;
  description: string | null;
  images: unknown;
  category_id: number | null;
  stock: number;
  colors: string[];
};
type Variant = {
  id: number;
  product_id: number;
  color: string;
  size: string;
  price_override: number | null;
  stock: number;
  is_active: boolean;
};
type Rate = { id: number; wilaya: string; home_price: number; desk_price: number };
type Category = { id: number; name: string; icon?: string | null };

async function getLandingData(id: number) {
  if (!supabase) return null;
  const [productResult, variantsResult, ratesResult, categoriesResult, settingsResult] =
    await Promise.all([
      supabase
        .from("products")
        .select("id,name,price,old_price,description,images,category_id,stock,colors")
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle(),
      supabase
        .from("product_variants")
        .select("id,product_id,color,size,price_override,stock,is_active")
        .eq("is_active", true)
        .eq("product_id", id),
      supabase
        .from("shipping_rates")
        .select("id,wilaya,home_price,desk_price")
        .eq("active", true)
        .order("wilaya"),
      supabase.from("categories").select("id,name,icon").order("id"),
      supabase
        .from("store_settings")
        .select("whatsapp_number,instagram_url")
        .eq("id", true)
        .maybeSingle(),
    ]);

  if (productResult.error || !productResult.data) return null;
  return {
    product: productResult.data as Product,
    variants: (variantsResult.data ?? []) as Variant[],
    rates: (ratesResult.data ?? []) as Rate[],
    categories: (categoriesResult.data ?? []) as Category[],
    whatsapp: settingsResult.data?.whatsapp_number ?? "",
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id < 1) {
    return { title: "مجموعة Mimi Shopping" };
  }
  const data = await getLandingData(id);
  if (!data) return { title: "المنتج غير متاح | Mimi Shopping" };
  return {
    title: `${data.product.name} | Mimi Shopping`,
    description:
      data.product.description ||
      `اكتشفي ${data.product.name} من Mimi Shopping واطلبيه بسهولة مع الدفع عند الاستلام.`,
    openGraph: {
      title: `${data.product.name} | Mimi Shopping`,
      description:
        data.product.description ||
        "اختاري حقيبتك من Mimi Shopping مع الدفع عند الاستلام.",
      type: "website",
    },
  };
}

export default async function ProductLandingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id < 1) notFound();

  const data = await getLandingData(id);
  if (!data) notFound();

  const product = {
    ...data.product,
    variants: data.variants,
  };

  return (
    <main className="mimi-landing" dir="rtl">
      <div className="landing-top">
        <a href="/" className="landing-brand" aria-label="Mimi Shopping">
          <span className="landing-brand-mark">m.</span>
          <span><strong>MIMI</strong><small>SHOPPING</small></span>
        </a>
        <span className="landing-edition">اختيار Mimi لكِ</span>
      </div>

      <section className="landing-hero">
        <div className="landing-copy">
          <span className="landing-eyebrow">MIMI SHOPPING · COLLECTION</span>
          <h1>تفاصيل صغيرة،<br /><em>أناقة تدوم.</em></h1>
          <p>
            اكتشفي {data.product.name}، واختاري القطعة التي تشبه أسلوبكِ.
            طلب سهل وتوصيل حسب المناطق المفعّلة.
          </p>
          <a className="landing-cta" href="#landing-product">اكتشفي الحقيبة واطلبيها <span>←</span></a>
          <div className="landing-assurance">
            <span>الدفع عند الاستلام</span>
            <span>توصيل عبر الولايات</span>
          </div>
        </div>
        <div className="landing-art" aria-label="هوية Mimi Shopping">
          <div className="landing-orbit landing-orbit-one" />
          <div className="landing-orbit landing-orbit-two" />
          <div className="landing-monogram">M</div>
          <span className="landing-art-note">THE MIMI EDIT</span>
          <span className="landing-art-seal">MIMI<br />✦</span>
        </div>
      </section>

      <section className="landing-product" id="landing-product">
        <div className="landing-section-heading">
          <span className="landing-eyebrow">YOUR NEXT FAVORITE</span>
          <h2>اختاريها <em>الآن</em></h2>
          <p>راجعي تفاصيل المنتج، حددي اللون أو المقاس إن توفر، ثم أكملي طلبك.</p>
        </div>
        <div id="products">
          <StorefrontCatalog
            products={[product]}
            rates={data.rates}
            whatsapp={data.whatsapp}
            categories={[]}
          />
        </div>
      </section>

      <footer className="landing-footer">
        <a href="/">العودة إلى متجر Mimi Shopping</a>
        <span>الدفع عند الاستلام · الجزائر</span>
      </footer>
    </main>
  );
}
