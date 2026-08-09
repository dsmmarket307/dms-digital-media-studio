import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === (process.env.WHATSAPP_VERIFY_TOKEN || "dms2026")) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

async function extraerDatosDeHistorial(mensajes: string[]) {
  try {
    const textoCompleto = mensajes.join(" | ");
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "user",
            content: `Analiza estos mensajes de un cliente de WhatsApp y extrae: nombre completo, y que necesita o en que esta interesado. Los datos pueden estar distribuidos en varios mensajes. Mensajes: "${textoCompleto}"

Responde SOLO con JSON sin texto adicional ni markdown. Si falta algun dato pon null. Formato:
{"nombre": "string o null", "interes": "string o null"}`,
          },
        ],
        max_tokens: 200,
        temperature: 0,
      }),
    });
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

async function descargarMediaWhatsApp(mediaId: string, accessToken: string): Promise<{ url: string; mimeType: string } | null> {
  try {
    const metaRes = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const metaData = await metaRes.json();
    if (!metaData.url) return null;

    const fileRes = await fetch(metaData.url, { headers: { Authorization: `Bearer ${accessToken}` } });
    const arrayBuffer = await fileRes.arrayBuffer();
    const mimeType = metaData.mime_type || "application/octet-stream";
    const ext = mimeType.split("/")[1]?.split(";")[0] || "bin";
    const fileName = `whatsapp-media/${mediaId}.${ext}`;

    await supabase.storage.from("logos").upload(fileName, Buffer.from(arrayBuffer), {
      contentType: mimeType,
      upsert: true,
    });
    const { data: publicUrlData } = supabase.storage.from("logos").getPublicUrl(fileName);
    return { url: publicUrlData.publicUrl, mimeType };
  } catch (e) {
    console.error("Error descargando media de WhatsApp:", e);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.object !== "whatsapp_business_account") return NextResponse.json({ status: "ok" });

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;
    if (!messages || messages.length === 0) return NextResponse.json({ status: "ok" });

    const message = messages[0];
    const fromPhone = message.from;
    const phoneNumberId = value.metadata?.phone_number_id;

    const { data: settings } = await supabase
      .from("whatsapp_settings")
      .select("*")
      .eq("phone_number_id", phoneNumberId)
      .eq("active", true)
      .maybeSingle();
    if (!settings) return NextResponse.json({ status: "ok" });

    let messageText = "";
    let mediaUrl: string | null = null;
    let mediaType: string | null = null;

    if (message.type === "text") {
      messageText = message.text?.body || "";
    } else if (message.type === "image" || message.type === "audio" || message.type === "document" || message.type === "video") {
      const mediaObj = message[message.type];
      const downloaded = await descargarMediaWhatsApp(mediaObj.id, settings.access_token);
      if (downloaded) {
        mediaUrl = downloaded.url;
        mediaType = message.type;
      }
      messageText =
        message.type === "audio"
          ? "[Nota de voz recibida]"
          : message.type === "image"
          ? mediaObj.caption || "[Imagen recibida]"
          : message.type === "video"
          ? "[Video recibido]"
          : "[Archivo recibido]";
    } else {
      return NextResponse.json({ status: "ok" });
    }

    let { data: conversation } = await supabase
      .from("whatsapp_conversations")
      .select("*")
      .eq("phone", fromPhone)
      .eq("user_id", settings.user_id)
      .eq("status", "activa")
      .maybeSingle();

    if (conversation) {
      const ultimoMensaje = new Date(conversation.updated_at || conversation.created_at);
      const horasSinActividad = (Date.now() - ultimoMensaje.getTime()) / (1000 * 60 * 60);
      if (horasSinActividad > 24) {
        await supabase.from("whatsapp_conversations").update({ status: "cerrada" }).eq("id", conversation.id);
        conversation = null;
      }
    }

    if (!conversation) {
      const { data: newConv } = await supabase
        .from("whatsapp_conversations")
        .insert({ user_id: settings.user_id, phone: fromPhone, status: "activa" })
        .select()
        .single();
      conversation = newConv;
    }

    await supabase.from("whatsapp_conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversation!.id);
    await supabase.from("whatsapp_messages").insert({
      conversation_id: conversation!.id,
      role: "user",
      message: messageText,
      media_url: mediaUrl,
      media_type: mediaType,
    });

    async function enviarYGuardar(texto: string) {
      await supabase.from("whatsapp_messages").insert({ conversation_id: conversation!.id, role: "assistant", message: texto });
      await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${settings.access_token}` },
        body: JSON.stringify({ messaging_product: "whatsapp", to: fromPhone, type: "text", text: { body: texto } }),
      });
    }

    // Si el negocio tomo control manual, el bot no responde
    if (conversation!.modo_manual && conversation!.manual_hasta) {
      const manualHasta = new Date(conversation!.manual_hasta);
      if (new Date() < manualHasta) {
        return NextResponse.json({ status: "ok" });
      } else {
        await supabase.from("whatsapp_conversations").update({ modo_manual: false, manual_hasta: null }).eq("id", conversation!.id);
      }
    }

    // Si llego un audio/imagen/archivo sin texto claro, avisa que lo recibio y sigue con IA solo si hay texto util
    if (mediaType && messageText.startsWith("[")) {
      await enviarYGuardar("Recibi tu mensaje, en un momento te respondo. Si tienes alguna pregunta especifica escribela por favor.");
      return NextResponse.json({ status: "ok" });
    }

    const { data: historial } = await supabase
      .from("whatsapp_messages")
      .select("role, message")
      .eq("conversation_id", conversation!.id)
      .order("created_at", { ascending: true })
      .limit(30);

    // Capturar lead si aun no existe uno para este telefono/negocio
    const mensajesCliente = (historial || []).filter((m: any) => m.role === "user").map((m: any) => m.message);
    if (mensajesCliente.length >= 2) {
      const { data: leadExistente } = await supabase.from("leads").select("id").eq("telefono", fromPhone).eq("user_id", settings.user_id).maybeSingle();
      if (!leadExistente) {
        const datos = await extraerDatosDeHistorial(mensajesCliente);
        if (datos?.nombre) {
          await supabase.from("leads").insert({
            nombre: datos.nombre,
            telefono: fromPhone,
            mensaje: datos.interes || messageText,
            estado: "nuevo",
            fuente: "whatsapp",
            user_id: settings.user_id,
          });
        }
      }
    }

    const instruccion = `Eres ${settings.agent_name || "un asistente"}, agente de atencion por WhatsApp de este negocio.
${settings.business_info || "Responde de forma amable y profesional sobre el negocio."}
- Responde SIEMPRE en maximo 2-3 lineas cortas, tipo mensaje real de WhatsApp.
- No repitas informacion que ya diste antes en el historial.
- Se amable, profesional y resolutivo.
- Si el cliente quiere agendar, reservar o cotizar algo especifico, pidele su nombre completo si aun no lo sabes.`;

    const groqMessages = [
      { role: "system" as const, content: instruccion },
      ...(historial || []).map((m: any) => ({ role: m.role as "user" | "assistant", content: m.message || "" })),
    ];

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({ model: "openai/gpt-oss-120b", messages: groqMessages, max_tokens: 400, temperature: 0.7 }),
    });
    const groqData = await groqRes.json();
    let respuesta = groqData.choices?.[0]?.message?.content;
    if (!respuesta) respuesta = "Disculpa, tuve un problema tecnico. Por favor escribe de nuevo.";

    await enviarYGuardar(respuesta);
    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("Webhook WhatsApp DMS error:", err.message);
    return NextResponse.json({ status: "error", error: err.message }, { status: 500 });
  }
}
