"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
const PLANES: Record<string, any> = {
  emprendedor: {
    name: "Plan Emprendedor",
    price: 150000,
    desc: "Ideal para negocios que quieren presencia digital profesional desde cero.",
    beneficios: [
      "Landing page profesional de hasta 5 secciones",
      "Boton de WhatsApp flotante",
      "Formulario de contacto funcional",
      "Diseno 100% responsive para movil y escritorio",
      "Configuracion de dominio y hosting",
      "Optimizacion basica de velocidad",
    ],
    entrega: "7 dias habiles",
    garantia: "14 dias de revisiones incluidas",
    faqs: [
      { q: "Que incluye el hosting?", a: "Configuramos el hosting que ya tengas o te recomendamos uno economico." },
      { q: "Puedo agregar mas secciones despues?", a: "Si, con un costo adicional segun el trabajo requerido." },
      { q: "Como es el proceso de pago?", a: "Pago 100% anticipado a traves de Mercado Pago de forma segura." },
    ],
    proceso: ["Reunion de briefing", "Diseno y maquetado", "Revision y ajustes", "Publicacion final"],
  },
  negocio: {
    name: "Plan Negocio",
    price: 1200000,
    desc: "Para empresas que necesitan un sitio completo con posicionamiento en Google.",
    beneficios: [
      "Sitio corporativo de hasta 8 paginas",
      "SEO basico en todas las paginas",
      "Formularios avanzados con notificaciones",
      "Blog integrado con panel de administracion",
      "Google Analytics configurado",
      "Mapa de Google integrado",
      "Redes sociales vinculadas",
    ],
    entrega: "15 dias habiles",
    garantia: "21 dias de revisiones incluidas",
    faqs: [
      { q: "El blog es facil de administrar?", a: "Si, usamos un CMS intuitivo para que puedas publicar sin conocimientos tecnicos." },
      { q: "El SEO garantiza posicionamiento?", a: "El SEO basico prepara tu sitio correctamente. Los resultados dependen de la competencia y el tiempo." },
      { q: "Incluye mantenimiento?", a: "No esta incluido, pero tenemos planes mensuales de mantenimiento disponibles." },
    ],
    proceso: ["Briefing y estrategia", "Arquitectura del sitio", "Diseno y desarrollo", "SEO y configuracion", "Revision y publicacion"],
  },
  premium: {
    name: "Plan Premium",
    price: 2500000,
    desc: "Solucion completa con tienda online, automatizaciones IA y soporte prioritario.",
    beneficios: [
      "Tienda online completa con carrito de compras",
      "Automatizaciones con inteligencia artificial",
      "SEO avanzado con auditoria incluida",
      "Integraciones con CRM y herramientas externas",
      "Soporte prioritario por 30 dias",
      "Panel de administracion personalizado",
      "Chatbot IA integrado",
      "Pasarela de pagos configurada",
    ],
    entrega: "25 dias habiles",
    garantia: "30 dias de revisiones incluidas",
    faqs: [
      { q: "Que pasarelas de pago incluye?", a: "Mercado Pago, PayU y transferencia bancaria segun tu necesidad." },
      { q: "Como funciona el chatbot IA?", a: "Configuramos un asistente entrenado con la informacion de tu negocio." },
      { q: "El soporte prioritario que incluye?", a: "Atencion en menos de 24 horas para cualquier ajuste o inconveniente." },
    ],
    proceso: ["Briefing completo", "Diseno UX/UI", "Desarrollo frontend y backend", "Integraciones IA", "Testing y QA", "Publicacion y capacitacion"],
  },
};

export default function PlanDetalle() {
  const params = useParams();
  const slug = params?.slug as string;
  const plan = PLANES[slug];
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Plan no encontrado</h1>
          <Link href="/planes" className="text-purple-600 font-semibold hover:underline">Ver todos los planes</Link>
        </div>
      </div>
    );
  }

  async function handleComprar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre || !form.email) { setError("Por favor completa nombre y correo."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/mercadopago/crear-preferencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package_name: plan.name,
          package_slug: slug,
          price: plan.price,
          customer_name: form.nombre,
          customer_email: form.email,
          customer_phone: form.telefono,
        }),
      });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        setError("No se pudo iniciar el pago. Intenta nuevamente.");
        setLoading(false);
      }
    } catch {
      setError("Error de conexion. Intenta nuevamente.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 md:px-10 py-4 border-b sticky top-0 bg-white z-50">
        <Link href="/">
          <Image src="/logo-dms.png" alt="DMS Digital Media Studio" width={130} height={42} priority />
        </Link>
        <Link href="/planes" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
          Ver todos los planes
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-16">
        <div>
          <Link href="/planes" className="text-sm text-purple-600 hover:underline mb-6 inline-block">Volver a planes</Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{plan.name}</h1>
          <p className="text-gray-500 mb-6">{plan.desc}</p>
          <div className="mb-8">
            <span className="text-5xl font-bold text-gray-900">${plan.price.toLocaleString("es-CO")}</span>
            <span className="text-gray-400 ml-2">COP</span>
          </div>
          <div className="mb-8">
            <h2 className="font-bold text-gray-900 mb-4">Que incluye</h2>
            <ul className="space-y-3">
              {plan.beneficios.map((b: string) => (
                <li key={b} className="flex items-start gap-3 text-sm text-gray-600">
                  <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-xs text-purple-600 font-semibold uppercase tracking-wider mb-1">Entrega</p>
              <p className="text-sm font-semibold text-gray-900">{plan.entrega}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-1">Garantia</p>
              <p className="text-sm font-semibold text-gray-900">{plan.garantia}</p>
            </div>
          </div>
          <div className="mb-8">
            <h2 className="font-bold text-gray-900 mb-4">Proceso de trabajo</h2>
            <div className="space-y-3">
              {plan.proceso.map((paso: string, i: number) => (
                <div key={paso} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                  <span className="text-sm text-gray-600">{paso}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 mb-4">Preguntas frecuentes</h2>
            <div className="space-y-4">
              {plan.faqs.map((faq: any) => (
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
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              </div>
              <div>
                <p className="font-bold text-gray-900">{plan.name}</p>
                <p className="text-sm text-gray-500">${plan.price.toLocaleString("es-CO")} COP</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-4">Tus datos para continuar</p>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
            )}
            <form onSubmit={handleComprar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombre completo</label>
                <input type="text" required placeholder="Tu nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Correo electronico</label>
                <input type="email" required placeholder="tu@correo.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Telefono (opcional)</label>
                <input type="text" placeholder="+57 300 000 0000" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors disabled:opacity-50 mt-2">
                {loading ? "Redirigiendo a Mercado Pago..." : "Pagar con Mercado Pago"}
              </button>
            </form>
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Pago 100% seguro con Mercado Pago
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Confirmacion inmediata por correo
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                {plan.garantia}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-gray-400">
        2026 DMS Digital Media Studio. Todos los derechos reservados.
      </footer>
    </div>
  );
}
