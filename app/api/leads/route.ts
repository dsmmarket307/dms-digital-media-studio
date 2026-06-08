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
    const body = await req.json();
    const { nombre, empresa, email, whatsapp, ciudad, servicio, presupuesto, mensaje } = body;

    await supabase.from("leads").insert({
      nombre,
      empresa,
      email,
      telefono: whatsapp,
      whatsapp,
      ciudad,
      servicio,
      presupuesto,
      mensaje,
      estado: "nuevo",
      fuente: "servicios",
    });

    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: "dms.digitalstudio@outlook.com",
      subject: `Nuevo lead - ${servicio}`,
      html: `
        <h2>Nuevo lead de servicios</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Empresa:</strong> ${empresa ?? "---"}</p>
        <p><strong>Correo:</strong> ${email}</p>
        <p><strong>WhatsApp:</strong> ${whatsapp}</p>
        <p><strong>Ciudad:</strong> ${ciudad ?? "---"}</p>
        <p><strong>Servicio:</strong> ${servicio}</p>
        <p><strong>Presupuesto:</strong> ${presupuesto ?? "---"}</p>
        <p><strong>Mensaje:</strong> ${mensaje ?? "---"}</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error guardando lead" }, { status: 500 });
  }
}