"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

const CAROUSEL_IMAGES = [
  "/carousel-1.png",
  "/carousel-2.png",
  "/carousel-3.png",
  "/carousel-4.png",
];

const SERVICIOS = [
  {
    slug: "diseno-web",
    title: "Diseno Web",
    desc: "Landing pages, sitios corporativos y tiendas online modernas.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
      </svg>
    ),
  },
  {
    slug: "publicidad-digital",
    title: "Publicidad Digital",
    desc: "Facebook Ads, Instagram Ads y Google Ads que convierten.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"/>
      </svg>
    ),
  },
  {
    slug: "automatizacion-ia",
    title: "Automatizacion IA",
    desc: "Chatbots, flujos automaticos y asistentes inteligentes.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 11V7"/><circle cx="12" cy="5" r="2"/><path d="M8 11V9a4 4 0 0 1 8 0v2"/>
      </svg>
    ),
  },
  {
    slug: "redes-sociales",
    title: "Redes Sociales",
    desc: "Gestion de contenido y crecimiento organico real.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
      </svg>
    ),
  },
];

const REDES = [
  {
    href: "https://www.facebook.com/profile.php?id=61584313420467&locale=es_LA",
    label: "Facebook",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    href: "https://www.instagram.com/dmsdigital40/",
    label: "Instagram",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  },
  {
    href: "https://www.tiktok.com/@dmsdigitalmediastudio",
    label: "TikTok",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
      </svg>
    ),
  },
];

const SITIOS_IA = [
  {
    nombre: "Aura Spa & Wellness",
    categoria: "Spa / Bienestar",
    color: "#b8860b",
    bg: "linear-gradient(135deg, #f5f0e0 0%, #e8d5a3 100%)",
    icono: "S",
  },
  {
    nombre: "Restaurante La Brasa",
    categoria: "Gastronomia",
    color: "#c0392b",
    bg: "linear-gradient(135deg, #fdf0ed 0%, #f5c6bb 100%)",
    icono: "R",
  },
  {
    nombre: "Clinica Estetica Glow",
    categoria: "Salud / Estetica",
    color: "#8e44ad",
    bg: "linear-gradient(135deg, #f8f0ff 0%, #e8d0f5 100%)",
    icono: "C",
  },
  {
    nombre: "Inmobiliaria El Dorado",
    categoria: "Inmobiliaria",
    color: "#1a6b3a",
    bg: "linear-gradient(135deg, #edfaf3 0%, #b8e8cc 100%)",
    icono: "I",
  },
  {
    nombre: "Boutique Moda Latina",
    categoria: "Moda / Retail",
    color: "#c0392b",
    bg: "linear-gradient(135deg, #fff0f5 0%, #f5c0d0 100%)",
    icono: "B",
  },
  {
    nombre: "Firma Juridica Mejia",
    categoria: "Legal / Abogados",
    color: "#1a3a6b",
    bg: "linear-gradient(135deg, #f0f4ff 0%, #c0ccf0 100%)",
    icono: "F",
  },
];

const STAT_ICONS = [
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
];

