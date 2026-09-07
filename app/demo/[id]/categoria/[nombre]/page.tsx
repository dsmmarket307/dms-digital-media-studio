import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = { params: Promise<{ id: string; nombre: string }> };

export async function generateMetadata({ params }: Props) {
  const { id, nombre } = await params;
  const supabase = await createClient();
  const { data: site } = await supabase.from("generated_websites").select("project_name, generated_content, logo_url").eq("id", id).single();
  const gc = site?.generated_content as any;
  const nombreTienda = gc?.footer?.nombre_empresa ?? site?.project_name ?? "Sitio web";
  const logo = site?.logo_url ?? null;
  const faviconUrl = logo ? `/api/favicon?id=${id}` : undefined;
  const nombreCategoria = decodeURIComponent(nombre);

  return {
    title: `${nombreCategoria} - ${nombreTienda}`,
    icons: faviconUrl ? { icon: faviconUrl, apple: faviconUrl } : undefined,
  };
}

export default async function CategoriaPage({ params }: Props) {
  const { id, nombre } = await params;
  const supabase = await createClient();
  const { data: site } = await supabase.from("generated_websites").select("*").eq("id", id).single();
  if (!site) notFound();

  const c = site.generated_content as any;
  const pr = site.primary_color ?? "#7c3aed";
  const sc = site.secondary_color ?? "#0f172a";
  const logo = site.logo_url ?? "";
  const tipografiaMenu = c?.tipografia?.menu ?? "14px";
  const nombreDecodificado = decodeURIComponent(nombre);

  const productosFiltrados = (c?.productos ?? []).filter(
    (p: any, i: number) => (p.categoria ?? "").toLowerCase() === nombreDecodificado.toLowerCase()
  ).map((p: any, i: number) => ({ ...p, indiceOriginal: (c?.productos ?? []).indexOf(p) }));

  const css = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI', sans-serif;color:#111}
    nav{display:flex;align-items:center;justify-content:space-between;padding:1rem 3rem;background:#fff;border-bottom:1px solid #f0f0f0;position:sticky;top:0;z-index:100;box-shadow:0 2px 20px rgba(0,0,0,0.08)}
    .brand{display:flex;align-items:center;gap:12px;min-width:0;overflow:hidden}
    .brand h1{font-size:1.1rem;font-weight:800;color:${pr}}
    .nav-links{display:flex;gap:2rem;list-style:none}
    .nav-links a{text-decoration:none;color:#555;font-size:${tipografiaMenu};font-weight:500;transition:color 0.2s}
    .nav-links a:hover{color:${pr}}
    .nav-item-parent{position:relative}
    .nav-submenu{display:none;position:absolute;top:100%;left:0;background:#fff;min-width:180px;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.12);padding:0.5rem 0;list-style:none;z-index:200}
    .nav-item-parent:hover .nav-submenu{display:block}
    .nav-submenu li{width:100%}
    .mobile-toggle{display:none}
    .hamburger-label{display:none;cursor:pointer;padding:6px}
    .nav-search-desktop{display:flex}
    .nav-search-mobile-item{display:none}
    @media(max-width:768px){nav{padding:1rem}.hamburger-label{display:block}.nav-links{display:none;position:absolute;top:100%;left:0;right:0;background:#fff;flex-direction:column;align-items:flex-start;padding:1rem 2rem;gap:1rem;box-shadow:0 8px 24px rgba(0,0,0,0.12)}.mobile-toggle:checked ~ .nav-links{display:flex}.hamburger-label{order:-2}.brand{order:-1;flex:1;justify-content:center}.brand{flex-shrink:1;min-width:0}.brand img{max-width:100px;height:auto}.nav-submenu{position:static;box-shadow:none;padding-left:1rem}.nav-search-desktop{display:none !important}.nav-search-mobile-item{display:block !important;order:-3}}
    .cat-breadcrumb{display:flex;align-items:center;padding:1.5rem 3rem;border-bottom:1px solid #f0f0f0}
    .cat-breadcrumb a{color:${pr};text-decoration:none;font-weight:700;font-size:0.9rem}
    .cat-breadcrumb span.sep{color:#bbb;margin:0 0.5rem;font-weight:400}
    .cat-breadcrumb span.current{color:#666;font-weight:400;font-size:0.9rem}
    .cat-header{padding:3rem;text-align:center;border-bottom:1px solid #f0f0f0}
    .cat-header h1{font-size:2rem;font-weight:900;text-transform:uppercase;letter-spacing:2px}
    .cat-wrap{max-width:1200px;margin:0 auto;padding:3rem}
    .cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.5rem}
    a.cat-card{text-decoration:none;color:inherit;display:block;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);border:1px solid #f0f0f0;transition:transform 0.2s}
    a.cat-card:hover{transform:translateY(-4px)}
    a.cat-card > div:first-child{width:100%;aspect-ratio:4/5;background:#f8f9fa;overflow:hidden;display:flex;align-items:center;justify-content:center;position:relative}
    a.cat-card > div:first-child img{width:100%;height:100%;object-fit:contain;background:#fff}
    .cat-card h3{font-size:0.95rem;font-weight:500;margin-top:1rem;color:#111;text-align:center}
    .cat-card p{font-size:1.05rem;font-weight:700;color:#111;margin-top:0.25rem;text-align:center}
    .cat-badge{position:absolute;top:0.75rem;left:0.75rem;background:#000;color:#fff;font-size:0.75rem;font-weight:700;padding:0.3rem 0.6rem;border-radius:2px;z-index:2}
    .cat-price-old{text-decoration:line-through;color:#999;font-weight:400;margin-right:0.5rem;font-size:0.9rem}
    .cat-empty{text-align:center;padding:4rem;color:#888}
    @media(max-width:768px){.cat-breadcrumb,.cat-header,.cat-wrap{padding-left:1.5rem;padding-right:1.5rem}}
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <nav>
        <div className="brand">
          {logo && <img src={logo} alt="logo" style={{ height: 56, maxWidth: 200, objectFit: "contain" }} />}
          {!logo && <h1>{c?.footer?.nombre_empresa ?? site.project_name}</h1>}
        </div>
        <input type="checkbox" id="mobile-toggle-check" className="mobile-toggle" />
        <label htmlFor="mobile-toggle-check" className="hamburger-label">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="3.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </label>
        <ul className="nav-links">
          <li className="nav-search-mobile-item">
            <form action={`/demo/${id}/buscar`} method="GET" style={{ display: "flex", alignItems: "center", background: "#f2f2f2", borderRadius: 999, padding: "0.5rem 1rem", width: "100%" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" name="q" placeholder="Buscar productos..." style={{ border: "none", background: "transparent", outline: "none", marginLeft: "0.5rem", fontSize: "0.9rem", width: "100%" }} />
            </form>
          </li>
          <li><a href={`/demo/${id}/profesional#productos`}>Productos</a></li>
          <li><a href={`/demo/${id}/profesional#nosotros`}>Nosotros</a></li>
          <li><a href={`/demo/${id}/profesional#servicios`}>Servicios</a></li>
          <li><a href={`/demo/${id}/profesional#galeria`}>Galeria</a></li>
          <li><a href={`/demo/${id}/profesional#testimonios`}>Testimonios</a></li>
          <li><a href={`/demo/${id}/profesional#contacto`}>Contacto</a></li>
        </ul>
        <form action={`/demo/${id}/buscar`} method="GET" className="nav-search-desktop" style={{ display: "flex", alignItems: "center", background: "#111", borderRadius: 999, padding: "0.5rem 1.1rem", marginLeft: "1rem" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" name="q" placeholder="Buscar productos..." style={{ border: "none", background: "transparent", outline: "none", marginLeft: "0.5rem", fontSize: "0.9rem", width: 140, color: "#fff" }} />
        </form>
      </nav>
      <div className="cat-breadcrumb">
        <Link href={`/demo/${id}/profesional`}>Inicio</Link>
        <span className="sep">&rsaquo;</span>
        <Link href={`/demo/${id}/profesional#productos`}>Tienda</Link>
        <span className="sep">&rsaquo;</span>
        <span className="current">{nombreDecodificado}</span>
      </div>
      <div className="cat-header">
        <h1>{nombreDecodificado}</h1>
      </div>
      <div className="cat-wrap">
        {productosFiltrados.length === 0 ? (
          <div className="cat-empty">No hay productos en esta categoria.</div>
        ) : (
          <div className="cat-grid">
            {productosFiltrados.map((p: any, i: number) => (
              <Link key={i} href={`/demo/${id}/producto/${p.indiceOriginal}?from=profesional`} className="cat-card">
                <div>
                  {p.imagenes?.length > 0 && <img src={p.imagenes[0]} alt={p.nombre} />}
                  {(() => {
                    const actual = parseFloat(String(p.precio).replace(/[^0-9.]/g, ""));
                    const anterior = parseFloat(String(p.precio_anterior).replace(/[^0-9.]/g, ""));
                    if (!p.precio_anterior || isNaN(actual) || isNaN(anterior) || anterior <= actual) return null;
                    const pct = Math.round((1 - actual / anterior) * 100);
                    if (pct <= 0) return null;
                    return <span className="cat-badge">-{pct}% OFF</span>;
                  })()}
                </div>
                <h3>{p.nombre}</h3>
                <p>
                  {p.precio_anterior && <span className="cat-price-old">{p.precio_anterior}</span>}
                  {p.precio}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}




