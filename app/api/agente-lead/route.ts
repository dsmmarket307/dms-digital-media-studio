import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function parseFecha(fecha: string): string | null {
  if (!fecha) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
    const [d, m, y] = fecha.split("/");
    return `${y}-${m}-${d}`;
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(fecha)) {
    const [d, m, y] = fecha.split("-");
    return `${y}-${m}-${d}`;
  }
  return null;
}

function parseHora(hora: string): string | null {
  if (!hora) return hora;
  if (/^\d{2}:\d{2}$/.test(hora)) return hora;
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
    const { nombre, celular, correo, mensaje, fecha, hora, agente_id, user_id, site_id, tipo } = await req.json();
    const supabase = await createClient();

    if (tipo === "reserva") {
      const fechaISO = parseFecha(fecha);
      const horaISO = parseHora(hora);
      await supabase.from("reservas").insert({
        nombre,
        telefono: celular,
        fecha: fechaISO,
        hora: horaISO,
        estado: "pendiente",
        user_id,
      });
    } else {
      const mensajeFinal = tipo === "cita" && fecha && hora
        ? `${mensaje ?? ""} | Cita: ${parseFecha(fecha)} a las ${parseHora(hora)}`
        : mensaje;
      await supabase.from("leads").insert({
        nombre,
        email: correo,
        telefono: celular,
        mensaje: mensajeFinal,
        estado: "nuevo",
        fuente: tipo === "cita" ? "cita-chatbot" : "chatbot",
        user_id,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
