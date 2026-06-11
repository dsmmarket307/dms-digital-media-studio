import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function parseFecha(fecha: string): string | null {
  if (!fecha) return null;
  // Si ya es ISO (2026-06-29)
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
  // Si es dd/mm/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
    const [d, m, y] = fecha.split("/");
    return `${y}-${m}-${d}`;
  }
  // Si es dd-mm-yyyy
  if (/^\d{2}-\d{2}-\d{4}$/.test(fecha)) {
    const [d, m, y] = fecha.split("-");
    return `${y}-${m}-${d}`;
  }
  return null;
}

function parseHora(hora: string): string | null {
  if (!hora) return null;
  // Si ya es HH:mm
  if (/^\d{2}:\d{2}$/.test(hora)) return hora;
  // Si es 2:00 PM / 10:00 AM
  const match = hora.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    let h = parseInt(match[1]);
    const m = match[2];
    const period = match[3].toUpperCase();
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${h.toString().padStart(2, "0")}:${m}`;
  }
  return hora;
}

export async function POST(req: NextRequest) {
  try {
    const { nombre, celular, correo, mensaje, fecha, hora, agente_id, user_id, site_id, es_cita } = await req.json();
    const supabase = await createClient();
    await supabase.from("leads").insert({
      nombre,
      email: correo,
      telefono: celular,
      mensaje,
      estado: "nuevo",
      fuente: "chatbot",
      user_id,
    });
    if (es_cita && fecha && hora) {
      const fechaISO = parseFecha(fecha);
      const horaISO = parseHora(hora);
      if (fechaISO && horaISO) {
        await supabase.from("reservas").insert({
          nombre,
          telefono: celular,
          fecha: fechaISO,
          hora: horaISO,
          estado: "pendiente",
          user_id,
        });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
