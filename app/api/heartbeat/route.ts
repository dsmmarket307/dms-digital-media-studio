import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function geolocalizar(ip: string) {
  try {
    if (!ip || ip === "127.0.0.1" || ip.startsWith("::1")) return { ciudad: "Local", region: "", pais: "" };
    const res = await fetch("http://ip-api.com/json/" + ip + "?fields=city,regionName,country,status");
    const data = await res.json();
    if (data.status !== "success") return { ciudad: "", region: "", pais: "" };
    return { ciudad: data.city ?? "", region: data.regionName ?? "", pais: data.country ?? "" };
  } catch {
    return { ciudad: "", region: "", pais: "" };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { site_id, session_id, pagina, producto_nombre } = body;
    if (!site_id || !session_id) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "";

    const { data: existente } = await supabase
      .from("sesiones_activas")
      .select("id")
      .eq("session_id", session_id)
      .maybeSingle();

    if (existente) {
      const { error: errUpdate } = await supabase.from("sesiones_activas").update({
        pagina,
        producto_nombre: producto_nombre ?? null,
        ultima_actividad: new Date().toISOString(),
      }).eq("session_id", session_id);
      if (errUpdate) console.error("Heartbeat update error:", errUpdate);
    } else {
      const geo = await geolocalizar(ip);
      const { error: errInsert } = await supabase.from("sesiones_activas").insert({
        site_id,
        session_id,
        pagina,
        producto_nombre: producto_nombre ?? null,
        ip,
        ciudad: geo.ciudad,
        region: geo.region,
        pais: geo.pais,
      });
      if (errInsert) console.error("Heartbeat insert error:", errInsert);
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}