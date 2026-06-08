import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, categoria, ciudad, sitio_web, facebook, instagram, whatsapp, telefono } = body;

    const prompt = `Eres un experto en marketing digital y ventas B2B. Analiza este negocio y genera un diagnostico digital completo en JSON.

Negocio: ${nombre}
Categoria: ${categoria}
Ciudad: ${ciudad}
Tiene sitio web: ${sitio_web ? "Si - " + sitio_web : "No"}
Tiene Facebook: ${facebook ? "Si - " + facebook : "No"}
Tiene Instagram: ${instagram ? "Si - " + instagram : "No"}
Tiene WhatsApp: ${whatsapp ? "Si" : "No"}
Tiene telefono: ${telefono ? "Si" : "No"}

Responde SOLO con este JSON sin markdown ni backticks:
{
  "puntaje_digital": numero entre 0 y 100,
  "nivel": "bajo" o "medio" o "alto",
  "diagnostico": {
    "tiene_sitio_web": true o false,
    "tiene_dominio_propio": true o false,
    "tiene_facebook": true o false,
    "tiene_instagram": true o false,
    "tiene_whatsapp": true o false,
    "tiene_seo": true o false,
    "tiene_google_business": true o false,
    "tiene_chatbot": true o false,
    "tiene_reservas": true o false,
    "tiene_automatizacion": true o false,
    "tiene_publicidad_digital": true o false
  },
  "oportunidades": ["oportunidad 1", "oportunidad 2", "oportunidad 3"],
  "servicio_recomendado": "nombre del servicio mas urgente",
  "prioridad": "alta" o "media" o "baja",
  "probabilidad": numero entre 0 y 100,
  "propuesta": {
    "titulo": "titulo de la propuesta",
    "problema": "problema detectado",
    "solucion": "solucion recomendada",
    "beneficios": ["beneficio 1", "beneficio 2", "beneficio 3"],
    "cta": "llamado a la accion"
  },
  "justificacion": "explicacion breve de por que este servicio"
}`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);

    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    console.error("Prospeccion error:", error);
    return NextResponse.json({ error: "Error analizando negocio" }, { status: 500 });
  }
}