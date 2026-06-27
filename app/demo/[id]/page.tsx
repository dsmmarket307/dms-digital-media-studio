import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import AgenteChat from "@/components/AgenteChat";
import EstrellasProducto from "./EstrellasProducto";

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

  const ci = site.custom_images ?? {};
  const imagenes = await getPexelsImages(site.website_type, site.prompt ?? "");
  const img0 = ci.hero || imagenes[0] || "";
  const img1 = ci.servicios || imagenes[2] || "";
  const img2 = ci.testimonios || imagenes[4] || "";

  const c = site.generated_content;
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
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:${font};font-size:${fontSize};color:#111;scroll-behavior:smooth}
    nav{display:flex;align-items:center;justify-content:space-between;padding:1rem 2rem;background:#fff;border-bottom:1px solid #f0f0f0;position:sticky;top:0;z-index:100;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
    .nav-links{display:flex;gap:2rem;list-style:none}
    .nav-links a{text-decoration:none;color:#555;font-size:0.875rem;font-weight:500;transition:color 0.2s}
    .nav-links a:hover{color:${pr}}
    .hero{position:relative;min-height:92vh;display:flex;align-items:center;overflow:hidden}
    .hero-overlay{position:absolute;inset:0;background:linear-gradient(135deg,${pr}77,${sc}44)}
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
    @media(max-width:768px){nav{padding:1rem}.nav-links{display:none}section{padding:3rem 1rem}.sec-img{height:220px}.hero{min-height:70vh}}
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
      <nav>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {logo && <img src={logo} alt="logo" style={{ height: 50, objectFit: "contain" }} />}
          <span style={{ fontWeight: 700, fontSize: "1.1rem", color: pr }}>{c?.footer?.nombre_empresa ?? site.project_name}</span>
        </div>
        <ul className="nav-links">
          {c?.productos?.length > 0 && !navHidden.includes("productos") && <li><a href="#productos">Productos</a></li>}
          {c?.nosotros && !navHidden.includes("nosotros") && <li><a href="#nosotros">Nosotros</a></li>}
          {c?.servicios && !navHidden.includes("servicios") && <li><a href="#servicios">Servicios</a></li>}
          {c?.testimonios && !navHidden.includes("testimonios") && <li><a href="#testimonios">Testimonios</a></li>}
          {c?.faq && !navHidden.includes("faq") && <li><a href="#faq">FAQ</a></li>}
          {c?.contacto && !navHidden.includes("contacto") && <li><a href="#contacto">Contacto</a></li>}
        </ul>
        <a href="#contacto" style={{ background: pr, color: "#fff", padding: "0.5rem 1.25rem", borderRadius: 8, textDecoration: "none", fontSize: "0.875rem", fontWeight: 700 }}>
          {c?.hero?.cta_principal ?? "Contactar"}
        </a>
      </nav>

      <div className="hero">
        {img0 && <img src={img0} alt="hero" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
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
                  {(c.productos as any[]).filter((p: any) => p.categoria === cat).map((p: any, i: number) => (
                    <a key={i} href={`/demo/${id}/producto/${i}`} style={{ textDecoration: "none", color: "inherit", display: "block", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0", transition: "transform 0.2s" }}>
                      {p.imagenes?.length > 0 ? (
                        <div style={{ position: "relative", overflow: "hidden" }}>
                          <div style={{ display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none", width: "100%" }}>
                            {p.imagenes.map((img: string, j: number) => (
                              <img key={j} src={img} alt={p.nombre} style={{ minWidth: "100%", height: 240, objectFit: "contain", background: "#f8f9fa", scrollSnapAlign: "start" }} />
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
                          <img key={j} src={img} alt={p.nombre} style={{ minWidth: "100%", height: 240, objectFit: "contain", background: "#f8f9fa", scrollSnapAlign: "start" }} />
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
                  <img key={i} src={url} alt={`galeria-${i}`} style={{width:"100%",height:220,objectFit:"cover",borderRadius:16,boxShadow:"0 4px 16px rgba(0,0,0,0.1)"}} />
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
            <p className="label" style={{ color: "rgba(255,255,255,0.7)" }}>Contacto</p>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem" }}>{c.contacto.titulo}</h2>
            <p style={{ opacity: 0.85, fontSize: "1.1rem" }}>{c.contacto.descripcion}</p>
            {c.contacto.whatsapp && (
              <a href={`https://wa.me/${c.contacto.whatsapp.replace(/\D/g,"")}`} className="wa">WhatsApp</a>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center", marginTop: "2rem" }}>
              {c.contacto.telefono && <span style={{ background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)", padding: ".75rem 1.5rem", borderRadius: 999, fontSize: ".9rem" }}>{c.contacto.telefono}</span>}
              {c.contacto.email && <span style={{ background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)", padding: ".75rem 1.5rem", borderRadius: 999, fontSize: ".9rem" }}>{c.contacto.email}</span>}
              {c.contacto.direccion && <span style={{ background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.3)", padding: ".75rem 1.5rem", borderRadius: 999, fontSize: ".9rem" }}>{c.contacto.direccion}</span>}
            </div>
          </div>
        </section>
      )}

      <footer>
        <div className="wrap">
          {logo && <img src={logo} alt="logo" style={{ height: 60, objectFit: "contain", margin: "0 auto 1rem", display: "block", filter: "brightness(0) invert(1)" }} />}
          <h3 style={{ color: pr, fontWeight: 700, fontSize: "1.2rem", marginBottom: ".5rem" }}>{c?.footer?.nombre_empresa}</h3>
          <p style={{ fontSize: ".85rem", color: "rgba(255,255,255,.5)" }}>{c?.footer?.descripcion}</p>
          <div className="social-icons">
            {c?.footer?.facebook && <a href={c.footer.facebook} target="_blank" rel="noopener noreferrer" className="social-icon" title="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>}
            {c?.footer?.instagram && <a href={c.footer.instagram} target="_blank" rel="noopener noreferrer" className="social-icon" title="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="#fff" stroke="none"/></svg></a>}
            {c?.footer?.tiktok && <a href={c.footer.tiktok} target="_blank" rel="noopener noreferrer" className="social-icon" title="TikTok"><svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg></a>}
            {c?.footer?.whatsapp && <a href={`https://wa.me/${c.footer.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" className="social-icon" title="WhatsApp"><svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></a>}
          </div>
          {c?.footer?.btn_label && c?.footer?.btn_url && (
            <a href={c.footer.btn_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "1rem", background: pr, color: "#fff", padding: "10px 28px", borderRadius: 10, fontWeight: 700, fontSize: "0.95rem", textDecoration: "none" }}>{c.footer.btn_label}</a>
          )}
          <div className="footer-bottom">
            <p style={{ fontSize: ".85rem", color: "rgba(255,255,255,.5)" }}>{c?.footer?.copyright}</p>
          </div>
        </div>
      </footer>
      {agente && <AgenteChat agente={agente} color={site.primary_color ?? "#7c3aed"} />}
    </>
  );
}


