"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const ESTADOS = ["pendiente", "enviado", "entregado", "cancelado"];

const ESTADO_COLOR: Record<string, string> = {
  pendiente: "#f59e0b",
  enviado: "#3b82f6",
  entregado: "#16a34a",
  cancelado: "#ef4444",
};

const TRANSPORTADORAS = [
  { value: "", label: "Transportadora" },
  { value: "envia", label: "Envia" },
  { value: "coordinadora", label: "Coordinadora" },
  { value: "interrapidisimo", label: "Interrapidisimo" },
  { value: "servientrega", label: "Servientrega" },
  { value: "tcc", label: "TCC" },
  { value: "veloces", label: "Veloces" },
];

function urlRastreo(transportadora: string, guia: string) {
  if (transportadora === "coordinadora") return "https://coordinadora.com/rastreo/rastreo-de-guia/?guia=" + guia;
  if (transportadora === "interrapidisimo") return "https://siguetuenvio.interrapidisimo.com/?guia=" + guia;
  if (transportadora === "servientrega") return "https://www.servientrega.com/wps/portal/rastreo-envio?guia=" + guia;
  if (transportadora === "tcc") return "https://tcc.com.co/rastreo/?guia=" + guia;
  if (transportadora === "veloces") return "https://tracking.veloces.app/?guia=" + guia;
  return "https://envia.co/rastreo/" + guia;
}

