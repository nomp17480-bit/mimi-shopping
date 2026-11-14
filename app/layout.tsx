import type { Metadata } from "next";
import "./globals.css";
import "./andalusian.css";
import "./mimi-redesign.css";

export const metadata: Metadata = {
  title: "Mimi Shopping | حقائب وأناقة بطابع جزائري",
  description: "اكتشفي تشكيلة Mimi Shopping من الحقائب النسائية والرجالية، مع توصيل عبر الولايات حسب المناطق المفعّلة.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
