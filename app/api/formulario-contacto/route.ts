import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { nombre, correo, telefono, mensaje, destino_email, user_id, site_id, nombre_negocio } = await req.json();

    if (!nombre || !mensaje || !destino_email) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: destino_email,
      replyTo: correo || undefined,
      subject: `Nuevo mensaje de contacto - ${nombre_negocio ?? "tu sitio web"}`,
      html: `
        <h2>Nuevo mensaje desde tu sitio web</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Correo:</strong> ${correo ?? "---"}</p>
        <p><strong>Telefono:</strong> ${telefono ?? "---"}</p>
        <p><strong>Mensaje:</strong> ${mensaje}</p>
      `,
    });

    if (user_id) {
      await supabase.from("leads").insert({
        nombre,
        email: correo,
        telefono,
        mensaje,
        estado: "nuevo",
        fuente: "formulario-contacto",
        user_id,
        site_id,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error enviando el mensaje" }, { status: 500 });
  }
}