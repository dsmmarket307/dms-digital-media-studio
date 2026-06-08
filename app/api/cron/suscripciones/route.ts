import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function GET(req: NextRequest) {
  try {
    const now = new Date();

    // 1. Expirar suscripciones vencidas
    const { data: expiradas } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("status", "active")
      .lt("current_period_end", now.toISOString());

    for (const sub of expiradas ?? []) {
      await supabase.from("subscriptions").update({ status: "expired" }).eq("id", sub.id);
      if (sub.site_id) {
        await supabase.from("generated_websites").update({ status: "draft" }).eq("id", sub.site_id);
      }
      const { data: profile } = await supabase.from("profiles").select("email").eq("id", sub.user_id).single();
      if (profile?.email) {
        await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: profile.email,
          subject: "Tu suscripcion expiro - DMS Digital Studio",
          html: `<h2>Tu suscripcion expiro</h2><p>Tu plan <b>${sub.plan}</b> ha expirado. Tu sitio fue despublicado.</p><p>Renueva tu plan para volver a publicarlo: <a href="https://dms-digital-media-studio.vercel.app/dashboard/client/suscripcion">Renovar ahora</a></p>`,
        });
      }
    }

    // 2. Recordatorio 7 dias antes
    const en7dias = new Date(now);
    en7dias.setDate(en7dias.getDate() + 7);
    const { data: vencen7 } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("status", "active")
      .gte("current_period_end", now.toISOString())
      .lte("current_period_end", en7dias.toISOString())
      .eq("reminder_7_sent", false);

    for (const sub of vencen7 ?? []) {
      const { data: profile } = await supabase.from("profiles").select("email").eq("id", sub.user_id).single();
      if (profile?.email) {
        await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: profile.email,
          subject: "Tu plan vence en 7 dias - DMS Digital Studio",
          html: `<h2>Tu plan vence pronto</h2><p>Tu plan <b>${sub.plan}</b> vence el <b>${new Date(sub.current_period_end).toLocaleDateString("es-CO")}</b>.</p><p>Renuevalo antes de que expire: <a href="https://dms-digital-media-studio.vercel.app/dashboard/client/suscripcion">Renovar ahora</a></p>`,
        });
        await supabase.from("subscriptions").update({ reminder_7_sent: true }).eq("id", sub.id);
      }
    }

    // 3. Recordatorio 2 dias antes
    const en2dias = new Date(now);
    en2dias.setDate(en2dias.getDate() + 2);
    const { data: vencen2 } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("status", "active")
      .gte("current_period_end", now.toISOString())
      .lte("current_period_end", en2dias.toISOString())
      .eq("reminder_2_sent", false);

    for (const sub of vencen2 ?? []) {
      const { data: profile } = await supabase.from("profiles").select("email").eq("id", sub.user_id).single();
      if (profile?.email) {
        await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: profile.email,
          subject: "Tu plan vence en 2 dias - DMS Digital Studio",
          html: `<h2>Ultimo aviso</h2><p>Tu plan <b>${sub.plan}</b> vence en 2 dias el <b>${new Date(sub.current_period_end).toLocaleDateString("es-CO")}</b>.</p><p>Renuevalo ahora: <a href="https://dms-digital-media-studio.vercel.app/dashboard/client/suscripcion">Renovar ahora</a></p>`,
        });
        await supabase.from("subscriptions").update({ reminder_2_sent: true }).eq("id", sub.id);
      }
    }

    return NextResponse.json({ ok: true, expiradas: expiradas?.length ?? 0, recordatorios7: vencen7?.length ?? 0, recordatorios2: vencen2?.length ?? 0 });
  } catch (error: any) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}