"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const COLUMNAS = ["nuevo", "contactado", "propuesta", "negociacion", "ganado", "perdido"];
const COLUMNA_LABELS: Record<string, string> = { nuevo: "Nuevo", contactado: "Contactado", propuesta: "Propuesta", negociacion: "Negociacion", ganado: "Ganado", perdido: "Perdido" };
const COLUMNA_COLORS: Record<string, string> = { nuevo: "#6366f1", contactado: "#3b82f6", propuesta: "#f59e0b", negociacion: "#f97316", ganado: "#10b981", perdido: "#ef4444" };

export default function CRMCliente() {
  const router = useRouter();
  const supabase = createClient();
  const [leads, setLeads] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState<any>(null);
  const [vista, setVista] = useState<"kanban" | "lista">("kanban");
  const [filtro, setFiltro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newLead, setNewLead] = useState({ nombre: "", email: "", telefono: "", empresa: "", mensaje: "" });
  const [addingLead, setAddingLead] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data: sub } = await supabase.from("subscriptions").select("plan").eq("user_id", user.id).maybeSingle();
      if (sub?.plan !== "empresarial") { router.push("/dashboard/client"); return; }
      const { data: l } = await supabase.from("leads").select("*").eq("fuente", "manual").order("created_at", { ascending: false });
      const { data: p } = await supabase.from("crm_pipeline").select("*").eq("user_id", user.id);
      const pipelineMap: Record<number, string> = {};
      (p ?? []).forEach((item: any) => { pipelineMap[item.lead_id] = item.columna; });
      setLeads(l ?? []);
      setPipeline(pipelineMap);
      setLoading(false);
    }
    load();
  }, []);

  async function moverLead(leadId: number, columna: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setPipeline(prev => ({ ...prev, [leadId]: columna }));
    const existing = await supabase.from("crm_pipeline").select("id").eq("lead_id", leadId).eq("user_id", user.id).maybeSingle();
    if (existing.data) {
      await supabase.from("crm_pipeline").update({ columna, updated_at: new Date().toISOString() }).eq("lead_id", leadId).eq("user_id", user.id);
    } else {
      await supabase.from("crm_pipeline").insert({ user_id: user.id, lead_id: leadId, columna });
    }
  }

  function getColumna(leadId: number) { return pipeline[leadId] ?? "nuevo"; }

  async function agregarLead() {
    if (!newLead.nombre) return;
    setAddingLead(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("leads").insert({ nombre: newLead.nombre, email: newLead.email, telefono: newLead.telefono, empresa: newLead.empresa, mensaje: newLead.mensaje, estado: "nuevo", fuente: "manual" }).select().single();
    if (data) { setLeads(prev => [data, ...prev]); setPipeline(prev => ({ ...prev, [data.id]: "nuevo" })); }
    setNewLead({ nombre: "", email: "", telefono: "", empresa: "", mensaje: "" });
    setShowModal(false);
    setAddingLead(false);
  }

  const leadsFiltrados = leads.filter(l => !filtro || l.nombre?.toLowerCase().includes(filtro.toLowerCase()) || l.email?.toLowerCase().includes(filtro.toLowerCase()));

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ padding: "2rem", minWidth: 0 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111", margin: 0 }}>CRM Pipeline</h1>
          <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Gestiona tus leads y oportunidades de negocio.</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={() => setShowModal(true)} style={{ padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#7c3aed", color: "#fff" }}>+ Nuevo Lead</button>
          <input placeholder="Buscar lead..." value={filtro} onChange={e => setFiltro(e.target.value)} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 12px", fontSize: 13, outline: "none", width: 180 }} />
          <button onClick={() => setVista("kanban")} style={{ padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: vista === "kanban" ? "#7c3aed" : "#f3f4f6", color: vista === "kanban" ? "#fff" : "#555" }}>Kanban</button>
          <button onClick={() => setVista("lista")} style={{ padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: vista === "lista" ? "#7c3aed" : "#f3f4f6", color: vista === "lista" ? "#fff" : "#555" }}>Lista</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
        {COLUMNAS.map(col => {
          const count = leadsFiltrados.filter(l => getColumna(l.id) === col).length;
          return (
            <div key={col} style={{ background: "#fff", borderRadius: 12, padding: "1rem", border: "1px solid #f0f0f0", borderTop: `3px solid ${COLUMNA_COLORS[col]}` }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: COLUMNA_COLORS[col], margin: 0 }}>{count}</p>
              <p style={{ fontSize: 11, color: "#888", margin: 0, marginTop: 2 }}>{COLUMNA_LABELS[col]}</p>
            </div>
          );
        })}
      </div>
      {vista === "kanban" && (
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16 }}>
          {COLUMNAS.map(col => {
            const leadsCol = leadsFiltrados.filter(l => getColumna(l.id) === col);
            return (
              <div key={col} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (dragging) moverLead(dragging.id, col); setDragging(null); }} style={{ minWidth: 220, background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", flexShrink: 0 }}>
                <div style={{ padding: "12px 14px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLUMNA_COLORS[col] }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>{COLUMNA_LABELS[col]}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, background: "#f3f4f6", color: "#888", padding: "1px 7px", borderRadius: 999, fontWeight: 700 }}>{leadsCol.length}</span>
                </div>
                <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8, minHeight: 80 }}>
                  {leadsCol.map(lead => (
                    <div key={lead.id} draggable onDragStart={() => setDragging(lead)} onDragEnd={() => setDragging(null)} style={{ background: "#f8f9fa", borderRadius: 10, padding: "10px 12px", cursor: "grab", border: "1px solid #e5e7eb" }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: "#111", margin: 0, marginBottom: 4 }}>{lead.nombre}</p>
                      <p style={{ fontSize: 11, color: "#888", margin: 0 }}>{lead.email}</p>
                      {lead.telefono && <p style={{ fontSize: 11, color: "#888", margin: 0, marginTop: 2 }}>{lead.telefono}</p>}
                      {lead.mensaje && <p style={{ fontSize: 11, color: "#aaa", margin: 0, marginTop: 4, lineHeight: 1.4 }}>{lead.mensaje.slice(0, 60)}{lead.mensaje.length > 60 ? "..." : ""}</p>}
                      <p style={{ fontSize: 10, color: "#ccc", margin: 0, marginTop: 6 }}>{new Date(lead.created_at).toLocaleDateString("es-CO")}</p>
                      <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                        {COLUMNAS.filter(c => c !== col).map(c => (
                          <button key={c} onClick={() => moverLead(lead.id, c)} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 6, border: `1px solid ${COLUMNA_COLORS[c]}`, background: "transparent", color: COLUMNA_COLORS[c], cursor: "pointer", fontWeight: 700 }}>{COLUMNA_LABELS[c]}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {leadsCol.length === 0 && <p style={{ fontSize: 12, color: "#ccc", textAlign: "center", padding: "1rem 0" }}>Sin leads</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {vista === "lista" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #e5e7eb" }}>
                {["Nombre", "Correo", "Telefono", "Estado", "Fecha"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leadsFiltrados.map(lead => (
                <tr key={lead.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "10px 16px", fontWeight: 600, color: "#111" }}>{lead.nombre}</td>
                  <td style={{ padding: "10px 16px", color: "#555" }}>{lead.email}</td>
                  <td style={{ padding: "10px 16px", color: "#888" }}>{lead.telefono ?? "---"}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <select value={getColumna(lead.id)} onChange={e => moverLead(lead.id, e.target.value)} style={{ border: `1px solid ${COLUMNA_COLORS[getColumna(lead.id)]}`, borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700, color: COLUMNA_COLORS[getColumna(lead.id)], background: "#fff", cursor: "pointer" }}>
                      {COLUMNAS.map(c => <option key={c} value={c}>{COLUMNA_LABELS[c]}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "10px 16px", color: "#aaa", fontSize: 12 }}>{new Date(lead.created_at).toLocaleDateString("es-CO")}</td>
                </tr>
              ))}
              {leadsFiltrados.length === 0 && (
                <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#ccc" }}>No hay leads aun.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 480, boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111", marginBottom: 16 }}>Nuevo Lead</h2>
            {[["nombre","Nombre *"],["email","Correo"],["telefono","Telefono"],["empresa","Empresa"],["mensaje","Mensaje"]].map(([field, label]) => (
              <div key={field} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>{label}</label>
                <input value={(newLead as any)[field]} onChange={e => setNewLead(prev => ({ ...prev, [field]: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
              <button onClick={agregarLead} disabled={addingLead || !newLead.nombre} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: addingLead ? 0.6 : 1 }}>{addingLead ? "Guardando..." : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
