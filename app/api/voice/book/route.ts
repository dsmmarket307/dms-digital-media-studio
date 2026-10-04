import { NextRequest, NextResponse } from "next/server";
import { db, verifiedBody, userForAgent } from "@/lib/voice";

// Funcion personalizada de Retell. args: { nombre, telefono, fecha (AAAA-MM-DD), hora (HH:MM) }
export async function POST(req: NextRequest) {
  const body = await verifiedBody(req);
  if (!body) return NextResponse.json({ error: "firma invalida" }, { status: 401 });

  const { call, args } = body;
  const userId = await userForAgent(call.agent_id);
  if (!userId) {
    return NextResponse.json({ result: "No se pudo identificar la clinica. Ofrece que un asesor lo contacte." });
  }

  const fecha = String(args?.fecha ?? "");
  const hora = String(args?.hora ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !/^\d{2}:\d{2}$/.test(hora)) {
    return NextResponse.json({ result: "Fecha u hora invalidas. Pide al cliente que las repita." });
  }

  // Hora actual en Colombia (UTC-5, sin horario de verano)
  const ahoraCO = new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 16);
  if (fecha + "T" + hora < ahoraCO) {
    return NextResponse.json({ result: "Esa fecha ya paso. Pide otra fecha y hora al cliente." });
  }

  const supabase = db();

  const { data: ocupada } = await supabase
    .from("reservas")
    .select("id")
    .eq("user_id", userId)
    .eq("fecha", fecha)
    .eq("hora", hora)
    .neq("estado", "cancelada")
    .limit(1);

  if (ocupada && ocupada.length > 0) {
    return NextResponse.json({ result: "Ese horario ya esta ocupado. Ofrece otras dos opciones al cliente." });
  }

  const { error } = await supabase.from("reservas").insert({
    nombre: args?.nombre ?? "Cliente",
    telefono: args?.telefono ?? call.from_number ?? null,
    fecha,
    hora,
    estado: "pendiente",
    user_id: userId,
  });

  if (error) {
    return NextResponse.json({ result: "Hubo un error al agendar. Ofrece que un asesor lo contacte." });
  }
  return NextResponse.json({ result: "Cita agendada correctamente. Confirmala al cliente." });
}