import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PedidoForm from "./PedidoForm";

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
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
        <a href={`/demo/${id}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#666", textDecoration: "none", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Volver al catalogo
        </a>

        <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ position: "relative", overflow: "hidden" }}>
            {p.imagenes?.length > 0 ? (
              <div style={{ display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none", width: "100%" }}>
                {p.imagenes.map((img: string, j: number) => (
                  <img key={j} src={img} alt={p.nombre} style={{ minWidth: "100%", height: 440, objectFit: "cover", scrollSnapAlign: "start" }} />
                ))}
              </div>
            ) : (
              <div style={{ height: 440, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
                </svg>
              </div>
            )}
          </div>

          <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111" }}>{p.nombre}</h1>
            <p style={{ fontSize: "2rem", fontWeight: 800, color: pr }}>{p.precio}</p>
            {p.descripcion && <p style={{ fontSize: "0.95rem", color: "#555", lineHeight: 1.7 }}>{p.descripcion}</p>}
            {p.tallas && (
              <div>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#555", marginBottom: 8 }}>Tallas disponibles</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {p.tallas.split(",").map((t: string, j: number) => (
                    <span key={j} style={{ padding: "6px 14px", border: `2px solid ${pr}`, borderRadius: 8, fontSize: "0.85rem", fontWeight: 600, color: pr }}>{t.trim()}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <PedidoForm producto={p} siteId={id} primaryColor={pr} />
      </div>
    </div>
  );
}