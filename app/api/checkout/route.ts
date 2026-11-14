import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import locationData from "../../../data/algeria-locations.json";

const MAX_BODY_BYTES = 24 * 1024;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return jsonError("نوع الطلب غير صالح.", 415);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return jsonError("بيانات الطلب أكبر من الحجم المسموح.", 413);
  }

  // Browser checkout is same-origin. Reject cross-site submissions when an Origin is present.
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return jsonError("مصدر الطلب غير مسموح.", 403);
      }
    } catch {
      return jsonError("مصدر الطلب غير صالح.", 403);
    }
  }

  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return jsonError("بيانات الطلب أكبر من الحجم المسموح.", 413);
    }

    const body: unknown = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonError("بيانات الطلب غير صالحة.", 400);
    }

    const input = body as Record<string, unknown>;
    const items = Array.isArray(input.items) ? input.items : [];
    if (items.length < 1 || items.length > 20) {
      return jsonError("السلة فارغة أو تحتوي على عدد كبير من المنتجات.", 400);
    }

    const wilaya = typeof input.wilaya === "string" ? input.wilaya.trim() : "";
    const commune = typeof input.commune === "string" ? input.commune.trim() : "";
    const selectedWilaya = locationData.wilayas.find((item) => item.name === wilaya);
    const validCommune = selectedWilaya && locationData.communes.some(
      (item) => item.wilayaCode === selectedWilaya.code && item.name === commune
    );
    if (!selectedWilaya || !validCommune) {
      return jsonError("الولاية أو البلدية غير صحيحة. اخترهما من القائمتين.", 400);
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("place_public_order", {
      p_customer_name: typeof input.customer_name === "string" ? input.customer_name : "",
      p_phone: typeof input.phone === "string" ? input.phone : "",
      p_wilaya: wilaya,
      p_commune: commune,
      p_address: typeof input.address === "string" ? input.address : "",
      p_shipping_method: typeof input.shipping_method === "string" ? input.shipping_method : "",
      p_payment_method: typeof input.payment_method === "string" ? input.payment_method : "",
      p_customer_note: typeof input.customer_note === "string" ? input.customer_note : "",
      p_items: items,
    });

    if (error) return jsonError("تعذر تسجيل الطلب. تحقق من البيانات وحاول مجدداً.", 400);
    return NextResponse.json({ order: data }, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return jsonError("تعذر إرسال الطلب. تحقق من البيانات وحاول مجدداً.", 400);
  }
}
