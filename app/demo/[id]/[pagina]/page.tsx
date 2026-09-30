import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string; pagina: string }> };

export async function generateMetadata({ params }: Props) {
  const { id, pagina } = await params;
  const supabase = await createClient();
  const { data: site } = await supabase.from("generated_websites").select("project_name, generated_content, logo_url").eq("id", id).single();
  const gc = site?.generated_content as any;
  const nombre = gc?.footer?.nombre_empresa ?? site?.project_name ?? "Sitio web";
  const pg = (gc?.paginas_extra ?? []).find((p: any) => p.slug === pagina);
  const titulo = pg?.titulo ? `${pg.titulo} - ${nombre}` : nombre;
  const faviconUrl = site?.logo_url ? `/api/favicon?id=${id}` : undefined;
  let description: string = (pg?.descripcion?.trim()) || (gc?.footer?.descripcion?.trim()) || (gc?.nosotros?.descripcion?.trim()) || `${nombre}.`;
  if (description.length > 160) description = description.slice(0, 157).trimEnd() + "...";
  return {
    title: titulo,
    description,
    icons: faviconUrl ? { icon: faviconUrl, apple: faviconUrl } : undefined,
  };
}

export default async function SubPage({ params }: Props) {
  const { id, pagina } = await params;
  const supabase = await createClient();
  const { data: site } = await supabase.from("generated_websites").select("*").eq("id", id).single();
  if (!site) notFound();

  const c = site.generated_content;
  const pr = site.primary_color ?? "#7c3aed";
  const sc = site.secondary_color ?? "#000000";
  const logo = site.logo_url ?? "";
  const paginas = c?.paginas_extra ?? [];
  const page = paginas.find((p: any) => p.slug === pagina);
  if (!page) notFound();
  const base = `/demo/${id}/profesional`;
  const secciones = [["productos", "Productos"], ["nosotros", "Nosotros"], ["servicios", "Servicios"], ["galeria", "Galeria"], ["testimonios", "Testimonios"], ["contacto", "Contacto"]];

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Segoe UI',sans-serif;color:#111}
        .wrap{max-width:1100px;margin:0 auto;padding:0 1rem}
        nav{display:flex;align-items:center;justify-content:space-between;padding:1rem 3rem;background:#fff;border-bottom:1px solid #f0f0f0;position:sticky;top:0;z-index:100;box-shadow:0 2px 20px rgba(0,0,0,0.08)}
        .brand{display:flex;align-items:center;gap:12px;min-width:0;overflow:hidden}
        .brand h1{font-size:1.1rem;font-weight:800;color:${pr}}
        .brand img{height:70px;object-fit:contain}
        .nav-links{display:flex;gap:2rem;list-style:none;align-items:center}
        .nav-links a{text-decoration:none;color:#555;font-size:0.875rem;font-weight:500;transition:color 0.2s}
        .nav-links a:hover{color:${pr}}
        .nav-item-parent{position:relative}
        .nav-submenu{display:none;position:absolute;top:100%;left:0;background:#fff;min-width:180px;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.12);padding:0.5rem 0;list-style:none;z-index:200}
        .nav-item-parent:hover .nav-submenu{display:block}
        .nav-submenu li{width:100%}
        .nav-submenu a{display:block;padding:0.5rem 1rem;white-space:nowrap;color:#555}
        .nav-submenu a:hover{background:#f8f8f8}
        .nav-cta{background:${pr};color:#fff;padding:0.625rem 1.5rem;border-radius:8px;text-decoration:none;font-size:0.875rem;font-weight:700;transition:opacity 0.2s}
        .nav-cta:hover{opacity:0.9}
        .mobile-toggle{display:none}
        .hamburger-label{display:none;cursor:pointer;padding:6px}
        @media(max-width:768px){nav{padding:1rem}.hamburger-label{display:block}.nav-links{display:none;position:absolute;top:100%;left:0;right:0;background:#fff;flex-direction:column;align-items:flex-start;padding:1rem 2rem;gap:1rem;box-shadow:0 8px 24px rgba(0,0,0,0.12)}.mobile-toggle:checked ~ .nav-links{display:flex}.hamburger-label{order:-2}.brand{order:-1;flex:1;justify-content:center;flex-shrink:1;min-width:0}.nav-cta{order:0;padding:0.4rem 0.7rem;font-size:0.68rem;flex-shrink:0;white-space:nowrap}.brand img{max-width:100px;height:auto}.nav-submenu{position:static;box-shadow:none;padding-left:1rem}}
    footer{background:#0f172a;color:#fff;padding:4rem 3rem 2rem}
    .footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:3rem;margin-bottom:3rem}
    .footer-brand img{height:60px;object-fit:contain;margin-bottom:1rem}
    .footer-brand h3{font-size:1.1rem;font-weight:700;color:${pr};margin-bottom:0.75rem}
    .footer-brand p{font-size:0.875rem;color:rgba(255,255,255,0.5);line-height:1.6;margin-bottom:1.25rem}
    .social-icons{display:flex;gap:0.75rem;margin-top:0.5rem;flex-wrap:wrap}
    .social-icon{width:40px;height:40px;border-radius:10px;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;transition:background 0.2s;text-decoration:none;border:1px solid rgba(255,255,255,0.1)}
    .social-icon:hover{background:${pr};border-color:${pr}}
    .footer-col h4{font-size:0.9rem;font-weight:700;margin-bottom:1rem;color:#fff}
    .footer-col ul{list-style:none}
    .footer-col ul li{margin-bottom:0.5rem}
    .footer-col ul li a{color:rgba(255,255,255,0.5);text-decoration:none;font-size:0.875rem;transition:color 0.2s}
    .footer-col ul li a:hover{color:${pr}}
    .footer-bottom{border-top:1px solid rgba(255,255,255,0.1);padding-top:2rem;display:flex;justify-content:space-between;align-items:center}
    .footer-bottom p{font-size:0.8rem;color:rgba(255,255,255,0.3)}
    .footer-grid a:hover{opacity:0.8}
        @media(max-width:768px){.footer-grid{grid-template-columns:1fr}footer{padding:3rem 1.5rem 2rem}.footer-bottom{flex-direction:column;gap:0.5rem;text-align:center}}
        .g3{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem}
        .card{background:#fff;border-radius:16px;padding:2rem;box-shadow:0 2px 12px rgba(0,0,0,.06);border:1px solid #f0f0f0}
        @media(max-width:768px){.g3{grid-template-columns:1fr}}
      `}</style>

      <nav>
        <div className="brand">
          <a href={base} style={{ display: "flex", alignItems: "center" }}>
            {logo ? <img src={logo} alt="logo" /> : <h1>{c?.footer?.nombre_empresa ?? site.project_name}</h1>}
          </a>
        </div>
        <input type="checkbox" id="mobile-toggle-check" className="mobile-toggle" />
        <label htmlFor="mobile-toggle-check" className="hamburger-label">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="3.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </label>
        <ul className="nav-links">
          {secciones.filter((s) => s[0] !== "productos" || c?.productos?.length > 0).map((s) => {
            const hijos = paginas.filter((h: any) => h.padre === s[0]);
            return hijos.length > 0 ? (
              <li key={s[0]} className="nav-item-parent">
                <a href={`${base}#${s[0]}`}>{s[1]} &#9662;</a>
                <ul className="nav-submenu">
                  {hijos.map((h: any, hi: number) => (<li key={hi}><a href={`/demo/${id}/${h.slug}`}>{h.titulo}</a></li>))}
                </ul>
              </li>
            ) : (
              <li key={s[0]}><a href={`${base}#${s[0]}`}>{s[1]}</a></li>
            );
          })}
          {paginas.filter((p: any) => !p.padre).map((p: any, pi: number) => {
            const hijos = paginas.filter((h: any) => h.padre === p.slug);
            return hijos.length > 0 ? (
              <li key={"x" + pi} className="nav-item-parent">
                <a href={`/demo/${id}/${p.slug}`}>{p.titulo} &#9662;</a>
                <ul className="nav-submenu">
                  {hijos.map((h: any, hi: number) => (<li key={hi}><a href={`/demo/${id}/${h.slug}`}>{h.titulo}</a></li>))}
                </ul>
              </li>
            ) : (
              <li key={"x" + pi}><a href={`/demo/${id}/${p.slug}`}>{p.titulo}</a></li>
            );
          })}
        </ul>
        <a href={`${base}#contacto`} className="nav-cta">Contactar</a>
      </nav>

      <section style={{ padding:"4rem 2rem" }}>
        <div className="wrap">
          <div style={{ marginBottom:"3rem", textAlign:"center" }}>
            <p style={{ fontSize:".7rem", fontWeight:700, letterSpacing:4, textTransform:"uppercase", color:pr, marginBottom:".75rem" }}>{c?.footer?.nombre_empresa}</p>
            <h1 style={{ fontSize:"clamp(1.5rem,3vw,2.5rem)", fontWeight:800, color:"#111", marginBottom:"1rem" }}>{page.titulo}</h1>
            {page.imagen && (<img src={page.imagen} alt={page.titulo} style={{ width:"100%", maxWidth:720, maxHeight:420, objectFit:"cover", borderRadius:16, margin:"0 auto 1.5rem", display:"block" }} />)}
            {page.descripcion && (<div style={{ maxWidth:720, margin:"0 auto", textAlign:"left" }}>{(() => { const partes = String(page.descripcion).split(/\n+/).filter(Boolean); const bloques: string[] = partes.length > 1 ? partes : (String(page.descripcion).match(/[^.!?]+[.!?]+\s*|[^.!?]+$/g) ?? [String(page.descripcion)]).reduce((a: string[], s: string, i: number) => { if (i % 2 === 0) a.push(s.trim()); else a[a.length - 1] += " " + s.trim(); return a; }, []); return bloques.map((b: string, i: number) => (<p key={i} style={{ color:"#555", fontSize:"1rem", lineHeight:1.8, marginBottom:"1rem" }}>{b}</p>)); })()}</div>)}
          </div>

          {page.items && page.items.length > 0 && (
            <div className="g3">
              {page.items.map((item: any, i: number) => (
                <div key={i} className="card">
                  {(() => {
                    const alturaImg = item.imagen_tamano === "pequena" ? 100 : item.imagen_tamano === "grande" ? 280 : 180;
                    const imagenBlock = item.imagen && (
                      <img src={item.imagen} alt={item.nombre} style={{ width:"100%", height:alturaImg, objectFit:"contain", background:"#f5f5f5", borderRadius:10, marginBottom:"1rem" }} />
                    );
                    const textoBlock = (
                      <>
                        {item.etiqueta && <span style={{ display:"inline-block", background:`${pr}15`, color:pr, fontSize:".7rem", fontWeight:700, padding:"3px 10px", borderRadius:20, marginBottom:".5rem" }}>{item.etiqueta}</span>}
                        <h3 style={{ fontWeight:700, fontSize:"1rem", color:"#111", marginBottom:".25rem" }}>{item.nombre}</h3>
                        {item.fecha && <p style={{ fontSize:".75rem", color:"#999", marginBottom:".5rem" }}>{item.fecha}</p>}
                        {item.descripcion && <p style={{ fontSize:".875rem", color:"#666", lineHeight:1.6, marginBottom:".75rem" }}>{item.descripcion}</p>}
                        {item.precio && <p style={{ fontSize:"1.1rem", fontWeight:800, color:pr }}>{item.precio}</p>}
                        {item.btn_label && item.btn_url && (
                          <a href={item.btn_url} target="_blank" rel="noopener noreferrer" style={{ display:"inline-block", marginTop:".75rem", background:pr, color:"#fff", padding:"8px 20px", borderRadius:8, textDecoration:"none", fontSize:".875rem", fontWeight:700 }}>{item.btn_label}</a>
                        )}
                      </>
                    );
                    return item.imagen_posicion === "abajo" ? (<>{textoBlock}{imagenBlock}</>) : (<>{imagenBlock}{textoBlock}</>);
                  })()}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="footer-grid">
            <div className="footer-brand">
              {logo && <img src={logo} alt="logo" />}
              <h3>{c?.footer?.nombre_empresa}</h3>
              <p>{c?.footer?.descripcion}</p>
              <div className="social-icons">
                {c?.contacto?.instagram && (
                  <a href={c.contacto.instagram.startsWith("http") ? c.contacto.instagram : `https://instagram.com/${c.contacto.instagram.replace("@","")}`} target="_blank" className="social-icon" title="Instagram">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="#fff" stroke="none"/></svg>
                  </a>
                )}
                {c?.contacto?.facebook && (
                  <a href={c.contacto.facebook.startsWith("http") ? c.contacto.facebook : `https://facebook.com/${c.contacto.facebook}`} target="_blank" className="social-icon" title="Facebook">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </a>
                )}
                {c?.contacto?.tiktok && (
                  <a href={c.contacto.tiktok.startsWith("http") ? c.contacto.tiktok : `https://tiktok.com/${c.contacto.tiktok.startsWith("@") ? c.contacto.tiktok : "@"+c.contacto.tiktok}`} target="_blank" className="social-icon" title="TikTok">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg>
                  </a>
                )}
                {c?.contacto?.youtube && (
                  <a href={c.contacto.youtube.startsWith("http") ? c.contacto.youtube : `https://youtube.com/${c.contacto.youtube}`} target="_blank" className="social-icon" title="YouTube">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0f172a"/></svg>
                  </a>
                )}
                {c?.contacto?.whatsapp && (
                  <a href={`https://wa.me/${c.contacto.whatsapp.replace(/\D/g,"")}`} target="_blank" className="social-icon" title="WhatsApp">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  </a>
                )}
                {c?.contacto?.email && (
                  <a href={`mailto:${c.contacto.email}`} className="social-icon" title="Email">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </a>
                )}
              </div>
            </div>
            <div className="footer-col">
              <h4>Navegacion</h4>
              <ul>
                {c?.productos?.length > 0 && <li><a href={`${base}#productos`}>Productos</a></li>}
          <li><a href={`${base}#nosotros`}>Nosotros</a></li>
                <li><a href={`${base}#servicios`}>Servicios</a></li>
                <li><a href={`${base}#galeria`}>Galeria</a></li>
                <li><a href={`${base}#testimonios`}>Testimonios</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Contacto</h4>
              <ul>
                {c?.contacto?.telefono && <li><a href="#">{c.contacto.telefono}</a></li>}
                {c?.contacto?.email && <li><a href={`mailto:${c.contacto.email}`}>{c.contacto.email}</a></li>}
                {c?.contacto?.direccion && <li><a href="#">{c.contacto.direccion}</a></li>}
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{c?.footer?.copyright}</p>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.2)" }}>Sitio generado por DMS Digital Media Studio</p>
          </div>
        </div>
      </footer>
    </>
  );
}
