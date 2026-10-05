import Link from "next/link";
import Image from "next/image";

const PLANES = [
  {
    slug: "basico",
    name: "Basico",
    price: 49000,
    per: "mes",
    desc: "Ideal para negocios que quieren presencia digital profesional desde cero.",
    items: ["1 Landing Page activa", "Editor Basico", "Diseno Responsive", "Boton WhatsApp", "Subdominio DMS", "Finanzas, facturas e inventario", "Soporte basico"],
    popular: false,
    color: "#6366f1",
    usd: 15,
    incluye: "",
    limit: "1 sitio activo",
  },
  {
    slug: "profesional",
    name: "Profesional",
    price: 99000,
    per: "mes",
    desc: "Para empresas que necesitan un sitio completo con posicionamiento en Google.",
    items: ["1 Sitio profesional", "Editor Profesional", "Galeria de imagenes", "Formulario de contacto", "SEO basico", "Reservas", "Leads integrados", "1 dominio personalizado", "Meta Pixel"],
    popular: true,
    color: "#7c3aed",
    usd: 30,
    incluye: "Todo lo del plan Basico, mas:",
    limit: "1 sitio activo",
  },
  {
    slug: "empresarial",
    name: "Empresarial",
    price: 199000,
    per: "mes",
    desc: "Solucion completa con hasta 3 sitios, CRM, IA y soporte prioritario.",
    items: ["Hasta 3 sitios activos", "Editor Avanzado", "SEO Avanzado", "Galeria de imagenes", "3 dominios personalizados", "Formulario de contacto", "Reservas", "Leads integrados", "CRM Pipeline", "Agente IA", "Automatizaciones IA", "Estadisticas", "Meta Pixel", "Finanzas, facturas e inventario", "Centro de ayuda", "Soporte prioritario"],
    popular: false,
    color: "#0f172a",
    usd: 60,
    incluye: "",
    limit: "3 sitios activos",
  },
];

