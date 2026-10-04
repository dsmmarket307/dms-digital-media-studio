import { NextRequest, NextResponse } from "next/server";
import { db, verifiedBody, userForAgent } from "@/lib/voice";

export async function POST(req: NextRequest) {
  const body = await verifiedBody(req);
  if (!body) return NextResponse.json({ error: "firma invalida" }, { status: 401 });

  const { event, call } = body;
  if (event !== "call_ended" && event !== "call_analyzed") {
    return NextResponse.json({ ok: true });
  }

  const userId = await userForAgent(call.agent_id);
  if (!userId) return NextResponse.json({ ok: true, ignorado: "agente sin usuario" });

  const supabase = db();

  const { data: previa } = await supabase
    .from("voice_calls")
    .select("resumen, resultado")
    .eq("provider_call_id", call.call_id)
    .maybeSingle();

  const segundos =
    call.end_timestamp && call.start_timestamp
      ? Math.round((call.end_timestamp - call.start_timestamp) / 1000)
      : 0;

  const analisis = call.call_analysis ?? {};
  const datos = analisis.custom_analysis_data ?? {};
  const resumen = analisis.call_summary ?? previa?.resumen ?? null;
  const resultado = datos.resultado ?? previa?.resultado ?? null;

  const { error } = await supabase.from("voice_calls").upsert(
    {
      user_id: userId,
      provider_call_id: call.call_id,
      direccion: call.direction ?? null,
      numero_origen: call.from_number ?? null,
      numero_destino: call.to_number ?? null,
      inicio: call.start_timestamp ? new Date(call.start_timestamp).toISOString() : null,
      duracion_segundos: segundos,
      transcripcion: call.transcript ?? null,
      resumen,
      sentimiento: analisis.user_sentiment ?? null,
      resultado,
    },
    { onConflict: "provider_call_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (event === "call_analyzed" && resumen && !previa?.resumen) {
    const { error: errorLead } = await supabase.from("leads").insert({
      nombre: datos.nombre ?? call.from_number ?? "Llamada IA",
      telefono: call.from_number ?? null,
      mensaje: resumen,
      estado: "nuevo",
      fuente: "voz-ia",
      user_id: userId,
    });
    if (errorLead) console.error("Error creando lead de voz:", errorLead.message);
  }

  return NextResponse.json({ ok: true });
}