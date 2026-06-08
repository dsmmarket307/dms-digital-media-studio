import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { ciudad, categoria, cantidad } = await req.json();
    if (!ciudad || !categoria) return NextResponse.json({ error: "Ciudad y categoria requeridas" }, { status: 400 });

    const limit = Math.min(parseInt(cantidad) || 10, 20);
    const serpUrl = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(categoria + " en " + ciudad)}&type=search&num=${limit}&api_key=${process.env.SERP_API_KEY}`;
    const serpRes = await fetch(serpUrl);
    const serpData = await serpRes.json();
    const results = serpData.local_results ?? [];

    if (results.length === 0) return NextResponse.json({ encontrados: 0, importados: 0, actualizados: 0, alta_oportunidad: 0 });

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    let importados = 0;
    let actualizados = 0;

    for (const r of results) {
      const { data: existing } = await supabase.from("prospectos").select("id").eq("nombre", r.title ?? "").eq("ciudad", ciudad).single();

      if (existing) {
        await supabase.from("prospectos").update({ telefono: r.phone ?? "", sitio_web: r.website ?? "" }).eq("id", existing.id);
        actualizados++;
      } else {
        await supabase.from("prospectos").insert({
          nombre: r.title ?? "",
          categoria,
          ciudad,
          telefono: r.phone ?? "",
          sitio_web: r.website ?? "",
          facebook: "",
          instagram: "",
          estado_crm: "nuevo",
          puntaje_digital: 50,
          nivel: "Medio",
          prioridad: "Media",
          probabilidad: 50,
          oportunidades: [],
        });
        importados++;
      }
    }

    return NextResponse.json({ encontrados: results.length, importados, actualizados, alta_oportunidad: 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Error interno" }, { status: 500 });
  }
}