export default function PlanesPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 md:px-10 py-4 border-b sticky top-0 bg-white z-50">
        <Link href="/">
          <Image src="/logo-dms.png" alt="DMS Digital Media Studio" width={130} height={42} priority />
        </Link>
        <nav className="hidden md:flex gap-8 text-sm text-gray-600">
          <Link href="/" className="hover:text-purple-600 transition-colors">Inicio</Link>
          <Link href="/planes" className="text-purple-600 font-semibold">Planes</Link>
          <Link href="/#contacto" className="hover:text-purple-600 transition-colors">Contacto</Link>
        </nav>
      </header>

      <section className="text-center px-6 py-20 bg-gray-50 border-b">
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-xs font-bold px-4 py-2 rounded-full mb-6">
          7 dias de prueba gratuita en todos los planes
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 max-w-2xl mx-auto leading-tight">
          Tu sitio web por suscripcion mensual
        </h1>
        <p className="text-gray-500 mt-4 max-w-xl mx-auto">
          Sin pagos unicos. Sin contratos. Cancela cuando quieras. Prueba 7 dias gratis.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {PLANES.map((plan) => (
            <div key={plan.slug} className={`relative rounded-2xl border flex flex-col ${plan.popular ? "border-purple-600 shadow-xl shadow-purple-100" : "border-gray-200 hover:shadow-lg"} transition-shadow`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-5 py-1.5 rounded-full tracking-wide">
                  MAS POPULAR
                </div>
              )}
              <div className="p-8 flex-1">
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">{plan.desc}</p>
                <div className="mt-6 mb-2">
                  <span className="text-4xl font-bold text-gray-900">US$ {plan.usd}</span>
                  <span className="text-gray-400 text-sm ml-2">USD / {plan.per}</span>
                  <span className="block text-xs text-gray-400 mt-1">Se cobra en pesos: ${plan.price.toLocaleString("es-CO")} COP al mes</span>
                </div>
                <div className="mb-6">
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    7 dias gratis — luego ${plan.price.toLocaleString("es-CO")}/mes
                  </span>
                </div>
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-500">Limite: {plan.limit}</span>
                </div>
                {plan.incluye ? <p className="text-xs font-semibold text-purple-700 mb-3">{plan.incluye}</p> : null}
                <ul className="space-y-3">
                  {plan.items.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-8 pb-8 space-y-3">
                <Link href={`/auth/register?plan=${plan.slug}`} className={`block text-center py-3.5 rounded-xl font-bold text-sm transition-colors ${plan.popular ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-gray-900 text-white hover:bg-gray-700"}`}>
                  Iniciar prueba gratis
                </Link>
                <p className="text-center text-xs text-gray-400">No se requiere tarjeta de credito</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {[
            { title: "Sin contratos", desc: "Cancela en cualquier momento sin penalizaciones." },
            { title: "7 dias gratis", desc: "Prueba cualquier plan sin ingresar datos de pago." },
            { title: "Pago seguro", desc: "Procesado por Mercado Pago. Tus datos siempre protegidos." },
          ].map(f => (
            <div key={f.title} className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl p-8 md:p-12 text-white" style={{ background: "linear-gradient(135deg,#2e1065,#6d28d9)" }}>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-block text-xs font-bold tracking-widest bg-white/15 px-3 py-1 rounded-full mb-4">COMPLEMENTO</span>
              <h3 className="text-3xl font-bold leading-tight">Agente de voz con IA</h3>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "#e9d5ff" }}>Contesta tus llamadas, agenda visitas o citas y envia todo a tus leads y reservas. Se contrata aparte y requiere plan Profesional o Empresarial.</p>
              <ul className="mt-6 space-y-3 text-sm">
                {["Atiende llamadas las 24 horas", "Agenda citas y visitas automaticamente", "Guarda cada llamada con su resumen en tus leads"].map((b) => (
                  <li key={b} className="flex items-center gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {b}
                  </li>
                ))}
              </ul>
              <Link href="/#contacto" className="mt-8 inline-block bg-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-purple-50 transition-colors" style={{ color: "#5b21b6" }}>
                Solicitar agente de voz
              </Link>
            </div>
            <div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { name: "Voz Inicial", detail: "100 minutos al mes", cop: 79000, usd: 24, rec: false },
                  { name: "Voz Pro", detail: "300 minutos al mes", cop: 149000, usd: 45, rec: true },
                ].map((v) => (
                  <div key={v.name} className="relative rounded-2xl bg-white p-6 text-center" style={{ color: "#111827", border: v.rec ? "2px solid #c4b5fd" : "2px solid transparent" }}>
                    {v.rec && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-3 py-1 rounded-full" style={{ background: "#7c3aed" }}>Recomendado</span>}
                    <p className="font-bold">{v.name}</p>
                    <p className="text-xs mt-1" style={{ color: "#6b7280" }}>{v.detail}</p>
                    <p className="text-4xl font-bold mt-4">US$ {v.usd}</p>
                    <p className="text-xs" style={{ color: "#9ca3af" }}>USD / mes</p>
                    <p className="text-xs mt-3" style={{ color: "#6b7280" }}>Se cobra: ${v.cop.toLocaleString("es-CO")} COP</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-center text-xs" style={{ color: "#e9d5ff" }}>Minuto extra: US$ 0.18 (se cobra $600 COP). La configuracion inicial se cotiza aparte.</p>
            </div>
          </div>
        </div>
        <div className="mt-16 bg-gray-50 rounded-2xl border border-gray-200 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Necesitas algo personalizado?</h3>
            <p className="text-gray-500 text-sm mt-1">Cuentanos tu proyecto y te preparamos una propuesta a medida.</p>
          </div>
          <Link href="/#contacto" className="bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-purple-700 transition-colors whitespace-nowrap">
            Hablar con un asesor
          </Link>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-gray-400">
        © 2026 DMS Digital Media Studio. Todos los derechos reservados.
      </footer>
    </div>
  );
}