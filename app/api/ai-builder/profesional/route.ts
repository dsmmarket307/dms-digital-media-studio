import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, website_type, theme, primary_color, secondary_color, project_name } = await req.json();
    if (!prompt) return NextResponse.json({ error: "Prompt requerido" }, { status: 400 });

    const systemPrompt = `Eres un experto en diseño web premium y marketing digital. Genera contenido completo y ampliado para un sitio web PROFESIONAL de alta calidad.
Responde UNICAMENTE con JSON valido con esta estructura:
{
  "hero": {
    "titulo": "titulo principal impactante y profesional",
    "subtitulo": "descripcion atractiva y completa del negocio",
    "cta_principal": "texto boton principal",
    "cta_secundario": "texto boton secundario",
    "badge": "texto de credencial o certificacion"
  },
  "nosotros": {
    "titulo": "titulo seccion nosotros",
    "historia": "parrafo sobre la historia del negocio",
    "mision": "mision de la empresa",
    "vision": "vision de la empresa",
    "propuesta_valor": "que nos hace unicos",
    "anos_experiencia": numero,
    "clientes_atendidos": numero,
    "proyectos_completados": numero
  },
  "servicios": [
    { "titulo": "servicio", "descripcion": "descripcion ampliada profesional", "detalle": "beneficio clave", "precio_desde": "precio o consultar" },
    { "titulo": "servicio", "descripcion": "descripcion ampliada profesional", "detalle": "beneficio clave", "precio_desde": "precio o consultar" },
    { "titulo": "servicio", "descripcion": "descripcion ampliada profesional", "detalle": "beneficio clave", "precio_desde": "precio o consultar" },
    { "titulo": "servicio", "descripcion": "descripcion ampliada profesional", "detalle": "beneficio clave", "precio_desde": "precio o consultar" }
  ],
  "galeria": {
    "titulo": "titulo galeria",
    "subtitulo": "descripcion galeria"
  },
  "testimonios": [
    { "nombre": "nombre", "cargo": "cargo ciudad", "texto": "testimonio detallado y convincente", "estrellas": 5 },
    { "nombre": "nombre", "cargo": "cargo ciudad", "texto": "testimonio detallado y convincente", "estrellas": 5 },
    { "nombre": "nombre", "cargo": "cargo ciudad", "texto": "testimonio detallado y convincente", "estrellas": 5 }
  ],
  "faq": [
    { "pregunta": "pregunta frecuente", "respuesta": "respuesta completa y profesional" },
    { "pregunta": "pregunta frecuente", "respuesta": "respuesta completa y profesional" },
    { "pregunta": "pregunta frecuente", "respuesta": "respuesta completa y profesional" },
    { "pregunta": "pregunta frecuente", "respuesta": "respuesta completa y profesional" },
    { "pregunta": "pregunta frecuente", "respuesta": "respuesta completa y profesional" }
  ],
  "contacto": {
    "titulo": "titulo contacto",
    "descripcion": "descripcion contacto",
    "telefono": "numero de telefono real o ejemplo",
    "email": "email@ejemplo.com",
    "whatsapp": "numero whatsapp",
    "direccion": "direccion completa",
    "horario": "horario de atencion",
    "instagram": "@usuario_instagram",
    "facebook": "facebook.com/pagina",
    "tiktok": "@usuario_tiktok",
    "youtube": "youtube.com/@canal"
  },
  "footer": {
    "nombre_empresa": "nombre empresa",
    "descripcion": "descripcion empresa",
    "copyright": "copyright"
  },
  "meta": {
    "title": "meta title seo optimizado",
    "description": "meta description seo 160 caracteres",
    "tipo": "${website_type}",
    "nombre_proyecto": "${project_name}",
    "pexels_keywords": "3 a 5 palabras en ingles para buscar imagenes en Pexels que representen perfectamente este tipo de negocio especifico"
  }
}
IMPORTANTE: En meta.pexels_keywords pon palabras en INGLES que describan visualmente este negocio especifico. Ejemplos: para panaderia pon "bakery bread fresh pastry", para joyeria pon "jewelry luxury gold rings", para barberia pon "barbershop haircut men grooming".
Genera contenido MUY detallado, profesional y convincente. Adapta perfectamente al tipo de negocio.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 3500,
      }),
    });

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const content = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    return NextResponse.json({ content });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}