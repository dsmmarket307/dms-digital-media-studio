"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const SERVICIOS: Record<string, any> = {
  "publicidad-digital": {
    title: "Publicidad Digital",
    desc: "Campanas publicitarias que llegan a tu cliente ideal y generan resultados medibles desde el primer dia.",
    detalle: "Gestionamos tus campanas en Facebook, Instagram y Google con estrategias probadas que maximizan cada peso invertido.",
    beneficios: [
      { titulo: "Mayor alcance", desc: "Llega a miles de clientes potenciales en tu ciudad o pais." },
      { titulo: "ROI medible", desc: "Cada peso invertido tiene un retorno claro y medible." },
      { titulo: "Segmentacion precisa", desc: "Apuntamos exactamente a tu cliente ideal por edad, ubicacion e intereses." },
      { titulo: "Optimizacion continua", desc: "Mejoramos tus campanas semana a semana con datos reales." },
    ],
    items: ["Facebook Ads", "Instagram Ads", "Google Ads", "Remarketing", "Optimizacion de campanas", "Reportes de resultados"],
    proceso: ["Analisis de tu negocio y competencia", "Diseno de estrategia publicitaria", "Creacion de anuncios profesionales", "Lanzamiento y monitoreo", "Optimizacion semanal", "Reporte mensual de resultados"],
    resultados: ["Aumento del trafico web en 300%", "Reduccion del costo por cliente", "Mayor reconocimiento de marca", "Ventas directas desde anuncios"],
    faqs: [
      { q: "Cuanto debo invertir en publicidad?", a: "Recomendamos iniciar con un presupuesto de $500.000 COP mensuales en pauta mas el costo del servicio." },
      { q: "En cuanto tiempo veo resultados?", a: "Los primeros resultados se ven en las primeras 2 semanas. Resultados solidos en 60 dias." },
      { q: "Que plataformas manejan?", a: "Facebook, Instagram, Google Ads y remarketing. Elegimos las mejores segun tu negocio." },
    ],
  },
  "automatizacion-ia": {
    title: "Automatizacion IA",
    desc: "Automatiza tu negocio con inteligencia artificial. Atiende clientes 24/7 sin esfuerzo y sin costo adicional.",
    detalle: "Implementamos chatbots y asistentes IA entrenados con la informacion de tu negocio para atender, calificar y convertir clientes automaticamente.",
    beneficios: [
      { titulo: "Atencion 24/7", desc: "Tu negocio atiende clientes a cualquier hora sin costo adicional." },
      { titulo: "Captura automatica de leads", desc: "El chatbot captura datos de clientes potenciales automaticamente." },
      { titulo: "Respuestas instantaneas", desc: "Tus clientes reciben respuesta en segundos, no horas." },
      { titulo: "Integracion total", desc: "Se integra con WhatsApp, tu sitio web y tus sistemas actuales." },
    ],
    items: ["Chatbots para sitios web", "Chatbots para WhatsApp", "Asistentes IA", "Automatizacion de procesos", "Captura automatica de leads", "Integraciones empresariales"],
    proceso: ["Analisis de tu flujo de atencion", "Diseno de conversaciones", "Entrenamiento del chatbot con tu informacion", "Integracion con tus plataformas", "Pruebas y ajustes", "Lanzamiento y monitoreo"],
    resultados: ["Reduccion del 70% en tiempo de respuesta", "Captura automatica de leads 24/7", "Aumento en satisfaccion del cliente", "Reduccion de costos operativos"],
    faqs: [
      { q: "El chatbot suena natural?", a: "Si, usamos IA avanzada que genera respuestas naturales y personalizadas segun el contexto." },
      { q: "Funciona en WhatsApp?", a: "Si, integramos el chatbot directamente en tu WhatsApp Business." },
      { q: "Puedo actualizar las respuestas?", a: "Si, puedes actualizar la informacion del chatbot en cualquier momento." },
    ],
  },
  "redes-sociales": {
    title: "Redes Sociales",
    desc: "Gestionamos tus redes sociales con contenido profesional que genera comunidad, confianza y ventas reales.",
    detalle: "Nos encargamos de toda tu presencia en redes sociales. Desde la estrategia hasta la publicacion diaria de contenido que conecta con tu audiencia.",
    beneficios: [
      { titulo: "Contenido profesional", desc: "Publicaciones disenadas por expertos que reflejan tu marca." },
      { titulo: "Crecimiento organico", desc: "Aumentamos tus seguidores reales mes a mes con estrategias probadas." },
      { titulo: "Community Management", desc: "Respondemos comentarios y mensajes en tu nombre." },
      { titulo: "Estrategia de marca", desc: "Construimos una identidad digital solida y reconocible." },
    ],
    items: ["Gestion de redes sociales", "Diseno de publicaciones", "Calendario de contenido", "Crecimiento organico", "Estrategias de marca", "Community Management"],
    proceso: ["Auditoria de redes actuales", "Diseno de estrategia de contenido", "Creacion de calendario editorial", "Produccion de contenido mensual", "Publicacion y gestion diaria", "Reporte mensual de metricas"],
    resultados: ["Crecimiento de seguidores reales", "Mayor engagement con tu audiencia", "Mas consultas y ventas desde redes", "Marca mas reconocida en tu sector"],
    faqs: [
      { q: "Cuantas publicaciones hacen por mes?", a: "Segun el plan elegido, entre 12 y 30 publicaciones mensuales entre feed, stories y reels." },
      { q: "Quienes crean el contenido?", a: "Nuestro equipo de diseno y redaccion crea todo el contenido basado en tu marca." },
      { q: "Que redes manejan?", a: "Instagram, Facebook y TikTok principalmente. Adaptamos segun tu negocio." },
    ],
  },
  "diseno-web": {
    title: "Diseno Web",
    desc: "Creamos sitios web modernos, rapidos y optimizados que convierten visitantes en clientes desde el primer dia.",
    detalle: "Disenamos y desarrollamos tu presencia digital con las mejores tecnologias. Cada sitio es unico, responsive y optimizado para convertir.",
    beneficios: [
      { titulo: "Diseno profesional", desc: "Sitios modernos que generan confianza y credibilidad." },
      { titulo: "Optimizado para movil", desc: "Tu sitio se ve perfecto en cualquier dispositivo." },
      { titulo: "Carga rapida", desc: "Sitios optimizados para cargar en menos de 3 segundos." },
      { titulo: "SEO incluido", desc: "Configuracion basica de SEO para aparecer en Google." },
    ],
    items: ["Landing Pages", "Sitios Corporativos", "Tiendas Online", "Portafolios", "Blogs", "Sitios con reservas"],
    proceso: ["Reunion de briefing", "Diseno de wireframes", "Desarrollo del sitio", "Revision y ajustes", "Publicacion final", "Capacitacion de uso"],
    resultados: ["Presencia digital profesional", "Mayor credibilidad ante clientes", "Mas consultas y ventas", "Posicionamiento en Google"],
    faqs: [
      { q: "Cuanto tarda en estar listo?", a: "Entre 7 y 25 dias habiles segun la complejidad del proyecto." },
      { q: "Incluye hosting y dominio?", a: "Te asesoramos en la mejor opcion. El hosting y dominio tienen costo aparte." },
      { q: "Puedo actualizar el contenido yo mismo?", a: "Si, te entregamos acceso y capacitacion para administrar tu sitio." },
    ],
  },
};

