import Link from "next/link";
import Image from "next/image";

const PROYECTOS = [
  { title: "Aura Spa & Wellness", categoria: "Spa / Bienestar", img: "/sitio-spa.webp", desc: "Sitio web generado con IA en minutos. Reservas online y galeria de servicios." },
  { title: "Restaurante La Brasa", categoria: "Gastronomia", img: "/sitio-restaurante.webp", desc: "Presencia digital completa con menu, reservas y formulario de contacto." },
  { title: "Tu Sonrisa", categoria: "Salud / Dental", img: "/sitio-dental.webp", desc: "Sitio profesional con agenda de citas y galeria de tratamientos." },
  { title: "Carlos Inmobiliaria", categoria: "Inmobiliaria", img: "/sitio-inmobiliaria.webp", desc: "Plataforma de propiedades con formulario de contacto y CRM integrado." },
  { title: "Moto Rize", categoria: "Automotriz", img: "/sitio-moto.webp", desc: "Sitio automotriz con catalogo de productos y boton WhatsApp." },
  { title: "Santo Abogados", categoria: "Legal / Abogados", img: "/sitio-abogados.webp", desc: "Presencia digital profesional con formulario de consulta y SEO optimizado." },
];

export default function PortafolioPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 md:px-10 py-4 border-b sticky top-0 bg-white z-50">
        <Link href="/">
          <Image src="/logo-dms.png" alt="DMS Digital Media Studio" width={130} height={42} priority />
        </Link>
        <nav className="hidden md:flex gap-8 text-sm text-gray-600">
          <Link href="/" className="hover:text-purple-600 transition-colors">Inicio</Link>
          <Link href="/servicios" className="hover:text-purple-600 transition-colors">Servicios</Link>
          <Link href="/planes" className="hover:text-purple-600 transition-colors">Planes</Link>
          <Link href="/portafolio" className="text-purple-600 font-semibold">Portafolio</Link>
          <Link href="/#contacto" className="hover:text-purple-600 transition-colors">Contacto</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-purple-600 font-medium">Ingresar</Link>
          <Link href="/auth/register" className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors">Comienza gratis</Link>
        </div>
      </header>

      <section className="text-center px-6 py-20 bg-gray-50 border-b">
        <p className="text-sm font-semibold text-purple-600 uppercase tracking-widest mb-3">Generado con IA</p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 max-w-2xl mx-auto leading-tight">
          Sitios web generados con IA
        </h1>
        <p className="text-gray-500 mt-4 max-w-xl mx-auto">
          Explora ejemplos de sitios creados con IA y listos para impulsar negocios reales.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          {PROYECTOS.map((p) => (
            <div key={p.title} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative w-full h-56">
                <Image src={p.img} alt={p.title} fill style={{ objectFit: "cover" }} />
              </div>
              <div className="p-6">
                <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">{p.categoria}</span>
                <h3 className="text-xl font-bold text-gray-900 mt-2 mb-2">{p.title}</h3>
                <p className="text-sm text-gray-500">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-purple-600 px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Crea tu sitio web hoy</h2>
        <p className="text-purple-200 mb-8 max-w-xl mx-auto">Activa tu prueba gratuita y genera tu sitio web con IA en minutos.</p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/planes" className="bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors">
            Comenzar gratis
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