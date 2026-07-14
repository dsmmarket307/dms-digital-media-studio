import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Carrusel from "./Carrusel";
import CarritoDrawer from "./CarritoDrawer";
import DetalleCliente from "./DetalleCliente";
import Resenas from "./Resenas";
import { CarritoProvider } from "../../context/CarritoContext";
type Props = { params: Promise<{ id: string; productoId: string }> };
export async function generateMetadata({ params }: Props) {
  const { id, productoId } = await params;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: site } = await supabase.from("generated_websites").select("project_name, generated_content, logo_url").eq("id", id).single();
  const nombre = site?.generated_content?.footer?.nombre_empresa ?? site?.project_name ?? "DMS Digital Media Studio";
  const producto = site?.generated_content?.productos?.[parseInt(productoId)];
  const titulo = producto?.nombre ? `${producto.nombre} | ${nombre}` : nombre;
  const logo = site?.logo_url ?? null;
  return {
    title: titulo,
    icons: logo ? { icon: `/api/favicon?id=${id}`, apple: `/api/favicon?id=${id}` } : undefined,
  };
}
export default async function ProductoDetallePage({ params }: Props) {
  const { id, productoId } = await params;
  const supabase = await createClient();
  const { data: site } = await supabase.from("generated_websites").select("*").eq("id", id).maybeSingle();
  if (!site) return notFound();
  const c = site.generated_content;
  const productos = c?.productos ?? [];
  const p = productos[parseInt(productoId)];
  if (!p) return notFound();
  const pr = site.primary_color ?? "#7c3aed";
  const { count: vendidos } = await supabase.from("pedidos").select("*", { count: "exact", head: true }).eq("site_id", id).eq("producto_nombre", p.nombre);
  const { data: resenaData } = await supabase.from("resenas").select("calificacion").eq("site_id", id).eq("producto_index", parseInt(productoId));
  const promedio = resenaData && resenaData.length > 0 ? (resenaData.reduce((a: number, r: any) => a + r.calificacion, 0) / resenaData.length) : 0;
  const font = site.font_family ?? "'Segoe UI', sans-serif";
  return (
    <CarritoProvider>
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: font }}>
      <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      {site?.generated_content?.barraAnuncio?.activo && site?.generated_content?.barraAnuncio?.items?.length > 0 && (
        <div style={{ background: site.generated_content.barraAnuncio.colorFondo || "#111111", overflow: "hidden", padding: "8px 0" }}>
          <div style={{ display: "flex", width: "max-content", animation: "marquee 20s linear infinite" }}>
            {[...site.generated_content.barraAnuncio.items, ...site.generated_content.barraAnuncio.items].map((txt: string, i: number) => (
              <span key={i} style={{ color: site.generated_content.barraAnuncio.colorTexto || "#f5c542", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap", padding: "0 20px", display: "flex", alignItems: "center", gap: "20px" }}>
                {txt}
                <span style={{ opacity: 0.6 }}>•</span>
              </span>
            ))}
          </div>
        </div>
      )}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1rem" }}>
        <style>{`
          @media(max-width:768px){
            .nav-detail-links { display: none !important; }
            .nav-detail-links.open { display: flex !important; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.95); z-index: 999; flex-direction: column; align-items: center; justify-content: center; gap: 2rem; }
            .nav-detail-links.open a { font-size: 1.5rem !important; color: #fff !important; }
            .hamburger-btn { display: flex !important; }
            .nav-detail-logo { position: absolute; left: 50%; transform: translateX(-50%); }
          }
          @media(min-width:769px){ .hamburger-btn { display: none !important; } }
        `}</style>
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", padding: "0.75rem 0", borderBottom: "1px solid #f0f0f0", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <a href={`/demo/${id}`} style={{ display: "flex", color: "#111" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </a>
            <a href={`/demo/${id}`} style={{ display: "flex", color: "#111" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </a>
          </div>
          <div className="nav-detail-logo" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
            {site.logo_url && <img src={site.logo_url} alt="logo" style={{ height: 40, objectFit: "contain" }} />}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div id="nav-detail-links" className="nav-detail-links" style={{ display: "flex", gap: 20, fontSize: "0.875rem" }}>
              <a href={`/demo/${id}`} style={{ color: "#111", textDecoration: "none", fontWeight: 700 }}>INICIO</a>
              <a href={`/demo/${id}#productos`} style={{ color: "#555", textDecoration: "none", fontWeight: 500 }}>CATALOGO</a>
              <a href={`/demo/${id}#contacto`} style={{ color: "#555", textDecoration: "none", fontWeight: 500 }}>CONTACTO</a>
            </div>
            <button className="hamburger-btn" onClick={() => { const el = document.getElementById("nav-detail-links"); el?.classList.toggle("open"); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href={`/demo/${id}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", background: "#f3f4f6", color: "#111", textDecoration: "none" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </a>
          <a href={`/demo/${id}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", background: "#f3f4f6", color: "#111", textDecoration: "none" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </a>
          <CarritoDrawer primaryColor={pr} siteId={id} />
        </div>

        <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          <Carrusel imagenes={p.imagenes ?? []} nombre={p.nombre} />
          <DetalleCliente producto={p} siteId={id} primaryColor={pr} vendidos={vendidos ?? 0} promedio={promedio} totalResenas={resenaData?.length ?? 0} />
        </div>
        <div style={{ background: "#fff", borderRadius: 20, padding: "2rem", marginTop: "2rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>          <Resenas siteId={id} productoIndex={parseInt(productoId)} />
        </div>
      </div>
    </div>
    </CarritoProvider>
  );
}

