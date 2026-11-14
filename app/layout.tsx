import type { Metadata } from "next";
import "./globals.css";
import "./andalusian.css";

export const metadata: Metadata = {
  title: "Mimi Shopping | أناقتك تبدأ من هنا",
  description: "اكتشفي تشكيلة Mimi Shopping من الحقائب النسائية والرجالية.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
