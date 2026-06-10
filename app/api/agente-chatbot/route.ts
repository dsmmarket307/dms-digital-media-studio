import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { mensaje, agente } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "GROQ_API_KEY no configurada" }, { status: 500 });

    const sistema = `Eres ${agente.nombre}, un asistente virtual humano y cercano.
Negocio: ${agente.descripcion ?? ""}
Servicios: ${agente.servicios ?? ""}
FAQ: ${agente.faq ?? ""}
Horario: ${agente.horario ?? ""}
WhatsApp: ${agente.whatsapp ?? ""}
Correo: ${agente.correo ?? ""}
Direccion: ${agente.direccion ?? ""}

REGLAS IMPORTANTES:
- Responde como un humano real, no como un robot
- Maximo 1-2 oraciones cortas y naturales
- Usa lenguaje casual y amigable, como si fuera un chat de WhatsApp
- No repitas el nombre del negocio en cada mensaje
- Si el cliente saluda, saluda de vuelta brevemente
- Si preguntan por algo especifico, responde directo al punto
- Si no sabes algo, di que lo consultas y que contacten por WhatsApp`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: sistema },
          { role: "user", content: mensaje }
        ],
        temperature: 0.85,
        max_tokens: 120,
      }),
    });

    const data = await res.json();
    const respuesta = data.choices?.[0]?.message?.content ?? "Lo siento, intenta de nuevo.";
    return NextResponse.json({ respuesta });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