function useCountUp(target: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", mensaje: "" });

  const clientes = useCountUp(1000, 2000, statsVisible);
  const paises = useCountUp(3, 1500, statsVisible);
  const anos = useCountUp(2, 1200, statsVisible);
  const sitios = useCountUp(2000, 2200, statsVisible);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    const el = document.getElementById("estadisticas");
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  async function enviarFormulario(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("leads").insert([{
      nombre: form.nombre,
      email: form.email,
      telefono: form.telefono,
      mensaje: form.mensaje,
    }]);
    setLoading(false);
    if (error) { alert("Error al enviar el formulario"); return; }
    alert("Solicitud enviada correctamente");
    setForm({ nombre: "", email: "", telefono: "", mensaje: "" });
  }

  return (
    <main className="min-h-screen bg-white text-black">

      {/* NAVBAR */}
      <header className="flex items-center justify-between px-4 md:px-10 py-4 border-b sticky top-0 bg-white z-50 shadow-sm">
        <Link href="/">
          <Image src="/logo-dms.png" alt="DMS Digital Media Studio" width={140} height={45} priority />
        </Link>
        <nav className="hidden md:flex gap-8">
          {[
            { href: "/", label: "Inicio" },
            { href: "/servicios", label: "Servicios" },
            { href: "/planes", label: "Planes" },
            { href: "/portafolio", label: "Portafolio" },
            { href: "#contacto", label: "Contacto" },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{ fontSize: 17, fontWeight: 800, color: "#222", textDecoration: "none", letterSpacing: "0.01em" }} className="hover:text-purple-600 transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="hidden md:block" style={{ fontSize: 17, fontWeight: 800, color: "#444", textDecoration: "none" }}>
            Ingresar
          </Link>
          <Link href="/auth/register" style={{ background: "#7c3aed", color: "#fff", padding: "9px 22px", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }} className="hidden md:block hover:opacity-90 transition-opacity">
            Registrarse
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              }
            </svg>
          </button>
        </div>
      </header>

      {/* MENU MOVIL */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b px-6 py-5 flex flex-col gap-4 z-40 shadow-md">
          {[
            { href: "/", label: "Inicio" },
            { href: "/servicios", label: "Servicios" },
            { href: "/planes", label: "Planes" },
            { href: "/portafolio", label: "Portafolio" },
            { href: "#contacto", label: "Contacto" },
          ].map(item => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{ fontSize: 16, fontWeight: 700, color: "#222", textDecoration: "none" }} className="hover:text-purple-600">
              {item.label}
            </Link>
          ))}
          <hr style={{ borderColor: "#f0f0f0" }} />
          <Link href="/auth/login" onClick={() => setMenuOpen(false)} style={{ fontSize: 17, fontWeight: 800, color: "#444", textDecoration: "none" }}>Ingresar</Link>
          <Link href="/auth/register" onClick={() => setMenuOpen(false)} style={{ background: "#7c3aed", color: "#fff", padding: "10px 0", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>Registrarse</Link>
        </div>
      )}

      {/* CARRUSEL */}
      <div className="w-full overflow-hidden">
        <img src={CAROUSEL_IMAGES[current]} alt="Banner" style={{ width: "100%", height: "auto", display: "block" }} />
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", padding: "12px", background: "#fff" }}>
          {CAROUSEL_IMAGES.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? "28px" : "8px", height: "8px", borderRadius: "4px", background: i === current ? "#7c3aed" : "rgba(0,0,0,0.2)", border: "none", cursor: "pointer", transition: "all 0.3s" }} />
          ))}
        </div>
      </div>

      {/* HERO */}
      <section id="inicio" className="flex flex-col items-center text-center px-6 py-24">
        <h1 className="text-4xl md:text-6xl font-bold max-w-4xl">
          Impulsamos negocios con
          <span className="text-purple-600"> tecnologia, marketing e inteligencia artificial</span>
        </h1>
        <p className="text-gray-500 mt-6 max-w-2xl">
          Creamos paginas web, automatizaciones, campanas publicitarias y estrategias digitales para aumentar tus ventas.
        </p>
        <div className="flex flex-col md:flex-row gap-4 mt-10">
          <Link href="#contacto" className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            Solicitar asesoria
          </Link>
          <Link href="/servicios" className="border border-gray-300 px-8 py-3 rounded-lg hover:border-purple-600 hover:text-purple-600 transition-colors">
            Ver servicios
          </Link>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="px-6 md:px-10 py-20 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-4">Nuestros Servicios</h2>
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">Soluciones digitales completas para hacer crecer tu negocio.</p>
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {SERVICIOS.map((s) => (
            <div key={s.slug} className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col items-start gap-3">
              <div className="p-3 bg-purple-50 rounded-xl">{s.icon}</div>
              <h3 className="font-semibold text-gray-900">{s.title}</h3>
              <p className="text-sm text-gray-500 flex-1">{s.desc}</p>
              <Link href={`/servicios/${s.slug}`} className="w-full block text-center bg-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors mt-2">
                Ver mas
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* COMO TRABAJAMOS */}
      <section className="px-6 md:px-10 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Como trabajamos</h2>
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">Un proceso simple y transparente para que tu proyecto sea un exito.</p>
        <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {[
            { num: "01", title: "Elige un servicio", desc: "Explora nuestros servicios y encuentra el que necesitas." },
            { num: "02", title: "Selecciona un plan", desc: "Escoge el plan que mejor se adapta a tu presupuesto." },
            { num: "03", title: "Realiza el pago", desc: "Pago seguro con Mercado Pago. Sin contratos ni sorpresas." },
            { num: "04", title: "Iniciamos tu proyecto", desc: "Nuestro equipo comienza a trabajar en menos de 24 horas." },
          ].map((paso) => (
            <div key={paso.num} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white text-xl font-bold flex items-center justify-center mb-4">{paso.num}</div>
              <h3 className="font-bold text-gray-900 mb-2">{paso.title}</h3>
              <p className="text-sm text-gray-500">{paso.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/planes" className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            Ver planes y precios
          </Link>
        </div>
      </section>

      {/* ESTADISTICAS */}
      <section id="estadisticas" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)", padding: "72px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "clamp(24px,4vw,36px)", textAlign: "center", marginBottom: 8 }}>
            Resultados que hablan por nosotros
          </h2>
          <p style={{ color: "rgba(255,255,255,0.75)", textAlign: "center", fontSize: 16, marginBottom: 56 }}>
            Empresas y emprendedores que ya confian en DMS Digital Media Studio
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32 }}>
            {[
              { value: clientes, suffix: "+", label: "Clientes satisfechos", icon: STAT_ICONS[0] },
              { value: paises, suffix: "+", label: "Paises atendidos", icon: STAT_ICONS[1] },
              { value: anos, suffix: "+", label: "Anos de experiencia", icon: STAT_ICONS[2] },
              { value: sitios, suffix: "+", label: "Sitios web creados", icon: STAT_ICONS[3] },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: "center", background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: "32px 20px", border: "1px solid rgba(255,255,255,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontSize: "clamp(32px,5vw,48px)", fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                  {stat.value.toLocaleString()}{stat.suffix}
                </div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: 600, marginTop: 8 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALERIA SITIOS IA */}
      <section style={{ padding: "80px 24px", background: "#fafafa" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <span style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed", fontSize: 13, fontWeight: 700, padding: "6px 16px", borderRadius: 20, letterSpacing: "0.05em" }}>
              GENERADO CON IA
            </span>
          </div>
          <h2 style={{ fontWeight: 800, fontSize: "clamp(24px,4vw,36px)", textAlign: "center", marginBottom: 12, color: "#111" }}>
            Sitios web que creamos para nuestros clientes
          </h2>
          <p style={{ textAlign: "center", color: "#666", fontSize: 16, marginBottom: 52, maxWidth: 560, margin: "0 auto 52px" }}>
            Cada sitio es disenado y generado con inteligencia artificial en minutos, listo para publicar.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {SITIOS_IA.map((sitio, i) => (
              <div key={i} style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)", background: "#fff", transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 40px rgba(124,58,237,0.15)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.08)"; }}>
                <div style={{ background: sitio.bg, height: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, position: "relative" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 28, background: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", padding: "0 10px", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f57" }}/>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffbd2e" }}/>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#28ca41" }}/>
                    <div style={{ flex: 1, height: 14, background: "rgba(255,255,255,0.7)", borderRadius: 4, marginLeft: 8, display: "flex", alignItems: "center", paddingLeft: 8 }}>
                      <span style={{ fontSize: 9, color: "#999" }}>dms.studio/{sitio.nombre.toLowerCase().replace(/ /g,"-")}</span>
                    </div>
                  </div>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: sitio.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24, fontWeight: 900, boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
                    {sitio.icono}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: sitio.color }}>{sitio.nombre}</div>
                </div>
                <div style={{ padding: "16px 20px 20px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", background: "rgba(124,58,237,0.08)", padding: "3px 10px", borderRadius: 20 }}>{sitio.categoria}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span style={{ fontSize: 12, color: "#555" }}>Generado con IA en minutos</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span style={{ fontSize: 12, color: "#555" }}>Listo para publicar</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <Link href="/portafolio" style={{ background: "#7c3aed", color: "#fff", padding: "13px 36px", borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
              Ver portafolio completo
            </Link>
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section id="planes" className="px-6 md:px-10 py-20 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-4">Planes para tu negocio</h2>
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">Elige el plan ideal y comienza hoy mismo.</p>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { slug: "basico", name: "Basico", price: "$49.000", per: "COP / mes", popular: false, items: ["1 Landing Page activa", "Boton WhatsApp", "Subdominio DMS", "Soporte basico"] },
            { slug: "profesional", name: "Profesional", price: "$99.000", per: "COP / mes", popular: true, items: ["1 Sitio profesional", "SEO basico", "Dominio personalizado", "Leads integrados"] },
            { slug: "empresarial", name: "Empresarial", price: "$199.000", per: "COP / mes", popular: false, items: ["Hasta 3 sitios activos", "CRM integrado", "Automatizacion IA", "Soporte prioritario"] },
          ].map((plan) => (
            <div key={plan.name} className={`rounded-xl p-8 flex flex-col relative bg-white ${plan.popular ? "border-2 border-purple-600 shadow-lg" : "border border-gray-200 hover:shadow-lg transition-shadow"}`}>
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-4 py-1 rounded-full font-semibold">Mas popular</span>
              )}
              <h3 className={`font-bold text-xl ${plan.popular ? "text-purple-600" : "text-gray-800"}`}>{plan.name}</h3>
              <p className="text-4xl font-bold mt-4 text-gray-900">{plan.price}</p>
              <p className="text-gray-400 text-sm mt-1">{plan.per}</p>
              <ul className="mt-6 space-y-2 text-sm text-gray-600 flex-1">
                {plan.items.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href={`/dashboard/client/suscripcion`} className={`mt-8 block text-center py-3 rounded-lg font-semibold transition-colors ${plan.popular ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-gray-900 text-white hover:bg-gray-700"}`}>
                {plan.name === "Empresarial" ? "Contactar" : "Empezar"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="px-6 md:px-10 py-20 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-4">Lo que dicen nuestros clientes</h2>
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">Resultados reales de negocios que confiaron en nosotros.</p>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { nombre: "Carlos Ramirez", cargo: "Dueno de Restaurante, Pereira", texto: "En menos de 30 dias duplicamos las reservas gracias a la pagina web y las campanas de publicidad. El equipo de DMS es increible.", inicial: "C" },
            { nombre: "Maria Gonzalez", cargo: "Directora, Clinica Estetica Cali", texto: "El chatbot de WhatsApp atiende a nuestros clientes las 24 horas. Ya no perdemos consultas por no responder rapido. Totalmente recomendado.", inicial: "M" },
            { nombre: "Andres Torres", cargo: "Gerente, Inmobiliaria El Dorado", texto: "Nuestra presencia en redes sociales crecio un 400% en 3 meses. Los clientes nos buscan solos. DMS transformo nuestro negocio digital.", inicial: "A" },
            { nombre: "Laura Ospina", cargo: "Emprendedora, Boutique Moda", texto: "La tienda online que me crearon vende todos los dias. El proceso fue rapido y profesional. Mi negocio nunca habia vendido tanto.", inicial: "L" },
            { nombre: "Ricardo Mejia", cargo: "Abogado, Firma Mejia y Asociados", texto: "Teniamos miedo de invertir en digital pero los resultados hablan solos. En 60 dias conseguimos 15 clientes nuevos desde Google.", inicial: "R" },
            { nombre: "Sandra Perez", cargo: "Gerente, Spa Zen Bogota", texto: "El sitio web que nos disenaron es exactamente lo que necesitabamos. Elegante, rapido y nuestros clientes lo adoran.", inicial: "S" },
          ].map((t) => (
            <div key={t.nombre} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex mb-4">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">"{t.texto}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">{t.inicial}</div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.nombre}</p>
                  <p className="text-xs text-gray-400">{t.cargo}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 md:px-10 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Preguntas frecuentes</h2>
        <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">Todo lo que necesitas saber antes de empezar.</p>
        <div className="max-w-3xl mx-auto space-y-4">
          {[
            { q: "Cuanto cuesta una suscripcion mensual?", a: "Tenemos tres planes: Basico a $49.000 COP/mes (1 landing page), Profesional a $99.000 COP/mes (sitio completo con dominio y SEO) y Empresarial a $199.000 COP/mes (hasta 3 sitios con CRM y automatizacion IA). Sin contratos de permanencia." },
            { q: "En cuanto tiempo entregan el proyecto?", a: "Una landing page basica en 7 dias habiles. Un sitio corporativo completo entre 15 y 25 dias. Trabajamos con cronogramas claros y sin sorpresas." },
            { q: "Necesito conocimientos tecnicos para administrar mi sitio?", a: "No. Te entregamos tu sitio listo y te damos capacitacion para que puedas actualizar contenidos basicos sin necesidad de saber programacion." },
            { q: "Que incluye el servicio de publicidad digital?", a: "Creacion y gestion de campanas en Facebook, Instagram o Google. Incluye diseno de anuncios, segmentacion, optimizacion semanal y reporte mensual de resultados." },
            { q: "Puedo contratar solo un servicio especifico?", a: "Si. Puedes contratar diseno web, publicidad digital, redes sociales o automatizacion IA de forma independiente o combinarlos segun tus necesidades." },
            { q: "Como funciona el pago?", a: "Aceptamos pagos seguros a traves de Mercado Pago. Los planes mensuales se cobran automaticamente. Para proyectos grandes manejamos cuotas acordadas previamente." },
          ].map((faq, i) => (
            <div key={i} className="border border-gray-200 rounded-2xl p-6 hover:border-purple-300 transition-colors">
              <p className="font-bold text-gray-900 mb-2">{faq.q}</p>
              <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="px-6 md:px-10 py-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Solicita una asesoria</h2>
          <p className="text-center text-gray-500 mb-10">Cuentanos tu proyecto y te respondemos en menos de 24 horas.</p>
          <form onSubmit={enviarFormulario} className="space-y-4">
            <input type="text" placeholder="Nombre" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-purple-600" />
            <input type="email" placeholder="Correo electronico" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-purple-600" />
            <input type="text" placeholder="Telefono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-purple-600" />
            <textarea placeholder="Cuentanos sobre tu proyecto" rows={5} value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-purple-600" />
            <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50">
              {loading ? "Enviando..." : "Enviar solicitud"}
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0f0f0f", color: "#fff" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-14">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <p style={{ fontWeight: 800, fontSize: 18, color: "#fff", marginBottom: 16 }}>DMS Digital Media Studio</p>
              <p style={{ color: "#aaa", fontSize: 13, lineHeight: 1.7 }}>Desarrollo web, marketing digital, automatizacion e inteligencia artificial para empresas y emprendedores.</p>
              <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                {REDES.map(r => (
                  <a key={r.label} href={r.href} target="_blank" rel="noopener noreferrer" title={r.label} style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", transition: "all .2s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#7c3aed")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}>
                    {r.icon}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#fff" }}>Empresa</h3>
              <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[{ href: "/servicios", label: "Servicios" }, { href: "/planes", label: "Planes" }, { href: "/portafolio", label: "Portafolio" }].map(l => (
                  <li key={l.href}><Link href={l.href} style={{ color: "#aaa", fontSize: 13, textDecoration: "none" }} className="hover:text-purple-400 transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#fff" }}>Contacto</h3>
              <ul style={{ display: "flex", flexDirection: "column", gap: 10, color: "#aaa", fontSize: 13 }}>
                <li>dms.digitalstudio@outlook.com</li>
                <li>+57 300 000 0000</li>
                <li>Pereira, Colombia</li>
              </ul>
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#fff" }}>Legal</h3>
              <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[{ href: "#", label: "Politica de Privacidad" }, { href: "#", label: "Terminos y Condiciones" }, { href: "#", label: "Tratamiento de Datos" }].map(l => (
                  <li key={l.label}><Link href={l.href} style={{ color: "#aaa", fontSize: 13, textDecoration: "none" }} className="hover:text-purple-400 transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 48, paddingTop: 24, textAlign: "center", color: "#666", fontSize: 13 }}>
            © 2026 DMS Digital Media Studio. Todos los derechos reservados.
          </div>
        </div>
      </footer>

    </main>
  );
}
