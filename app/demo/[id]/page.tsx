import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import AgenteChat from "@/components/AgenteChat";
import EstrellasProducto from "./EstrellasProducto";
import LandingCarrusel from "./LandingCarrusel";
import CookieBanner from "./CookieBanner";
import VisitaTracker from "@/components/VisitaTracker";

const CATEGORY_KEYWORDS: Record<string, string> = {
  "Landing Page": "business marketing professional",
  "Sitio Corporativo": "corporate office business team",
  "Tienda Online": "ecommerce shopping store products",
  "Agencia": "creative agency team design studio",
  "Restaurante": "restaurant food cuisine dining table",
  "Hotel": "hotel luxury accommodation resort lobby",
  "Inmobiliaria": "real estate house luxury property",
  "Consultorio": "medical clinic doctor health care",
  "Portafolio": "portfolio design creative art studio",
  "Salon de Belleza": "beauty salon hair makeup glamour",
  "Barberia": "barbershop barber haircut beard style",
  "Spa": "spa wellness relaxation massage zen",
  "Abogados": "law office legal justice attorney",
  "Gimnasio": "gym fitness workout bodybuilding",
  "Tecnologia": "technology software developer startup",
  "Turismo": "travel tourism hotel vacation landscape",
  "Veterinaria": "veterinary pet animal clinic care",
  "Eventos": "events wedding party celebration",
  "Consultoria": "consulting business strategy professional",
  "Otro": "business professional modern office",
};

