import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { conversation_id, phone, phone_number_id, access_token, texto, media_url, media_type } = await req.json();
    if (!conversation_id || !phone || !phone_number_id || !access_token) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    let payload: any;
    let mensajeGuardado = texto || "";

    if (media_url && media_type) {
      if (media_type === "image") {
        payload = { messaging_product: "whatsapp", to: phone, type: "image", image: { link: media_url } };
        mensajeGuardado = "[Imagen enviada]";
      } else if (media_type === "video") {
        payload = { messaging_product: "whatsapp", to: phone, type: "video", video: { link: media_url } };
        mensajeGuardado = "[Video enviado]";
      } else if (media_type === "audio") {
        payload = { messaging_product: "whatsapp", to: phone, type: "audio", audio: { link: media_url } };
        mensajeGuardado = "[Nota de voz enviada]";
      } else {
        payload = { messaging_product: "whatsapp", to: phone, type: "document", document: { link: media_url } };
        mensajeGuardado = "[Archivo enviado]";
      }
    } else {
      payload = { messaging_product: "whatsapp", to: phone, type: "text", text: { body: texto } };
    }

    const res = await fetch(`https://graph.facebook.com/v18.0/${phone_number_id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${access_token}` },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Error enviando WhatsApp:", data);
      return NextResponse.json({ error: data.error?.message ?? "Error enviando mensaje" }, { status: 400 });
    }

    await supabase.from("whatsapp_messages").insert({
      conversation_id,
      role: "assistant",
      message: mensajeGuardado,
      media_url: media_url ?? null,
      media_type: media_type ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error en /api/whatsapp/enviar:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
