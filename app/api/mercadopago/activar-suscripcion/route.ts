import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";

const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });

export async function POST(req: NextRequest) {
  try {
    const { payment_id, user_id, plan, site_id } = await req.json();
    if (!payment_id || !user_id || !plan) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });

    const payment = new Payment(mp);
    const data = await payment.get({ id: payment_id });
    if (data.status !== "approved") return NextResponse.json({ error: "Pago no aprobado" }, { status: 400 });

    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);

    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY!,
        "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        "Prefer": "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        user_id,
        site_id: site_id ?? null,
        plan,
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        payment_provider: "mercadopago",
        mercadopago_payment_id: String(payment_id),
        reminder_7_sent: false,
        reminder_2_sent: false,
        updated_at: now.toISOString(),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Supabase error:", err);
      return NextResponse.json({ error: err }, { status: 500 });
    }

    return NextResponse.json({ ok: true, period_end: periodEnd.toISOString() });
  } catch (error: any) {
    console.error("Activar suscripcion error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