async function getPexelsImages(websiteType: string, prompt: string): Promise<string[]> {
  const base = CATEGORY_KEYWORDS[websiteType];
  const query = base ?? prompt?.split(" ").slice(0, 3).join(" ");
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=6&orientation=landscape`,
      { headers: { Authorization: process.env.PEXELS_API_KEY! }, next: { revalidate: 3600 } }
    );
    const data = await res.json();
    return data.photos?.map((p: any) => p.src.large) ?? [];
  } catch {
    return [
      "https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg",
      "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg",
      "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg",
    ];
  }
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: site } = await supabase.from("generated_websites").select("project_name, generated_content, logo_url").eq("id", id).single();
  const nombre = site?.generated_content?.footer?.nombre_empresa ?? site?.project_name ?? "DMS Digital Media Studio";
  const logo = site?.logo_url ?? null;
  const faviconUrl = logo ? `/api/favicon?id=${id}` : undefined;
  return {
    title: nombre,
    icons: faviconUrl ? { icon: faviconUrl, apple: faviconUrl } : undefined,
  };
}

export default async function DemoPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: site } = await supabase.from("generated_websites").select("*").eq("id", id).single();
  if (!site) notFound();

  if (site.status === "published" && site.published_version === "profesional") {
    redirect(`/demo/${id}/profesional`);
  }

  const { data: agente } = await supabase.from("ai_agents").select("*").eq("user_id", site.user_id).maybeSingle();

  // Verificar trial
  const { data: sub } = await supabase.from("subscriptions").select("*").eq("user_id", site.user_id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const tieneplanPagado = sub?.status === "active";
  const trialVencido = sub?.status === "trial" && sub?.trial_end && new Date(sub.trial_end) < new Date();
  const sinPlan = !sub;

  const trialActivo = sub?.status === "trial" && sub?.trial_end && new Date(sub.trial_end) >= new Date();

  const { data: ownerProfile } = await supabase.from("profiles").select("role").eq("id", site.user_id).single();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const { data: currentProfile } = await supabase.from("profiles").select("role").eq("id", currentUser?.id ?? "").maybeSingle();
  const isAdmin = ownerProfile?.role === "admin" || currentProfile?.role === "admin";

  if (!isAdmin && (trialVencido || sinPlan)) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "3rem 2rem", textAlign: "center", maxWidth: 480, boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111", marginBottom: "0.75rem" }}>Prueba gratuita finalizada</h1>
          <p style={{ color: "#888", fontSize: 14, lineHeight: 1.7, marginBottom: "2rem" }}>Tu sitio sigue guardado. Activa un plan para publicarlo y que tus clientes puedan verlo.</p>
          <a href="https://dms-digital-media-studio.vercel.app/dashboard/client/suscripcion" style={{ display: "inline-block", background: "#7c3aed", color: "#fff", padding: "12px 28px", borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Activar mi plan</a>
        </div>
      </div>
    );
  }

  const headersList = await headers();
  const hostname = headersList.get("host") ?? "";
  const isCustomDomain = hostname !== "dms-digital-media-studio.vercel.app" && !hostname.includes("vercel.app") && !hostname.includes("localhost");
  const ci = site.custom_images ?? {};
  const imagenes = await getPexelsImages(site.website_type, site.prompt ?? "");
  const img0 = ci.hero || imagenes[0] || "";
  const img1 = ci.servicios || imagenes[2] || "";
  const img2 = ci.testimonios || imagenes[4] || "";

  const c = site.generated_content;

  let mapCoords: { lat: number; lon: number } | null = null;
  if (c?.contacto?.mostrar_mapa && c?.contacto?.direccion) {
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(c.contacto.direccion)}`, { headers: { "User-Agent": "DMS-Digital-Media-Studio/1.0" } });
      const geoData = await geoRes.json();
      if (geoData?.[0]) {
        mapCoords = { lat: parseFloat(geoData[0].lat), lon: parseFloat(geoData[0].lon) };
      }
    } catch {}
  }

  const { data: todasResenas } = await supabase.from("resenas").select("producto_index, calificacion").eq("site_id", id);
  const promediosPorProducto = (todasResenas ?? []).reduce((acc: any, r: any) => {
    if (!acc[r.producto_index]) acc[r.producto_index] = { suma: 0, total: 0 };
    acc[r.producto_index].suma += r.calificacion;
    acc[r.producto_index].total += 1;
    return acc;
  }, {});
  const pr = site.primary_color ?? "#7c3aed";
  const sc = site.secondary_color ?? "#000000";
  const logo = site.logo_url ?? "";
  const font = site.font_family ?? "'Segoe UI', sans-serif";
  const fontSize = site.font_size ?? "16px";
  const navHidden: string[] = site.navbar_hidden ?? c?.footer?.navbar_hidden ?? [];

  const css = `
    @keyframes wa-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    .wa-bounce-anim{animation:wa-bounce 1.4s ease-in-out infinite}
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:${font};font-size:${fontSize};color:#111;scroll-behavior:smooth}
    nav{display:flex;align-items:center;justify-content:space-between;padding:1rem 2rem;background:#fff;border-bottom:1px solid #f0f0f0;position:sticky;top:0;z-index:100;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
    .nav-links{display:flex;gap:2rem;list-style:none}
    .mobile-toggle{display:none}
    .hamburger-label{display:none;cursor:pointer;padding:6px}
    .nav-links a{text-decoration:none;color:#555;font-size:0.875rem;font-weight:500;transition:color 0.2s}
    .nav-links a:hover{color:${pr}}
    .nav-item-parent{position:relative}
    .nav-submenu{display:none;position:absolute;top:100%;left:0;background:#fff;min-width:180px;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.12);padding:0.5rem 0;list-style:none;z-index:200}
    .nav-item-parent:hover .nav-submenu{display:block}
    .nav-submenu li{width:100%}
    .nav-submenu a{display:block;padding:0.5rem 1rem;white-space:nowrap}
    .nav-submenu a:hover{background:#f8f8f8}
    .hero{position:relative;min-height:92vh;display:flex;align-items:center;overflow:hidden}
    .hero-overlay{position:absolute;inset:0;background:transparent}
    .hero-body{position:relative;z-index:1;max-width:700px;margin:0 auto;padding:4rem 2rem;text-align:center;color:#fff}
    .btn-w{background:#fff;color:${pr};padding:.875rem 2rem;border-radius:10px;text-decoration:none;font-weight:700;font-size:.95rem}
    .btn-o{background:transparent;color:#fff;padding:.875rem 2rem;border-radius:10px;text-decoration:none;font-weight:700;font-size:.95rem;border:2px solid rgba(255,255,255,.7)}
    section{padding:5rem 2rem}
    .wrap{max-width:1100px;margin:0 auto}
    .label{font-size:.7rem;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${pr};margin-bottom:.75rem;text-align:center}
    h2.st{font-size:clamp(1.5rem,3vw,2.25rem);font-weight:800;text-align:center;margin-bottom:3rem;color:#111}
    .sec-img{width:100%;height:380px;object-fit:cover;border-radius:20px;margin-bottom:3rem;box-shadow:0 8px 32px rgba(0,0,0,0.12)}
    .g3{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem}
    .g2{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1.5rem}
    .card{background:#fff;border-radius:16px;padding:2rem;box-shadow:0 2px 12px rgba(0,0,0,.06);border:1px solid #f0f0f0}
    .card h3{font-size:1rem;font-weight:700;margin-bottom:.5rem;color:#111}
    .card p{font-size:.875rem;color:#666;line-height:1.6}
    .bg-l{background:#f8f9fa}
    .ben{display:flex;gap:1rem;align-items:flex-start;padding:1.5rem;background:#fff;border-radius:14px;border:1px solid #f0f0f0}
    .chk{width:24px;height:24px;border-radius:50%;background:${pr};display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px}
    .test{background:#fff;border-radius:16px;padding:2rem;box-shadow:0 2px 12px rgba(0,0,0,.06)}
    .test p{font-size:.9rem;color:#555;font-style:italic;line-height:1.7;margin-bottom:1.25rem}
    .av{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:1rem;background:${pr}}
    .faq{border:1px solid #e5e7eb;border-radius:14px;padding:1.5rem;margin-bottom:.75rem}
    .faq h4{font-weight:700;color:#111;margin-bottom:.5rem;font-size:.95rem}
    .faq p{font-size:.875rem;color:#666;line-height:1.6}
    .contact-s{color:#fff;text-align:center}
    .wa{background:#25D366;color:#fff;padding:1rem 2.5rem;border-radius:12px;text-decoration:none;font-weight:700;display:inline-block;margin-top:1.5rem;font-size:1rem}
    footer{background:${sc||"#111"};color:#fff;padding:4rem 2rem 2rem;text-align:center}
    .social-icons{display:flex;justify-content:center;gap:1rem;margin:1.5rem 0}
    .social-icon{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;text-decoration:none;border:1px solid rgba(255,255,255,0.15)}
    .footer-bottom{border-top:1px solid rgba(255,255,255,0.1);margin-top:2rem;padding-top:1.5rem}
    @media(max-width:768px){nav{padding:1rem}.hamburger-label{display:block}.nav-links{display:none;position:absolute;top:100%;left:0;right:0;background:#fff;flex-direction:column;align-items:flex-start;padding:1rem 2rem;gap:1rem;box-shadow:0 8px 24px rgba(0,0,0,0.12)}.mobile-toggle:checked ~ .nav-links{display:flex}.hamburger-label{order:-2}.mobile-brand{order:-1;flex:1;justify-content:center}.nav-submenu{position:static;box-shadow:none;padding-left:1rem}section{padding:3rem 1rem}.sec-img{height:220px}.hero{min-height:70vh}}
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {trialActivo && (
        <div style={{ background: "#7c3aed", color: "#fff", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, position: "sticky", top: 0, zIndex: 999 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Vista previa — Activa un plan para publicar tu sitio con tu dominio personalizado</span>
          <a href="https://dms-digital-media-studio.vercel.app/dashboard/client/suscripcion" style={{ background: "#fff", color: "#7c3aed", padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>Activar Plan</a>
        </div>
      )}
            {c?.barraAnuncio?.activo && c?.barraAnuncio?.items?.length > 0 && c?.productos?.length > 0 && (
        <div style={{ background: c.barraAnuncio.colorFondo || "#111111", overflow: "hidden", padding: "8px 0" }}>
          <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
          <div style={{ display: "flex", width: "max-content", animation: "marquee 20s linear infinite" }}>
            {[...c.barraAnuncio.items, ...c.barraAnuncio.items].map((txt: string, i: number) => (
              <span key={i} style={{ color: c.barraAnuncio.colorTexto || "#f5c542", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap", padding: "0 20px", display: "flex", alignItems: "center", gap: "20px" }}>
                {txt}
                <span style={{ opacity: 0.6 }}>•</span>
              </span>
            ))}
          </div>
        </div>
      )}
      <nav>
        <div className="mobile-brand" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {logo && <img src={logo} alt="logo" style={{ height: 50, objectFit: "contain" }} />}
          <span style={{ fontWeight: 700, fontSize: "1.1rem", color: pr }}>{c?.footer?.nombre_empresa ?? site.project_name}</span>
        </div>
        <input type="checkbox" id="mobile-toggle-check" className="mobile-toggle" />
        <label htmlFor="mobile-toggle-check" className="hamburger-label">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="3.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </label>
        <ul className="nav-links">
          {c?.productos?.length > 0 && !navHidden.includes("productos") && (() => { const hijos = (c?.paginas_extra || []).filter((h: any) => h.padre === "productos"); return hijos.length > 0 ? (<li className="nav-item-parent"><a href="#productos">Productos ▾</a><ul className="nav-submenu">{hijos.map((h: any, hi: number) => (<li key={hi}><a href={`/demo/${id}/${h.slug}`}>{h.titulo}</a></li>))}</ul></li>) : (<li><a href="#productos">Productos</a></li>); })()}
          {c?.nosotros && !navHidden.includes("nosotros") && (() => { const hijos = (c?.paginas_extra || []).filter((h: any) => h.padre === "nosotros"); return hijos.length > 0 ? (<li className="nav-item-parent"><a href="#nosotros">Nosotros ▾</a><ul className="nav-submenu">{hijos.map((h: any, hi: number) => (<li key={hi}><a href={`/demo/${id}/${h.slug}`}>{h.titulo}</a></li>))}</ul></li>) : (<li><a href="#nosotros">Nosotros</a></li>); })()}
          {c?.servicios && !navHidden.includes("servicios") && (() => { const hijos = (c?.paginas_extra || []).filter((h: any) => h.padre === "servicios"); return hijos.length > 0 ? (<li className="nav-item-parent"><a href="#servicios">Servicios ▾</a><ul className="nav-submenu">{hijos.map((h: any, hi: number) => (<li key={hi}><a href={`/demo/${id}/${h.slug}`}>{h.titulo}</a></li>))}</ul></li>) : (<li><a href="#servicios">Servicios</a></li>); })()}
          {c?.testimonios && !navHidden.includes("testimonios") && (() => { const hijos = (c?.paginas_extra || []).filter((h: any) => h.padre === "testimonios"); return hijos.length > 0 ? (<li className="nav-item-parent"><a href="#testimonios">Testimonios ▾</a><ul className="nav-submenu">{hijos.map((h: any, hi: number) => (<li key={hi}><a href={`/demo/${id}/${h.slug}`}>{h.titulo}</a></li>))}</ul></li>) : (<li><a href="#testimonios">Testimonios</a></li>); })()}
          {c?.faq && !navHidden.includes("faq") && (() => { const hijos = (c?.paginas_extra || []).filter((h: any) => h.padre === "faq"); return hijos.length > 0 ? (<li className="nav-item-parent"><a href="#faq">FAQ ▾</a><ul className="nav-submenu">{hijos.map((h: any, hi: number) => (<li key={hi}><a href={`/demo/${id}/${h.slug}`}>{h.titulo}</a></li>))}</ul></li>) : (<li><a href="#faq">FAQ</a></li>); })()}
          {c?.contacto && !navHidden.includes("contacto") && (() => { const hijos = (c?.paginas_extra || []).filter((h: any) => h.padre === "contacto"); return hijos.length > 0 ? (<li className="nav-item-parent"><a href="#contacto">Contacto ▾</a><ul className="nav-submenu">{hijos.map((h: any, hi: number) => (<li key={hi}><a href={`/demo/${id}/${h.slug}`}>{h.titulo}</a></li>))}</ul></li>) : (<li><a href="#contacto">Contacto</a></li>); })()}
          {(c?.paginas_extra || []).filter((p: any) => !p.padre).map((p: any, pi: number) => {
            const hijos = (c?.paginas_extra || []).filter((h: any) => h.padre === p.slug);
            return hijos.length > 0 ? (
              <li key={pi} className="nav-item-parent">
                <a href={`/demo/${id}/${p.slug}`}>{p.titulo} ▾</a>
                <ul className="nav-submenu">
                  {hijos.map((h: any, hi: number) => (<li key={hi}><a href={`/demo/${id}/${h.slug}`}>{h.titulo}</a></li>))}
                </ul>
              </li>
            ) : (
              <li key={pi}><a href={`/demo/${id}/${p.slug}`}>{p.titulo}</a></li>
            );
          })}
        </ul>
        {!c?.productos?.length && <a href="#contacto" style={{ background: pr, color: "#fff", padding: "0.5rem 1.25rem", borderRadius: 8, textDecoration: "none", fontSize: "0.875rem", fontWeight: 700 }}>{c?.hero?.cta_principal ?? "Contactar"}</a>}


        {c?.productos?.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: 8 }}>
            <a href="#productos" style={{ display: "flex", color: "#111" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </a>
            <a href="#contacto" style={{ display: "flex", color: "#111" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </a>
            <a href="#productos" style={{ display: "flex", color: "#111" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            </a>
          </div>
        )}
      </nav>

      <div className="hero">
        {c?.carrusel?.activo && ci.carrusel_imgs?.length > 0 ? (<LandingCarrusel imagenes={ci.carrusel_imgs} />) : (img0 && <img src={img0} alt="hero" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />)}
        <div className="hero-overlay" />
        <div className="hero-body">
          {logo && <img src={logo} alt="logo" style={{ height: 80, objectFit: "contain", margin: "0 auto 1.5rem", display: "block", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }} />}
          <h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: "1.25rem", textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>{c?.hero?.titulo}</h1>
          <p style={{ fontSize: "1.1rem", opacity: 0.95, marginBottom: "2rem", lineHeight: 1.6 }}>{c?.hero?.subtitulo}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={c?.hero?.cta_principal_url ?? "#contacto"} className="btn-w">{c?.hero?.cta_principal}</a>
            <a href={c?.hero?.cta_secundario_url ?? "#servicios"} className="btn-o">{c?.hero?.cta_secundario}</a>
          </div>
        </div>
      </div>

      {c?.nosotros && !navHidden.includes("nosotros") && (
        <section id="nosotros">
          <div className="wrap">
            <p className="label">Nosotros</p>
            <h2 className="st">{c.nosotros.titulo}</h2>
            {ci.nosotros && <img src={ci.nosotros} alt="nosotros" className="sec-img" />}
            <p style={{ textAlign: "center", color: "#555", lineHeight: 1.8, maxWidth: 700, margin: "0 auto 1.5rem" }}>{c.nosotros.descripcion}</p>
            <div className="g2" style={{ marginTop: "2rem" }}>
              <div style={{ background: `${pr}10`, borderRadius: 14, padding: "1.5rem", borderLeft: `4px solid ${pr}` }}>
                <h4 style={{ fontWeight: 700, color: pr, marginBottom: 8 }}>Mision</h4>
                <p style={{ fontSize: ".875rem", color: "#555" }}>{c.nosotros.mision}</p>
              </div>
              <div style={{ background: `${pr}10`, borderRadius: 14, padding: "1.5rem", borderLeft: `4px solid ${pr}` }}>
                <h4 style={{ fontWeight: 700, color: pr, marginBottom: 8 }}>Vision</h4>
                <p style={{ fontSize: ".875rem", color: "#555" }}>{c.nosotros.vision}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {c?.servicios && !navHidden.includes("servicios") && (
        <section id="servicios" className="bg-l">
          <div className="wrap">
            <p className="label">Servicios</p>
            <h2 className="st">Lo que ofrecemos</h2>
            {img1 && <img src={img1} alt="servicios" className="sec-img" />}
            <div className="g3">
              {c.servicios.map((s: any, i: number) => (
                <div key={i} className="card">
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: `${pr}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={pr} strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                  </div>
                  <h3>{s.titulo}</h3>
                  <p>{s.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

            {c?.productos?.length > 0 && !navHidden.includes("productos") && (
        <section id="productos" style={{ padding: "5rem 2rem", background: "#fff" }}>
          <div className="wrap">
            <p className="label">Productos</p>
            <h2 className="st">{c.productos[0]?.categoria ? "Nuestros Productos" : "Catalogo"}</h2>
            {Array.from(new Set((c.productos as any[]).map((p: any) => p.categoria).filter(Boolean))).map((cat: any) => (
              <div key={cat} style={{ marginBottom: "3rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111", marginBottom: "1.5rem", paddingBottom: "0.5rem", borderBottom: "2px solid #f0f0f0" }}>{cat}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.5rem" }}>
                  {(c.productos as any[]).filter((p: any) => p.categoria === cat).map((p: any) => (
                    <a key={(c.productos as any[]).indexOf(p)} href={isCustomDomain ? `/producto/${(c.productos as any[]).indexOf(p)}` : `/demo/${id}/producto/${(c.productos as any[]).indexOf(p)}`} style={{ textDecoration: "none", color: "inherit", display: "block", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0", transition: "transform 0.2s" }}>
                      {p.imagenes?.length > 0 ? (
                        <div style={{ position: "relative", overflow: "hidden" }}>
                          <div style={{ display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none", width: "100%" }}>
                            {p.imagenes.map((img: string, j: number) => (
                              <img key={j} src={img} alt={p.nombre} style={{ minWidth: "100%", height: 240, objectFit: "contain", background: "#fff", scrollSnapAlign: "start" }} />
                            ))}
                          </div>
                          {p.imagenes.length > 1 && (
                            <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 4 }}>
                              {p.imagenes.map((_: any, j: number) => (
                                <div key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: j === 0 ? "#fff" : "rgba(255,255,255,0.5)" }} />
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ height: 240, background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        </div>
                      )}
                      <div style={{ padding: "1.25rem" }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#111", marginBottom: "0.5rem" }}>{p.nombre}</h3>
                        <EstrellasProducto siteId={id} productoIndex={(c.productos as any[]).indexOf(p)} />
                        
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.75rem", flexWrap: "wrap" }}>
                        <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111" }}>{p.precio}</p>
                        {p.precio_anterior && <p style={{ fontSize: "1rem", color: "#aaa", textDecoration: "line-through" }}>{p.precio_anterior}</p>}
                      </div>
                        
                        
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
            {(c.productos as any[]).filter((p: any) => !p.categoria).length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.5rem" }}>
                {(c.productos as any[]).filter((p: any) => !p.categoria).map((p: any, i: number) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}>
                    {p.imagenes?.length > 0 ? (
                      <div style={{ display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none", width: "100%" }}>
                        {p.imagenes.map((img: string, j: number) => (
                          <img key={j} src={img} alt={p.nombre} style={{ minWidth: "100%", height: 240, objectFit: "contain", background: "#fff", scrollSnapAlign: "start" }} />
                        ))}
                      </div>
                    ) : (
                      <div style={{ height: 240, background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                      </div>
                    )}
                    <div style={{ padding: "1.25rem" }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#111", marginBottom: "0.5rem" }}>{p.nombre}</h3>
                        <EstrellasProducto siteId={id} productoIndex={(c.productos as any[]).indexOf(p)} />
                      
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.75rem", flexWrap: "wrap" }}>
                        <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111" }}>{p.precio}</p>
                        {p.precio_anterior && <p style={{ fontSize: "1rem", color: "#aaa", textDecoration: "line-through" }}>{p.precio_anterior}</p>}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {p.tallas && p.tallas.split(",").map((t: string, j: number) => (
                          <span key={j} style={{ padding: "3px 10px", borderRadius: 999, border: "1px solid #e5e7eb", fontSize: "0.75rem", fontWeight: 600, color: "#555" }}>{t.trim()}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {c?.estadisticas?.items?.length > 0 && (
        <section style={{ background: "#f8f9fa" }}>
          <div className="wrap">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1.5rem", textAlign: "center" }}>
              {c.estadisticas.items.map((e: any, i: number) => (
                <div key={i}>
                  <div style={{ fontSize: "2.5rem", fontWeight: 800, color: pr }}>{e.numero}</div>
                  <div style={{ fontSize: ".95rem", color: "#666", marginTop: 4 }}>{e.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {c?.beneficios && (
        <section>
          <div className="wrap">
            <p className="label">Por que elegirnos</p>
            <h2 className="st">Nuestras ventajas</h2>
            <div className="g2">
              {c.beneficios.map((b: any, i: number) => (
                <div key={i} className="ben">
                  <div className="chk">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, marginBottom: ".25rem", fontSize: ".95rem" }}>{b.titulo}</h3>
                    <p style={{ fontSize: ".875rem", color: "#666" }}>{b.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {c?.galeria && !navHidden.includes("galeria") && (
        <section id="galeria" className="bg-l">
          <div className="wrap">
            <p className="label">Galeria</p>
            <h2 className="st">{c.galeria.titulo}</h2>
            {ci.galeria_imgs?.length > 0 ? (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"1.5rem",marginTop:"1rem"}}>
                {ci.galeria_imgs.map((url: string, i: number) => (
                  <img key={i} src={url} alt={`galeria-${i}`} style={{width:"100%",height:220,objectFit:"contain",background:"#f8f9fa",borderRadius:16,boxShadow:"0 4px 16px rgba(0,0,0,0.1)"}} />
                ))}
              </div>
            ) : ci.galeria ? (
              <img src={ci.galeria} alt="galeria" className="sec-img" />
            ) : null}
          </div>
        </section>
      )}

      {c?.testimonios && !navHidden.includes("testimonios") && (
        <section id="testimonios" className="bg-l">
          <div className="wrap">
            <p className="label">Testimonios</p>
            <h2 className="st">Lo que dicen nuestros clientes</h2>
            {img2 && <img src={img2} alt="testimonios" className="sec-img" />}
            <div className="g2">
              {c.testimonios.map((t: any, i: number) => (
                <div key={i} className="test">
                  <p>{t.texto}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
                    <div className="av">{t.nombre?.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: ".9rem" }}>{t.nombre}</div>
                      <div style={{ fontSize: ".8rem", color: "#999" }}>{t.cargo}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {c?.faq && !navHidden.includes("faq") && (
        <section id="faq">
          <div className="wrap" style={{ maxWidth: 700 }}>
            <p className="label">FAQ</p>
            <h2 className="st">Preguntas frecuentes</h2>
            {c.faq.map((f: any, i: number) => (
              <div key={i} className="faq">
                <h4>{f.pregunta}</h4>
                <p>{f.respuesta}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {c?.contacto && !navHidden.includes("contacto") && (
        <section id="contacto" style={{ padding: "5rem 2rem", background: `linear-gradient(135deg,${pr},${sc||"#1a1a1a"})` }}>
          <div className="wrap contact-s">
            <p className="label" style={{ color: "rgba(255,255,255,0.7)" }}>Escribenos</p>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem" }}>{c.contacto.titulo}</h2>
            <p style={{ opacity: 0.85, fontSize: "1.1rem" }}>{c.contacto.descripcion}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center", marginTop: "2rem" }}>
              {c.contacto.telefono && <span style={{ background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)", padding: ".75rem 1.5rem", borderRadius: 999, fontSize: ".9rem" }}>{c.contacto.telefono}</span>}
              {c.contacto.email && <span style={{ background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)", padding: ".75rem 1.5rem", borderRadius: 999, fontSize: ".9rem" }}>{c.contacto.email}</span>}
              {c.contacto.direccion && <span style={{ background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)", padding: ".75rem 1.5rem", borderRadius: 999, fontSize: ".9rem" }}>{c.contacto.direccion}</span>}
            {mapCoords && (
              <div style={{ marginTop: 24, width: "100%", maxWidth: 400, aspectRatio: "1 / 1", margin: "24px auto 0", borderRadius: 12, overflow: "hidden", border: "2px solid rgba(255,255,255,0.3)" }}>
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCoords.lon - 0.01}%2C${mapCoords.lat - 0.01}%2C${mapCoords.lon + 0.01}%2C${mapCoords.lat + 0.01}&layer=mapnik&marker=${mapCoords.lat}%2C${mapCoords.lon}`}
                  style={{ width: "100%", height: "100%", border: 0 }}
                  loading="lazy"
                  title="Ubicacion"
                />
              </div>
            )}
            </div>
          </div>
        </section>
      )}


      <footer>
        <div className="wrap">
          {logo && <img src={logo} alt="logo" style={{ height: 60, objectFit: "contain", margin: "0 auto 1rem", display: "block" }} />}
          <h3 style={{ color: pr, fontWeight: 700, fontSize: "1.2rem", marginBottom: ".5rem" }}>{c?.footer?.nombre_empresa}</h3>
          <p style={{ fontSize: ".85rem", color: "rgba(255,255,255,.5)" }}>{c?.footer?.descripcion}</p>
          <div className="social-icons">
            {c?.contacto?.facebook && <a href={c.contacto.facebook.startsWith("http") ? c.contacto.facebook : `https://facebook.com/${c.contacto.facebook}`} target="_blank" rel="noopener noreferrer" className="social-icon" title="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>}
            {c?.contacto?.instagram && <a href={c.contacto.instagram.startsWith("http") ? c.contacto.instagram : `https://instagram.com/${c.contacto.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer" className="social-icon" title="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="#fff" stroke="none"/></svg></a>}
            {c?.contacto?.tiktok && <a href={c.contacto.tiktok.startsWith("http") ? c.contacto.tiktok : `https://tiktok.com/${c.contacto.tiktok.startsWith("@") ? c.contacto.tiktok : "@"+c.contacto.tiktok}`} target="_blank" rel="noopener noreferrer" className="social-icon" title="TikTok"><svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg></a>}
            {c?.contacto?.youtube && <a href={c.contacto.youtube.startsWith("http") ? c.contacto.youtube : `https://youtube.com/${c.contacto.youtube}`} target="_blank" rel="noopener noreferrer" className="social-icon" title="YouTube"><svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0f172a"/></svg></a>}
            {c?.contacto?.whatsapp && <a href={`https://wa.me/${c.contacto.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" className="social-icon" title="WhatsApp"><svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></a>}
          </div>
          {c?.footer?.btn_label && c?.footer?.btn_url && (
            <a href={c.footer.btn_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "1rem", background: pr, color: "#fff", padding: "10px 28px", borderRadius: 10, fontWeight: 700, fontSize: "0.95rem", textDecoration: "none" }}>{c.footer.btn_label}</a>
          )}
          <div className="footer-bottom">
            <p style={{ fontSize: ".85rem", color: "rgba(255,255,255,.5)" }}>{c?.footer?.copyright}</p>
            <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
              <a href="/politica-de-privacidad" target="_blank" style={{ fontSize: ".8rem", color: "rgba(255,255,255,.5)", textDecoration: "none" }}>Politica de privacidad</a>
              <a href="/terminos-y-condiciones" target="_blank" style={{ fontSize: ".8rem", color: "rgba(255,255,255,.5)", textDecoration: "none" }}>Terminos y condiciones</a>
              <a href="/tratamiento-de-datos" target="_blank" style={{ fontSize: ".8rem", color: "rgba(255,255,255,.5)", textDecoration: "none" }}>Tratamiento de datos</a>
            </div>
          </div>
        </div>
      </footer>
      <VisitaTracker siteId={id} pagina="home" />
      {(c?.cookies?.activo ?? true) && <CookieBanner texto={c?.cookies?.texto ?? "Este sitio web utiliza cookies propias y de terceros para mejorar tu experiencia de navegacion y analizar el trafico. Al continuar navegando, aceptas su uso."} linkPolitica={c?.cookies?.link_politica} primaryColor={pr} />}
      {c?.contacto?.whatsapp_flotante && c?.contacto?.whatsapp && (
        <a href={`https://wa.me/${c.contacto.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" className={c?.contacto?.whatsapp_rebote ? "wa-bounce-anim" : ""} style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, background: "#25D366", width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
        </a>
      )}
      {agente && <AgenteChat agente={agente} color={site.primary_color ?? "#7c3aed"} />}
    </>
  );
}


