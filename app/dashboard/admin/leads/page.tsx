"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ESTADO_COLORS: Record<string, string> = {
  nuevo: "#6366f1", contactado: "#3b82f6", propuesta: "#f59e0b",
  negociacion: "#f97316", ganado: "#10b981", perdido: "#ef4444",
};

const ESTADOS = ["nuevo", "contactado", "propuesta", "negociacion", "ganado", "perdido"];

export default function AdminLeads() {
  const router = useRouter();
  const supabase = createClient();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (prof?.role !== "admin") { router.push("/dashboard/client"); return; }
      const { data: l } = await supabase.from("leads").select("*").eq("fuente", "servicios").order("created_at", { ascending: false });
      setLeads(l ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function cambiarEstado(id: number, estado: string) {
    await supabase.from("leads").update({ estado }).eq("id", id);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, estado } : l));
  }

  const leadsFiltrados = leads
    .filter(l => filtroEstado === "todos" || l.estado === filtroEstado)
    .filter(l => !filtro || l.nombre?.toLowerCase().includes(filtro.toLowerCase()) || l.email?.toLowerCase().includes(filtro.toLowerCase()) || l.empresa?.toLowerCase().includes(filtro.toLowerCase()));

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <header style={{ background: "#fff", borderBottom: "1px solid rgba(124,58,237,0.1)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111", margin: 0 }}>Leads Landing</h1>
          <p style={{ color: "#888", fontSize: 12, margin: "4px 0 0" }}>Contactos recibidos desde el formulario del sitio web</p>
        </div>
        <Link href="/dashboard/admin" style={{ fontSize: 13, color: "#7c3aed", fontWeight: 600, textDecoration: "none" }}>← Volver</Link>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Total", value: leads.length, color: "#7c3aed" },
            { label: "Nuevos", value: leads.filter(l => l.estado === "nuevo").length, color: "#6366f1" },
            { label: "Contactados", value: leads.filter(l => l.estado === "contactado").length, color: "#3b82f6" },
            { label: "Ganados", value: leads.filter(l => l.estado === "ganado").length, color: "#10b981" },
            { label: "Perdidos", value: leads.filter(l => l.estado === "perdido").length, color: "#ef4444" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: "1rem", border: "1px solid #f0f0f0", borderTop: `3px solid ${s.color}` }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: "#888", margin: 0, marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "12px 16px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <input value={filtro} onChange={e => setFiltro(e.target.value)} placeholder="Buscar por nombre, email o empresa..." style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 12px", fontSize: 13, outline: "none", width: 260 }} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["todos", ...ESTADOS].map(e => (
              <button key={e} onClick={() => setFiltroEstado(e)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, fontWeight: 600, border: "none", cursor: "pointer", background: filtroEstado === e ? "#7c3aed" : "#ececec", color: filtroEstado === e ? "#fff" : "#6b7280", textTransform: "capitalize" }}>
                {e === "todos" ? "Todos" : e}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #e5e7eb" }}>
                {["Nombre", "Empresa", "Correo", "Telefono", "Servicio", "Presupuesto", "Estado", "Fecha"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leadsFiltrados.map(lead => (
                <tr key={lead.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "10px 16px", fontWeight: 700, color: "#111" }}>{lead.nombre}</td>
                  <td style={{ padding: "10px 16px", color: "#555" }}>{lead.empresa ?? "---"}</td>
                  <td style={{ padding: "10px 16px", color: "#555" }}>{lead.email}</td>
                  <td style={{ padding: "10px 16px", color: "#888" }}>{lead.telefono ?? "---"}</td>
                  <td style={{ padding: "10px 16px", color: "#888" }}>{lead.servicio ?? "---"}</td>
                  <td style={{ padding: "10px 16px", color: "#888" }}>{lead.presupuesto ?? "---"}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <select value={lead.estado ?? "nuevo"} onChange={e => cambiarEstado(lead.id, e.target.value)} style={{ border: `1px solid ${ESTADO_COLORS[lead.estado ?? "nuevo"]}`, borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700, color: ESTADO_COLORS[lead.estado ?? "nuevo"], background: "#fff", cursor: "pointer" }}>
                      {ESTADOS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "10px 16px", color: "#aaa", fontSize: 12 }}>{new Date(lead.created_at).toLocaleDateString("es-CO")}</td>
                </tr>
              ))}
              {leadsFiltrados.length === 0 && (
                <tr><td colSpan={8} style={{ padding: "2rem", textAlign: "center", color: "#ccc" }}>No hay leads aun.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