export default function PedidosPage() {
  const router = useRouter();
  const supabase = createClient();
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");
  const [actualizando, setActualizando] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [editando, setEditando] = useState<any>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data } = await supabase
        .from("pedidos")
        .select("*, generated_websites(project_name)")
        .order("created_at", { ascending: false });
      setPedidos(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function cambiarEstado(id: string, estado: string) {
    setActualizando(id);
    await supabase.from("pedidos").update({ estado }).eq("id", id);
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, estado } : p));
    setActualizando(null);
  }

  async function eliminarPedido(id: string) {
    if (!confirm("Seguro que quieres eliminar este pedido?")) return;
    setEliminando(id);
    await supabase.from("pedidos").delete().eq("id", id);
    setPedidos(prev => prev.filter(p => p.id !== id));
    setEliminando(null);
  }

  async function actualizarCampo(id: string, campo: string, valor: any) {
    await supabase.from("pedidos").update({ [campo]: valor }).eq("id", id);
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, [campo]: valor } : p));
  }

  async function guardarEdicion() {
    setGuardando(true);
    await supabase.from("pedidos").update({
      nombre: editando.nombre,
      telefono: editando.telefono,
      direccion: editando.direccion,
      barrio: editando.barrio,
      ciudad: editando.ciudad,
      cantidad: editando.cantidad,
      talla: editando.talla,
      notas: editando.notas,
    }).eq("id", editando.id);
    setPedidos(prev => prev.map(p => p.id === editando.id ? { ...p, ...editando } : p));
    setEditando(null);
    setGuardando(false);
  }

  const pedidosFiltrados = filtro === "todos" ? pedidos : pedidos.filter(p => p.estado === filtro);

  const totales = {
    todos: pedidos.length,
    pendiente: pedidos.filter(p => p.estado === "pendiente").length,
    enviado: pedidos.filter(p => p.estado === "enviado").length,
    entregado: pedidos.filter(p => p.estado === "entregado").length,
    cancelado: pedidos.filter(p => p.estado === "cancelado").length,
  };

  const inputStyle: React.CSSProperties = { width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 8px", fontSize: 12, color: "#111", outline: "none", boxSizing: "border-box" };
  const btnBase: React.CSSProperties = { padding: "6px 10px", borderRadius: 8, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" };

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ padding: "2rem", fontFamily: "'Segoe UI', sans-serif", background: "#f8f9fa", minHeight: "100vh" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111" }}>Pedidos</h1>
        <p style={{ color: "#666", fontSize: "0.9rem", marginTop: 4 }}>Pedidos recibidos contra entrega</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 14 }}>
          <p style={{ fontSize: 11, color: "#888" }}>Total</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#111" }}>{totales.todos}</p>
        </div>
        <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 12, padding: 14 }}>
          <p style={{ fontSize: 11, color: "#b45309" }}>Pendientes</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#b45309" }}>{totales.pendiente}</p>
        </div>
        <div style={{ background: "#dbeafe", border: "1px solid #bfdbfe", borderRadius: 12, padding: 14 }}>
          <p style={{ fontSize: 11, color: "#1d4ed8" }}>Enviados</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#1d4ed8" }}>{totales.enviado}</p>
        </div>
        <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 12, padding: 14 }}>
          <p style={{ fontSize: 11, color: "#15803d" }}>Entregados</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#15803d" }}>{totales.entregado}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {["todos", "pendiente", "enviado", "entregado", "cancelado"].map(f => (
          <button key={f} onClick={() => setFiltro(f)} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", textTransform: "capitalize", border: filtro === f ? "none" : "1px solid #e5e7eb", background: filtro === f ? "#7c3aed" : "#fff", color: filtro === f ? "#fff" : "#555" }}>
            {f} ({f === "todos" ? totales.todos : (totales as any)[f]})
          </button>
        ))}
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#fff", borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
          <p style={{ color: "#888", fontWeight: 600 }}>No hay pedidos {filtro !== "todos" ? `con estado "${filtro}"` : "aun"}.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {pedidosFiltrados.map((p: any) => (
            <div key={p.id} style={{ background: "#fff", borderRadius: 16, padding: "1.25rem 1.5rem", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", display: "grid", gridTemplateColumns: "1fr 220px", gap: 16, alignItems: "start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: "1rem", color: "#111" }}>{p.producto_nombre}</span>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#7c3aed" }}>{p.producto_precio}</span>
                  {p.talla && <span style={{ fontSize: "0.75rem", background: "#f3f4f6", padding: "2px 10px", borderRadius: 20, color: "#555" }}>Talla: {p.talla}</span>}
                  {p.cantidad > 1 && <span style={{ fontSize: "0.75rem", background: "#f3f4f6", padding: "2px 10px", borderRadius: 20, color: "#555" }}>x{p.cantidad}</span>}
                  <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: (ESTADO_COLOR[p.estado] ?? "#888") + "20", color: ESTADO_COLOR[p.estado] ?? "#888" }}>
                    {p.estado}
                  </span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "#555", display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: 6 }}>
                  <span>{p.nombre}</span>
                  <span>•</span>
                  <span>{p.telefono}</span>
                  <span>•</span>
                  <span>{p.direccion}{p.barrio ? `, ${p.barrio}` : ""}, {p.ciudad}</span>
                </div>
                {p.notas && <p style={{ fontSize: "0.8rem", color: "#888", fontStyle: "italic", marginBottom: 6 }}>{p.notas}</p>}
                <div style={{ fontSize: "0.75rem", color: "#aaa", display: "flex", gap: 8, marginBottom: 10 }}>
                  <span>Tienda: {p.generated_websites?.project_name ?? p.site_id}</span>
                  <span>•</span>
                  <span>{new Date(p.created_at).toLocaleString("es-CO")}</span>
                </div>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {ESTADOS.map(e => (
                    <button key={e} onClick={() => cambiarEstado(p.id, e)} disabled={p.estado === e || actualizando === p.id} style={{ ...btnBase, textTransform: "capitalize", background: p.estado === e ? "#111" : "#f3f4f6", color: p.estado === e ? "#fff" : "#555", opacity: (p.estado === e || actualizando === p.id) ? 0.6 : 1 }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button onClick={() => { const t = `Nombre: ${p.nombre}\nTelefono: ${p.telefono}\nDireccion: ${p.direccion}${p.barrio ? `, ${p.barrio}` : ""}, ${p.ciudad}\nProducto: ${p.producto_nombre}\nCantidad: ${p.cantidad || 1}`; navigator.clipboard.writeText(t); alert("Datos copiados"); }} style={{ ...btnBase, background: "#ede9fe", color: "#7c3aed" }}>
                  Copiar datos
                </button>

                <select defaultValue={p.transportadora ?? ""} onChange={e => actualizarCampo(p.id, "transportadora", e.target.value)} style={inputStyle}>
                  {TRANSPORTADORAS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>

                <input defaultValue={p.guia ?? ""} onBlur={e => actualizarCampo(p.id, "guia", e.target.value)} placeholder="Numero guia" style={inputStyle} />

                {p.guia && p.transportadora && (
                  <a href={urlRastreo(p.transportadora, p.guia)} target="_blank" rel="noopener noreferrer" style={{ ...btnBase, background: "#dbeafe", color: "#1d4ed8", textAlign: "center", textDecoration: "none" }}>
                    Rastrear guia
                  </a>
                )}

                <a href={`https://wa.me/57${(p.telefono ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${p.nombre}, recibimos tu pedido de ${p.producto_nombre}. Por favor confirma si esta es tu direccion de entrega: ${p.direccion}${p.barrio ? `, ${p.barrio}` : ""}, ${p.ciudad}. En breve lo despachamos.`)}`} target="_blank" rel="noopener noreferrer" style={{ ...btnBase, background: "#25D366", color: "#fff", textAlign: "center", textDecoration: "none" }}>
                  Confirmar WhatsApp
                </a>

                <button onClick={() => setEditando({ ...p })} style={{ ...btnBase, background: "#dbeafe", color: "#1d4ed8" }}>
                  Editar
                </button>

                <button onClick={() => eliminarPedido(p.id)} disabled={eliminando === p.id} style={{ ...btnBase, background: "#fef2f2", color: "#ef4444", opacity: eliminando === p.id ? 0.6 : 1 }}>
                  {eliminando === p.id ? "..." : "Eliminar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editando && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 420, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#111", marginBottom: 16 }}>Editar Pedido</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>Nombre</label>
                <input value={editando.nombre ?? ""} onChange={e => setEditando({ ...editando, nombre: e.target.value })} style={{ ...inputStyle, padding: "10px 12px", marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>Telefono</label>
                <input value={editando.telefono ?? ""} onChange={e => setEditando({ ...editando, telefono: e.target.value })} style={{ ...inputStyle, padding: "10px 12px", marginTop: 4 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>Direccion</label>
                <input value={editando.direccion ?? ""} onChange={e => setEditando({ ...editando, direccion: e.target.value })} style={{ ...inputStyle, padding: "10px 12px", marginTop: 4 }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>Barrio</label>
                  <input value={editando.barrio ?? ""} onChange={e => setEditando({ ...editando, barrio: e.target.value })} style={{ ...inputStyle, padding: "10px 12px", marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>Ciudad</label>
                  <input value={editando.ciudad ?? ""} onChange={e => setEditando({ ...editando, ciudad: e.target.value })} style={{ ...inputStyle, padding: "10px 12px", marginTop: 4 }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>Cantidad</label>
                  <input type="number" value={editando.cantidad ?? 1} onChange={e => setEditando({ ...editando, cantidad: Number(e.target.value) })} style={{ ...inputStyle, padding: "10px 12px", marginTop: 4 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>Talla</label>
                  <input value={editando.talla ?? ""} onChange={e => setEditando({ ...editando, talla: e.target.value })} style={{ ...inputStyle, padding: "10px 12px", marginTop: 4 }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>Notas</label>
                <textarea value={editando.notas ?? ""} onChange={e => setEditando({ ...editando, notas: e.target.value })} rows={3} style={{ ...inputStyle, padding: "10px 12px", marginTop: 4, resize: "none" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setEditando(null)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", color: "#555", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Cancelar</button>
              <button onClick={guardarEdicion} disabled={guardando} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#7c3aed", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: guardando ? 0.6 : 1 }}>
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}