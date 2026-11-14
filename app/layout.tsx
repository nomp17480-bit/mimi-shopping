import type { Metadata } from "next";
import "./globals.css";
import "./andalusian.css";
import "./mimi-redesign.css";

const productionUrl = "https://delightful-marshmallow-50e91e.netlify.app";
const siteUrl =
  process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : productionUrl;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "أناقة وحقائب | Mimi Shopping",
  description:
    "اكتشفي تشكيلة Mimi Shopping من الحقائب الأنيقة بلمسة جزائرية. أناقة وتفاصيل مختارة، مع توصيل عبر الولايات حسب المناطق المفعّلة.",
  applicationName: "Mimi Shopping",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Mimi Shopping",
    locale: "ar_DZ",
    title: "أناقة وحقائب | Mimi Shopping",
    description:
      "اكتشفي تشكيلة Mimi Shopping من الحقائب الأنيقة بلمسة جزائرية.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Mimi Shopping - أناقة وحقائب",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "أناقة وحقائب | Mimi Shopping",
    description: "اكتشفي تشكيلة Mimi Shopping من الحقائب الأنيقة بلمسة جزائرية.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
