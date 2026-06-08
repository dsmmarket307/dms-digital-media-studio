import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, website_type, theme, primary_color, secondary_color, project_name } = await req.json();
    if (!prompt) return NextResponse.json({ error: "Prompt requerido" }, { status: 400 });
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "GROQ_API_KEY no configurada" }, { status: 500 });

    const isTienda = website_type === "Tienda Online";

    const productosSchema = isTienda ? `
  "productos": [
    { "nombre": "nombre producto 1", "descripcion": "descripcion breve", "precio": "precio en COP", "categoria": "categoria", "destacado": true },
    { "nombre": "nombre producto 2", "descripcion": "descripcion breve", "precio": "precio en COP", "categoria": "categoria", "destacado": false },
    { "nombre": "nombre producto 3", "descripcion": "descripcion breve", "precio": "precio en COP", "categoria": "categoria", "destacado": true },
    { "nombre": "nombre producto 4", "descripcion": "descripcion breve", "precio": "precio en COP", "categoria": "categoria", "destacado": false },
    { "nombre": "nombre producto 5", "descripcion": "descripcion breve", "precio": "precio en COP", "categoria": "categoria", "destacado": false },
    { "nombre": "nombre producto 6", "descripcion": "descripcion breve", "precio": "precio en COP", "categoria": "categoria", "destacado": true }
  ],
  "categorias": ["categoria 1", "categoria 2", "categoria 3"],` : '';

    const systemPrompt = `Eres un experto en diseno web y marketing digital. Tu tarea es generar el contenido completo para una pagina web profesional basandote en el prompt del usuario.
Debes responder UNICAMENTE con un objeto JSON valido con esta estructura exacta:
{
  "hero": {
    "titulo": "titulo principal impactante",
    "subtitulo": "descripcion atractiva del negocio",
    "cta_principal": "texto del boton principal",
    "cta_secundario": "texto del boton secundario"
  },${productosSchema}
  "servicios": [
    { "titulo": "servicio 1", "descripcion": "descripcion breve", "icono": "nombre icono svg" },
    { "titulo": "servicio 2", "descripcion": "descripcion breve", "icono": "nombre icono svg" },
    { "titulo": "servicio 3", "descripcion": "descripcion breve", "icono": "nombre icono svg" }
  ],
  "beneficios": [
    { "titulo": "beneficio 1", "descripcion": "por que elegirnos" },
    { "titulo": "beneficio 2", "descripcion": "por que elegirnos" },
    { "titulo": "beneficio 3", "descripcion": "por que elegirnos" }
  ],
  "testimonios": [
    { "nombre": "nombre cliente", "cargo": "cargo o ciudad", "texto": "testimonio positivo" },
    { "nombre": "nombre cliente", "cargo": "cargo o ciudad", "texto": "testimonio positivo" }
  ],
  "faq": [
    { "pregunta": "pregunta frecuente", "respuesta": "respuesta clara" },
    { "pregunta": "pregunta frecuente", "respuesta": "respuesta clara" },
    { "pregunta": "pregunta frecuente", "respuesta": "respuesta clara" }
  ],
  "contacto": {
    "titulo": "titulo seccion contacto",
    "descripcion": "descripcion breve",
    "telefono": "numero telefono ejemplo",
    "email": "email ejemplo",
    "whatsapp": "numero whatsapp",
    "direccion": "direccion si aplica"
  },
  "footer": {
    "nombre_empresa": "nombre de la empresa",
    "descripcion": "descripcion corta empresa",
    "copyright": "ano y empresa"
  },
  "meta": {
    "tipo": "${website_type}",
    "tema": "${theme}",
    "color_primario": "${primary_color}",
    "color_secundario": "${secondary_color}",
    "nombre_proyecto": "${project_name}"
  }
}
Adapta el contenido al tipo de negocio, industria y contexto del prompt.${isTienda ? " Para la tienda genera productos reales y relevantes con precios en COP." : ""} Se creativo y profesional.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Groq error: ${err}` }, { status: 500 });
    }

    const data = await res.json();
    const text = data.choices[0]?.message?.content ?? "";
    let content;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      content = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      return NextResponse.json({ error: "Error parseando respuesta de IA" }, { status: 500 });
    }

    return NextResponse.json({ content });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}