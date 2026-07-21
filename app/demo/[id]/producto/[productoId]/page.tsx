import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Carrusel from "./Carrusel";
import CarritoDrawer from "./CarritoDrawer";
import NavbarProducto from "./NavbarProducto";
import DetalleCliente from "./DetalleCliente";
import Resenas from "./Resenas";
import FaqProducto from "./FaqProducto";
import { CarritoProvider } from "../../context/CarritoContext";
import Script from "next/script";
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
      {site.meta_pixel_id && (
        <Script id="fbq-viewcontent" strategy="afterInteractive">
          {
            "if(window.fbq){fbq(" + String.fromCharCode(39) + "track" + String.fromCharCode(39) + "," + String.fromCharCode(39) + "ViewContent" + String.fromCharCode(39) + ",{content_name:" + String.fromCharCode(39) + (p.nombre ?? "").replace(/[\x27\x22]/g, "") + String.fromCharCode(39) + "});}"
          }
        </Script>
      )}
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
                <NavbarProducto id={id} logoUrl={site.logo_url} primaryColor={pr} />

        <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          <Carrusel imagenes={p.imagenes ?? []} nombre={p.nombre} />
          <DetalleCliente producto={p} siteId={id} productoId={productoId} primaryColor={pr} vendidos={vendidos ?? 0} promedio={promedio} totalResenas={resenaData?.length ?? 0} />
        </div>
        <div style={{ background: "#fff", borderRadius: 20, padding: "2rem", marginTop: "2rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>          <Resenas siteId={id} productoIndex={parseInt(productoId)} />
          {c?.faq && c.faq.length > 0 && (
            <FaqProducto faq={c.faq} primaryColor={pr} />
          )}
        </div>
      </div>
    </div>
    </CarritoProvider>
  );
}