const PRESUPUESTOS = [
  "Menos de $500.000",
  "$500.000 - $1.000.000",
  "$1.000.000 - $3.000.000",
  "Mas de $3.000.000",
  "No lo se aun",
];

export default function ServicioDetalle() {
  const params = useParams();
  const slug = params?.slug as string;
  const servicio = SERVICIOS[slug];
  const [form, setForm] = useState({ nombre: "", empresa: "", email: "", whatsapp: "", ciudad: "", presupuesto: "", mensaje: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  if (!servicio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Servicio no encontrado</h1>
          <Link href="/servicios" className="text-purple-600 font-semibold hover:underline">Ver todos los servicios</Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.whatsapp) { setError("Por favor completa los campos requeridos."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, servicio: servicio.title }),
      });
      if (!res.ok) throw new Error("Error");
      setSent(true);
    } catch {
      setError("Error al enviar. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 md:px-10 py-4 border-b sticky top-0 bg-white z-50">
        <Link href="/">
          <Image src="/logo-dms.png" alt="DMS Digital Media Studio" width={130} height={42} priority />
        </Link>
        <nav className="hidden md:flex gap-8 text-sm text-gray-600">
          <Link href="/" className="hover:text-purple-600 transition-colors">Inicio</Link>
          <Link href="/servicios" className="text-purple-600 font-semibold">Servicios</Link>
          <Link href="/planes" className="hover:text-purple-600 transition-colors">Planes</Link>
          <Link href="/portafolio" className="hover:text-purple-600 transition-colors">Portafolio</Link>
          <Link href="/#contacto" className="hover:text-purple-600 transition-colors">Contacto</Link>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-16">
        <div>
          <Link href="/servicios" className="text-sm text-purple-600 hover:underline mb-6 inline-block">Volver a servicios</Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{servicio.title}</h1>
          <p className="text-xl text-gray-500 mb-4">{servicio.desc}</p>
          <p className="text-gray-600 mb-10">{servicio.detalle}</p>

          <div className="mb-10">
            <h2 className="font-bold text-gray-900 text-xl mb-5">Que incluye</h2>
            <div className="grid grid-cols-2 gap-3">
              {servicio.items.map((item: string) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <h2 className="font-bold text-gray-900 text-xl mb-5">Beneficios</h2>
            <div className="grid grid-cols-1 gap-4">
              {servicio.beneficios.map((b: any) => (
                <div key={b.titulo} className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{b.titulo}</p>
                    <p className="text-gray-500 text-sm mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <h2 className="font-bold text-gray-900 text-xl mb-5">Proceso de trabajo</h2>
            <div className="space-y-3">
              {servicio.proceso.map((paso: string, i: number) => (
                <div key={paso} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                  <span className="text-sm text-gray-600">{paso}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <h2 className="font-bold text-gray-900 text-xl mb-5">Resultados esperados</h2>
            <div className="grid grid-cols-2 gap-3">
              {servicio.resultados.map((r: string) => (
                <div key={r} className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 font-medium">{r}</div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-bold text-gray-900 text-xl mb-5">Preguntas frecuentes</h2>
            <div className="space-y-4">
              {servicio.faqs.map((faq: any) => (
                <div key={faq.q} className="border border-gray-200 rounded-xl p-4">
                  <p className="font-semibold text-sm text-gray-900 mb-1">{faq.q}</p>
                  <p className="text-sm text-gray-500">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:sticky md:top-24 h-fit">
          <div className="border border-gray-200 rounded-2xl p-8 shadow-lg">
            <div className="mb-6 pb-6 border-b border-gray-100">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-widest mb-1">Asesoria gratuita</p>
              <h2 className="text-xl font-bold text-gray-900">Solicita una asesoria sin costo</h2>
              <p className="text-sm text-gray-500 mt-1">Te contactamos en menos de 24 horas.</p>
            </div>

            {sent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Solicitud recibida</h3>
                <p className="text-sm text-gray-500">Te contactaremos en menos de 24 horas.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombre completo *</label>
                  <input type="text" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600" placeholder="Tu nombre" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Empresa</label>
                  <input type="text" value={form.empresa} onChange={e => setForm({ ...form, empresa: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600" placeholder="Nombre de tu empresa" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Correo electronico *</label>
                  <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600" placeholder="tu@correo.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">WhatsApp *</label>
                  <input type="text" required value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600" placeholder="+57 300 000 0000" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ciudad</label>
                  <input type="text" value={form.ciudad} onChange={e => setForm({ ...form, ciudad: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600" placeholder="Tu ciudad" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Presupuesto estimado</label>
                  <select value={form.presupuesto} onChange={e => setForm({ ...form, presupuesto: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600">
                    <option value="">Selecciona un rango</option>
                    {PRESUPUESTOS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mensaje</label>
                  <textarea value={form.mensaje} onChange={e => setForm({ ...form, mensaje: e.target.value })} rows={3} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600" placeholder="Cuentanos sobre tu proyecto..." />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors disabled:opacity-50">
                  {loading ? "Enviando..." : "Solicitar Asesoria Gratuita"}
                </button>
              </form>
            )}

            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Respuesta en menos de 24 horas
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Sin compromiso de compra
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                100% confidencial
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-gray-400">
        © 2026 DMS Digital Media Studio. Todos los derechos reservados.
      </footer>
    </div>
  );
}