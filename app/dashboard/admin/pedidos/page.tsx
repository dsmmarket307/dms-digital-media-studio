import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PedidosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: pedidos } = await supabase
    .from("pedidos")
    .select("*, generated_websites(project_name)")
    .order("created_at", { ascending: false });

  const estadoColor: Record<string, string> = {
    pendiente: "#f59e0b",
    enviado: "#3b82f6",
    entregado: "#16a34a",
    cancelado: "#ef4444"
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111" }}>Pedidos</h1>
        <p style={{ color: "#666", fontSize: "0.9rem", marginTop: 4 }}>Pedidos recibidos contra entrega</p>
      </div>

      {!pedidos || pedidos.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#fff", borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
          <p style={{ color: "#888", fontWeight: 600 }}>Aun no hay pedidos</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {pedidos.map((p: any) => (
            <div key={p.id} style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 800, fontSize: "1rem", color: "#111" }}>{p.producto_nombre}</span>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#7c3aed" }}>{p.producto_precio}</span>
                  {p.talla && <span style={{ fontSize: "0.8rem", background: "#f3f4f6", padding: "2px 10px", borderRadius: 20, color: "#555" }}>Talla: {p.talla}</span>}
                  {p.cantidad > 1 && <span style={{ fontSize: "0.8rem", background: "#f3f4f6", padding: "2px 10px", borderRadius: 20, color: "#555" }}>x{p.cantidad}</span>}
                </div>
                <div style={{ fontSize: "0.88rem", color: "#555", display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                  <span>{p.nombre}</span>
                  <span>•</span>
                  <span>{p.telefono}</span>
                  <span>•</span>
                  <span>{p.direccion}{p.barrio ? `, ${p.barrio}` : ""}, {p.ciudad}</span>
                </div>
                {p.notas && <p style={{ fontSize: "0.85rem", color: "#888", fontStyle: "italic" }}>{p.notas}</p>}
                <div style={{ fontSize: "0.8rem", color: "#aaa", display: "flex", gap: 8 }}>
                  <span>Tienda: {p.generated_websites?.project_name ?? p.site_id}</span>
                  <span>•</span>
                  <span>{new Date(p.created_at).toLocaleString("es-CO")}</span>
                </div>
              </div>
              <span style={{ padding: "6px 14px", borderRadius: 20, fontSize: "0.8rem", fontWeight: 700, background: `${estadoColor[p.estado] ?? "#888"}20`, color: estadoColor[p.estado] ?? "#888" }}>
                {p.estado}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}