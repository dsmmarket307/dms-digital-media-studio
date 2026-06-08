import Link from "next/link";
import Image from "next/image";

const PLANES = [
  {
    slug: "basico",
    name: "Basico",
    price: 49000,
    per: "mes",
    desc: "Ideal para negocios que quieren presencia digital profesional desde cero.",
    items: ["1 Landing Page activa", "Boton WhatsApp", "Formulario de contacto", "Diseno responsive", "Subdominio DMS", "Soporte basico"],
    popular: false,
    color: "#6366f1",
    limit: "1 sitio activo",
  },
  {
    slug: "profesional",
    name: "Profesional",
    price: 99000,
    per: "mes",
    desc: "Para empresas que necesitan un sitio completo con posicionamiento en Google.",
    items: ["1 Sitio profesional activo", "Editor Visual", "SEO basico", "Formularios avanzados", "Dominio personalizado", "Leads integrados"],
    popular: true,
    color: "#7c3aed",
    limit: "1 sitio activo",
  },
  {
    slug: "empresarial",
    name: "Empresarial",
    price: 199000,
    per: "mes",
    desc: "Solucion completa con hasta 3 sitios, CRM, IA y soporte prioritario.",
    items: ["Hasta 3 sitios activos", "CRM integrado", "Automatizaciones IA", "Agente IA", "Dominios personalizados", "Soporte prioritario"],
    popular: false,
    color: "#0f172a",
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
                  <span className="text-4xl font-bold text-gray-900">${plan.price.toLocaleString("es-CO")}</span>
                  <span className="text-gray-400 text-sm ml-2">COP / {plan.per}</span>
                </div>
                <div className="mb-6">
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    7 dias gratis — luego ${plan.price.toLocaleString("es-CO")}/mes
                  </span>
                </div>
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-500">Limite: {plan.limit}</span>
                </div>
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