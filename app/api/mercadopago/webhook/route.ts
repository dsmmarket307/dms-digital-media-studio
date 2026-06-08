import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment, MerchantOrder } from "mercadopago";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);

async function procesarPago(paymentId: string) {
  const payment = new Payment(mp);
  const data = await payment.get({ id: paymentId });
  if (data.status !== "approved") return;

  let extRef: any = {};
  try { extRef = JSON.parse(data.external_reference ?? "{}"); } catch {}

  const meta = data.metadata || {};
  const type = extRef.type ?? meta.type ?? "";

  if (type === "suscripcion") {
    const user_id = extRef.user_id ?? meta.user_id;
    const site_id = extRef.site_id ?? meta.site_id ?? null;
    const plan = extRef.plan ?? meta.plan;
    const payer_email = extRef.payer_email ?? meta.payer_email ?? "";

    if (!user_id || !plan) {
      console.error("Suscripcion sin user_id o plan:", { extRef, meta });
      return;
    }

    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + 30);

    await supabase.from("subscriptions").upsert({
      user_id,
      site_id,
      plan,
      status: "active",
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      payment_provider: "mercadopago",
      mercadopago_payment_id: String(paymentId),
      reminder_7_sent: false,
      reminder_2_sent: false,
      updated_at: now.toISOString(),
    }, { onConflict: "user_id" });

    if (site_id) {
      await supabase.from("generated_websites").update({ status: "published" }).eq("id", site_id);
    }

    if (payer_email) {
      await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: payer_email,
        subject: "Suscripcion activada - DMS Digital Studio",
        html: `<h2>Suscripcion activada</h2><p>Tu plan <b>${plan}</b> esta activo hasta el <b>${periodEnd.toLocaleDateString("es-CO")}</b>.</p><p>Gracias por confiar en DMS Digital Studio.</p>`,
      });
    }
    return;
  }

  const customerName = meta.customer_name || meta.customerName || extRef.customer_name || "Cliente";
  const customerEmail = meta.customer_email || meta.customerEmail || extRef.customer_email || "";
  const customerPhone = meta.customer_phone || meta.customerPhone || "";
  const packageName = meta.package_name || meta.packageName || meta.package_slug || "Paquete";
  const packageSlug = meta.package_slug || meta.packageSlug || "paquete";
  const price = meta.price || 0;

  await supabase.from("package_orders").upsert({
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    package_name: packageName,
    package_slug: packageSlug,
    price: Number(price),
    mercadopago_payment_id: String(paymentId),
    mercadopago_status: data.status,
    status: "approved",
  }, { onConflict: "mercadopago_payment_id" });

  if (customerEmail) {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: "dms.digitalstudio@outlook.com",
      subject: "Nueva venta - DMS",
      html: `<h2>Nueva venta</h2><p><b>Cliente:</b> ${customerName}</p><p><b>Email:</b> ${customerEmail}</p><p><b>Paquete:</b> ${packageSlug}</p><p><b>Valor:</b> $${Number(price).toLocaleString("es-CO")} COP</p>`,
    });
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: customerEmail,
      subject: "Pago confirmado - DMS Digital Media Studio",
      html: `<h2>Gracias ${customerName}</h2><p>Tu pago fue confirmado.</p><p><b>Paquete:</b> ${packageSlug}</p><p>Pronto te contactaremos.</p>`,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get("topic");
    const id = searchParams.get("id");
    const body = await req.json().catch(() => ({}));

    if (topic === "merchant_order" && id) {
      const merchantOrder = new MerchantOrder(mp);
      const order = await merchantOrder.get({ merchantOrderId: Number(id) });
      for (const p of (order.payments ?? [])) {
        if (p.status === "approved" && p.id) await procesarPago(String(p.id));
      }
      return NextResponse.json({ ok: true });
    }

    if (body.type === "payment" && body.data?.id) {
      await procesarPago(String(body.data.id));
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}