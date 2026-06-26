import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Carrusel from "./Carrusel";
import DetalleCliente from "./DetalleCliente";

type Props = { params: Promise<{ id: string; productoId: string }> };

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
  const font = site.font_family ?? "'Segoe UI', sans-serif";

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: font }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1rem" }}>
        <a href={`/demo/${id}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#666", textDecoration: "none", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Volver al catalogo
        </a>
        <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          <Carrusel imagenes={p.imagenes ?? []} nombre={p.nombre} />
          <DetalleCliente producto={p} siteId={id} primaryColor={pr} />
        </div>
      </div>
    </div>
  );
}