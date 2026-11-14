import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Mimi Shopping - حقائب وأناقة بطابع جزائري";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#f3eee4",
          color: "#183c32",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ position: "absolute", inset: 0, display: "flex", opacity: 0.16 }}>
          <div style={{ position: "absolute", right: 54, top: 48, width: 430, height: 430, border: "2px solid #b77b50", borderRadius: 240 }} />
          <div style={{ position: "absolute", right: 84, top: 78, width: 370, height: 370, border: "1px solid #b77b50", borderRadius: 220 }} />
        </div>
        <div style={{ width: "56%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", padding: "70px 58px", textAlign: "right" }}>
          <div style={{ fontSize: 25, letterSpacing: 5, color: "#a66e49", marginBottom: 28 }}>MIMI SHOPPING</div>
          <div style={{ fontSize: 57, lineHeight: 1.35, fontWeight: 700, maxWidth: 600 }}>حقائب وأناقة</div>
          <div style={{ fontSize: 57, lineHeight: 1.35, fontWeight: 700, color: "#a66e49", maxWidth: 600 }}>بطابع جزائري</div>
          <div style={{ width: 110, height: 3, background: "#a66e49", marginTop: 28, marginBottom: 25 }} />
          <div style={{ fontSize: 25, color: "#52675d" }}>أناقتكِ تبدأ من التفاصيل</div>
        </div>
        <div style={{ width: "44%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <div style={{ position: "absolute", width: 380, height: 380, borderRadius: 240, background: "#e5d9c8", display: "flex" }} />
          <div style={{ position: "absolute", top: 112, width: 170, height: 185, border: "17px solid #a66e49", borderBottom: 0, borderRadius: "95px 95px 0 0", display: "flex" }} />
          <div style={{ position: "absolute", top: 245, width: 310, height: 245, borderRadius: "34px 34px 58px 58px", background: "#24483c", border: "5px solid #183c32", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "18px 22px 0 rgba(24,60,50,0.12)" }}>
            <div style={{ width: 92, height: 8, background: "#c99a70", borderRadius: 8, marginBottom: 24 }} />
            <div style={{ width: 52, height: 52, border: "3px solid #d7b28d", borderRadius: 30, display: "flex", alignItems: "center", justifyContent: "center", color: "#e7d4bd", fontSize: 25 }}>M</div>
            <div style={{ width: 72, height: 5, background: "#c99a70", borderRadius: 5, marginTop: 25 }} />
          </div>
          <div style={{ position: "absolute", right: 44, bottom: 56, width: 24, height: 24, borderRadius: 20, background: "#b77b50" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
