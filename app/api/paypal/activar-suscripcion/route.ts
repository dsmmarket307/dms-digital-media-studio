import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const PAYPAL_BASE =
  process.env.PAYPAL_MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

const PLANES_PRECIOS_USD: Record<string, number> = { basico: 12, profesional: 25, empresarial: 50 };

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description ?? "No se pudo autenticar con PayPal");
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { subscription_id, user_id, plan } = await req.json();
    if (!subscription_id || !user_id || !plan) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const accessToken = await getAccessToken();

    const subRes = await fetch(`${PAYPAL_BASE}/v1/billing/subscriptions/${subscription_id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const subData = await subRes.json();

    if (!subRes.ok) {
      return NextResponse.json({ error: "No se pudo verificar la suscripcion con PayPal" }, { status: 400 });
    }

    if (subData.status !== "ACTIVE" && subData.status !== "APPROVAL_PENDING") {
      return NextResponse.json({ error: `Suscripcion en estado ${subData.status}, no aprobada` }, { status: 400 });
    }

    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);

    await supabase.from("subscriptions").upsert(
      {
        user_id,
        plan,
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        payment_provider: "paypal",
        mercadopago_payment_id: subscription_id,
        reminder_7_sent: false,
        reminder_2_sent: false,
        updated_at: now.toISOString(),
      },
      { onConflict: "user_id" }
    );

    await supabase.from("pagos").insert({
      client_id: user_id,
      monto: (PLANES_PRECIOS_USD[plan] ?? 0) * 4000,
      estado: "pagado",
      metodo: "paypal",
      referencia: subscription_id,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error activando suscripcion PayPal:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
