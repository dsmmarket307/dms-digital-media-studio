import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
      await supabase.from("reservas").insert({
        nombre,
        telefono: celular,
        fecha,
        hora,
        estado: "pendiente",
        user_id,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
