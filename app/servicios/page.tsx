import Link from "next/link";
import Image from "next/image";

const SERVICIOS = [
  {
    slug: "diseno-web",
    title: "Diseno Web",
    desc: "Creamos sitios web modernos, rapidos y optimizados que convierten visitantes en clientes.",
    items: ["Landing Pages", "Sitios Corporativos", "Tiendas Online", "Portafolios"],
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.75">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
      </svg>
    ),
  },
  {
    slug: "publicidad-digital",
    title: "Publicidad Digital",
    desc: "Campanas publicitarias que llegan a tu cliente ideal y generan resultados medibles.",
    items: ["Facebook Ads", "Instagram Ads", "Google Ads", "Remarketing"],
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.75">
        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"/>
      </svg>
    ),
  },
  {
    slug: "automatizacion-ia",
    title: "Automatizacion IA",
    desc: "Automatiza tu negocio con inteligencia artificial. Atiende clientes 24/7 sin esfuerzo.",
    items: ["Chatbots IA", "WhatsApp IA", "Automatizacion de procesos", "Asistentes virtuales"],
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.75">
        <rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 11V7"/><circle cx="12" cy="5" r="2"/><path d="M8 11V9a4 4 0 0 1 8 0v2"/>
      </svg>
    ),
  },
  {
    slug: "redes-sociales",
    title: "Redes Sociales",
    desc: "Gestionamos tus redes sociales con contenido profesional que genera comunidad y ventas.",
    items: ["Gestion de contenido", "Community Manager", "Reels y Stories", "Crecimiento organico"],
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.75">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
      </svg>
    ),
  },
];

export default function ServiciosPage() {
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
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-purple-600 font-medium">Ingresar</Link>
          <Link href="/auth/register" className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors">Registrarse</Link>
        </div>
      </header>

      <section className="text-center px-6 py-20 bg-gray-50 border-b">
        <p className="text-sm font-semibold text-purple-600 uppercase tracking-widest mb-3">Lo que hacemos</p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 max-w-2xl mx-auto leading-tight">
          Servicios digitales para hacer crecer tu negocio
        </h1>
        <p className="text-gray-500 mt-4 max-w-xl mx-auto">
          Cada servicio esta disenado para generar resultados reales. Elige lo que necesitas y selecciona el plan ideal.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          {SERVICIOS.map((s) => (
            <div key={s.slug} className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow flex flex-col gap-4">
              <div className="p-4 bg-purple-50 rounded-2xl w-fit">{s.icon}</div>
              <h2 className="text-2xl font-bold text-gray-900">{s.title}</h2>
              <p className="text-gray-500">{s.desc}</p>
              <ul className="grid grid-cols-2 gap-2">
                {s.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3 mt-2">
                <Link href={`/servicios/${s.slug}`} className={`text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${s.slug === "diseno-web" ? "flex-1 border border-purple-600 text-purple-600 hover:bg-purple-50" : "w-full bg-purple-600 text-white hover:bg-purple-700"}`}>
                  Ver mas
                </Link>
                {s.slug === "diseno-web" && (
                  <Link href="/planes" className="flex-1 text-center bg-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors">
                    Ver planes
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-purple-600 px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Listo para empezar?</h2>
        <p className="text-purple-200 mb-8 max-w-xl mx-auto">Elige un plan y comienza a transformar tu negocio hoy mismo.</p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/planes" className="bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors">
            Ver planes y precios
          </Link>
          <Link href="/#contacto" className="border border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors">
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