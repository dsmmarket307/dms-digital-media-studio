import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CATEGORIAS = [
  "Landing Page","Sitio Corporativo","Tienda Online","Agencia","Portafolio",
  "Restaurantes y Comida","Hoteles y Hospedaje","Tiendas y Comercio","Belleza y Estetica",
  "Salud y Bienestar","Gimnasios y Fitness","Automotriz","Hogar y Decoracion",
  "Construccion y Remodelacion","Servicios Profesionales","Educacion y Cursos",
  "Tecnologia e Informatica","Marketing y Publicidad","Fotografia y Video",
  "Eventos y Entretenimiento","Turismo y Viajes","Mascotas","Moda y Accesorios",
  "Finanzas y Seguros","Bienes Raices","Transporte y Logistica","Agricultura y Campo",
  "Arte y Diseno","Reparaciones y Mantenimiento","Supermercados y Minimercados",
  "Bebes y Ninos","Librerias y Papelirias","Videojuegos y Tecnologia",
  "Limpieza y Servicios Domesticos","Industria y Manufactura","Inmobiliaria",
  "Medicos","Abogados","Deporte","Noticias","Blog Personal"
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, message, lead, category, project_name, categoria, fuente } = body;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "GROQ_API_KEY no configurada" }, { status: 500 });

    // DETECTAR CATEGORIA
    if (action === "detect") {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `Eres un asistente que detecta el tipo de negocio. Categorias disponibles: ${CATEGORIAS.join(", ")}.
Analiza el mensaje y responde SOLO con JSON valido sin texto adicional:
{"categoria": "nombre exacto de la categoria o null", "confianza": "alta|media|baja", "mensaje": "2 lineas explicando como una landing page ayuda a ese negocio especifico"}`
            },
            { role: "user", content: message }
          ],
          temperature: 0.3,
          max_tokens: 300,
        }),
      });
      const data = await res.json();
      const text = data.choices[0]?.message?.content ?? "{}";
      const clean = text.replace(/```json|```/g, "").trim();
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      const result = JSON.parse(jsonMatch ? jsonMatch[0] : clean);
      return NextResponse.json(result);
    }

    // GUARDAR LEAD
    if (action === "save_lead") {
      const supabase = await createClient();
      await supabase.from("leads").insert({
        nombre: lead.nombre,
        email: lead.email,
        whatsapp: lead.whatsapp,
        categoria: categoria ?? "asesoria",
        fuente: fuente ?? "chatbot",
        status: "nuevo",
      });
      return NextResponse.json({ success: true });
    }

    // GENERAR DEMO
    if (action === "generate") {
      const supabase = await createClient();

      // 1. Guardar lead
      await supabase.from("leads").insert({
        nombre: lead.nombre,
        email: lead.email,
        whatsapp: lead.whatsapp,
        categoria: category,
        proyecto: project_name,
        fuente: "chatbot",
        status: "nuevo",
      });

      // 2. Generar contenido IA
      const prompt = `Crear landing page profesional para ${project_name}, categoria: ${category}. Cliente: ${lead.nombre}.`;
      const resAI = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `Eres un experto en diseno web. Genera contenido para una landing page profesional de ${category}. Responde UNICAMENTE con JSON valido sin texto adicional:
{
  "hero": { "titulo": "titulo impactante para ${category}", "subtitulo": "descripcion atractiva del negocio", "cta_principal": "texto boton principal", "cta_secundario": "texto boton secundario" },
  "servicios": [
    { "titulo": "servicio 1", "descripcion": "descripcion especifica para ${category}", "icono": "icono" },
    { "titulo": "servicio 2", "descripcion": "descripcion especifica para ${category}", "icono": "icono" },
    { "titulo": "servicio 3", "descripcion": "descripcion especifica para ${category}", "icono": "icono" }
  ],
  "beneficios": [
    { "titulo": "beneficio 1", "descripcion": "razon para elegir este negocio" },
    { "titulo": "beneficio 2", "descripcion": "razon para elegir este negocio" },
    { "titulo": "beneficio 3", "descripcion": "razon para elegir este negocio" }
  ],
  "testimonios": [
    { "nombre": "nombre cliente", "cargo": "ciudad o cargo", "texto": "testimonio positivo realista" },
    { "nombre": "nombre cliente", "cargo": "ciudad o cargo", "texto": "testimonio positivo realista" }
  ],
  "faq": [
    { "pregunta": "pregunta frecuente de ${category}", "respuesta": "respuesta clara" },
    { "pregunta": "pregunta frecuente de ${category}", "respuesta": "respuesta clara" },
    { "pregunta": "pregunta frecuente de ${category}", "respuesta": "respuesta clara" }
  ],
  "contacto": { "titulo": "Contactanos", "descripcion": "descripcion contacto", "telefono": "300 000 0000", "email": "contacto@${project_name.toLowerCase().replace(/\s/g,'')}.com", "whatsapp": "${lead.whatsapp.replace(/\D/g,'')}", "direccion": "Colombia" },
  "footer": { "nombre_empresa": "${project_name}", "descripcion": "descripcion corta del negocio", "copyright": "2025 ${project_name}" },
  "meta": { "tipo": "${category}", "tema": "Moderno", "color_primario": "#7c3aed", "color_secundario": "#000000", "nombre_proyecto": "${project_name}" }
}`
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      const dataAI = await resAI.json();
      const textAI = dataAI.choices[0]?.message?.content ?? "{}";
      const cleanAI = textAI.replace(/```json|```/g, "").trim();
      const jsonMatch = cleanAI.match(/\{[\s\S]*\}/);
      const generatedContent = JSON.parse(jsonMatch ? jsonMatch[0] : cleanAI);

      // 3. Guardar website
      const { data: website } = await supabase.from("generated_websites").insert({
        project_name: project_name,
        prompt: prompt,
        website_type: category,
        theme: "Moderno",
        primary_color: "#7c3aed",
        secondary_color: "#000000",
        generated_content: generatedContent,
        logo_url: "",
        status: "draft",
      }).select().single();

      return NextResponse.json({ success: true, demo_id: website?.id });
    }

    // CHAT ASESOR DE VENTAS
    if (action === "chat") {
      const { messages, lead_nombre } = body;
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `Eres Sofia, asesora de ventas de DMS Digital Media Studio, una plataforma SaaS para digitalizar negocios. Eres amable, directa y experta en ventas consultivas. Respondes en espanol, de forma corta y natural, como si fuera WhatsApp. Maximo 2 oraciones por respuesta. No uses listas ni bullets. Tu objetivo es entender la necesidad del cliente y llevarlo a elegir un plan. Los planes son: Basico 49000 pesos mes: 1 landing page, editor basico, diseno responsive, boton WhatsApp, subdominio DMS. Profesional 99000 pesos mes: sitio completo, editor profesional, galeria, SEO, formulario, reservas, dominio propio, leads. Empresarial 199000 pesos mes: sitios ilimitados, editor avanzado, SEO avanzado, CRM, automatizaciones IA, agente IA, estadisticas. Todos incluyen 7 dias de prueba gratis. El cliente se llama ${lead_nombre}.`
            },
            ...messages
          ],
          temperature: 0.7,
          max_tokens: 150,
        }),
      });
      const data = await res.json();
      const reply = data.choices[0]?.message?.content ?? "Claro, en que te puedo ayudar?";
      return NextResponse.json({ reply });
    }

    return NextResponse.json({ error: "Accion no valida" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
