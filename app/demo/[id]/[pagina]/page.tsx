import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string; pagina: string }> };

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

      <footer style={{ background:sc||"#111", color:"#fff", padding:"2rem", textAlign:"center" }}>
        {logo && <img src={logo} alt="logo" style={{ height:40, objectFit:"contain", margin:"0 auto 1rem", display:"block", filter:"brightness(0) invert(1)" }} />}
        <p style={{ color:pr, fontWeight:700, fontSize:"1rem" }}>{c?.footer?.nombre_empresa}</p>
        <p style={{ fontSize:".8rem", color:"rgba(255,255,255,.4)", marginTop:4 }}>{c?.footer?.copyright}</p>
      </footer>
    </>
  );
}
