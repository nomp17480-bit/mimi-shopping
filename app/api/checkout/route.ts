import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("place_public_order", {
      p_customer_name: String(body.customer_name ?? ""),
      p_phone: String(body.phone ?? ""),
      p_wilaya: String(body.wilaya ?? ""),
      p_commune: String(body.commune ?? ""),
      p_address: String(body.address ?? ""),
      p_shipping_method: String(body.shipping_method ?? "home"),
      p_payment_method: String(body.payment_method ?? "cod"),
      p_customer_note: String(body.customer_note ?? ""),
      p_items: Array.isArray(body.items) ? body.items : [],
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ order: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "تعذر إرسال الطلب. تحقق من البيانات وحاول مجدداً." }, { status: 400 });
  }
}
