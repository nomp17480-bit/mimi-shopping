import type { Metadata } from "next";
import "./globals.css";
import "./andalusian.css";
import "./mimi-redesign.css";

const siteUrl = "https://delightful-marshmallow-50e91e.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "حقائب وأناقة بطابع جزائري | Mimi Shopping",
  description:
    "اكتشفي تشكيلة Mimi Shopping من الحقائب الأنيقة بلمسة جزائرية. أناقة وتفاصيل مختارة، مع توصيل عبر الولايات حسب المناطق المفعّلة.",
  applicationName: "Mimi Shopping",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Mimi Shopping",
    locale: "ar_DZ",
    title: "حقائب وأناقة بطابع جزائري | Mimi Shopping",
    description:
      "اكتشفي تشكيلة Mimi Shopping من الحقائب الأنيقة بلمسة جزائرية.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Mimi Shopping - حقائب وأناقة بطابع جزائري" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "حقائب وأناقة بطابع جزائري | Mimi Shopping",
    description: "اكتشفي تشكيلة Mimi Shopping من الحقائب الأنيقة بلمسة جزائرية.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
