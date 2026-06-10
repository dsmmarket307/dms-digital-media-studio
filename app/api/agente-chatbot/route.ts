import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { mensaje, agente } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "GROQ_API_KEY no configurada" }, { status: 500 });

    const sistema = `Eres ${agente.nombre}, un asistente virtual de atención al cliente.
Negocio: ${agente.descripcion ?? ""}
Servicios: ${agente.servicios ?? ""}
Preguntas frecuentes: ${agente.faq ?? ""}
Horario: ${agente.horario ?? ""}
WhatsApp: ${agente.whatsapp ?? ""}
Correo: ${agente.correo ?? ""}
Dirección: ${agente.direccion ?? ""}

Responde siempre en español, de forma amable y profesional. Máximo 3 oraciones. Si no sabes algo, invita al cliente a contactar por WhatsApp.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: sistema },
          { role: "user", content: mensaje }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    const data = await res.json();
    const respuesta = data.choices?.[0]?.message?.content ?? "Lo siento, intenta de nuevo.";
    return NextResponse.json({ respuesta });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
