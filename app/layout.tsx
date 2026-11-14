import type { Metadata } from "next";
import "./globals.css";
import "./andalusian.css";

export const metadata: Metadata = {
  title: "Mimi Shopping | أناقة بطابع أندلسي جزائري",
  description: "اكتشفي تشكيلة Mimi Shopping من الحقائب النسائية والرجالية بلمسة تستلهم جمال التراث الأندلسي الجزائري.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
