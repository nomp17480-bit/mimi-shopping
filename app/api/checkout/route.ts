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

    const customerName = typeof input.customer_name === "string" ? input.customer_name.trim() : "";
    const phone = typeof input.phone === "string" ? input.phone.trim() : "";
    const address = typeof input.address === "string" ? input.address.trim() : "";
    const note = typeof input.customer_note === "string" ? input.customer_note : "";
    const shippingMethod = input.shipping_method;
    const paymentMethod = input.payment_method;
    if (customerName.length < 2 || customerName.length > 120) {
      return jsonError("يرجى إدخال اسم صحيح (من حرفين إلى 120 حرفاً).", 400);
    }
    if (phone.length < 8 || phone.length > 30 || !/^[0-9+()\\s.-]+$/.test(phone)) {
      return jsonError("رقم الهاتف غير صالح.", 400);
    }
    if (address.length < 4 || address.length > 500) {
      return jsonError("يرجى إدخال عنوان صحيح لا يتجاوز 500 حرف.", 400);
    }
    if (note.length > 1000) {
      return jsonError("الملاحظة طويلة جداً.", 400);
    }
    if (shippingMethod !== "home" && shippingMethod !== "desk") {
      return jsonError("طريقة التوصيل غير صالحة.", 400);
    }
    if (paymentMethod !== "cod") {
      return jsonError("الدفع عند الاستلام فقط متاح حالياً.", 400);
    }
    const validItems = items.every((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return false;
      const line = item as Record<string, unknown>;
      return Number.isSafeInteger(line.product_id) && Number(line.product_id) > 0
        && (line.variant_id === null || line.variant_id === undefined
          || (Number.isSafeInteger(line.variant_id) && Number(line.variant_id) > 0))
        && Number.isInteger(line.quantity) && Number(line.quantity) >= 1 && Number(line.quantity) <= 10;
    });
    if (!validItems) {
      return jsonError("تحتوي السلة على بيانات منتج أو كمية غير صالحة.", 400);
    }

    const wilaya = typeof input.wilaya === "string" ? input.wilaya.trim() : "";
    const commune = typeof input.commune === "string" ? input.commune.trim() : "";
    const selectedWilaya = locationData.wilayas.find((item) => `${item.code} - ${item.name}` === wilaya);
    const validCommune = selectedWilaya && locationData.communes.some(
      (item) => item.wilayaCode === selectedWilaya.code && item.name === commune
    );
    if (!selectedWilaya || !validCommune) {
      return jsonError("الولاية أو البلدية غير صحيحة. اخترهما من القائمتين.", 400);
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("place_public_order", {
      p_customer_name: customerName,
      p_phone: phone,
      p_wilaya: wilaya,
      p_commune: commune,
      p_address: address,
      p_shipping_method: shippingMethod,
      p_payment_method: paymentMethod,
      p_customer_note: note,
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
