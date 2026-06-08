import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { payment_id } = await req.json();
    if (!payment_id) return NextResponse.json({ error: "payment_id requerido" }, { status: 400 });

    const payment = new Payment(mp);
    const data = await payment.get({ id: payment_id });

    if (data.status !== "approved") return NextResponse.json({ error: "Pago no aprobado" }, { status: 400 });

    const meta = data.metadata || {};
    const customerName = meta.customer_name || "Cliente";
    const customerEmail = meta.customer_email || "";
    const packageSlug = meta.package_slug || "paquete";
    const packageName = meta.package_name || packageSlug;
    const price = meta.price || data.transaction_amount || 0;

    const { error } = await supabase.from("package_orders").upsert({
      customer_name: customerName,
      customer_email: customerEmail,
      package_name: packageName,
      package_slug: packageSlug,
      price: Number(price),
      mercadopago_payment_id: String(payment_id),
      mercadopago_status: data.status,
      status: "approved",
    }, { onConflict: "mercadopago_payment_id" });

    if (error) {
      console.error("DB Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
