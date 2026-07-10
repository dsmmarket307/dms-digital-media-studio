"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const COLUMNAS = ["nuevo", "contactado", "propuesta", "negociacion", "ganado", "perdido"];
const COLUMNA_LABELS: Record<string, string> = { nuevo: "Nuevo", contactado: "Contactado", propuesta: "Propuesta", negociacion: "Negociacion", ganado: "Ganado", perdido: "Perdido" };
const COLUMNA_COLORS: Record<string, string> = { nuevo: "#6366f1", contactado: "#3b82f6", propuesta: "#f59e0b", negociacion: "#f97316", ganado: "#10b981", perdido: "#ef4444" };
const COLUMNA_BG: Record<string, string> = { nuevo: "#eef2ff", contactado: "#eff6ff", propuesta: "#fffbeb", negociacion: "#fff7ed", ganado: "#f0fdf4", perdido: "#fef2f2" };

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ height: 6, background: "#f0f0f0", borderRadius: 99, overflow: "hidden", marginTop: 6 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width 0.6s" }} />
    </div>
  );
}

function DonaChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div style={{ textAlign: "center", color: "#ccc", fontSize: 12, padding: "2rem" }}>Sin datos</div>;
  let offset = 0;
  const radius = 50;
  const circum = 2 * Math.PI * radius;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="#f0f0f0" strokeWidth="18" />
        {data.filter(d => d.value > 0).map((d, i) => {
          const pct = d.value / total;
          const dash = pct * circum;
          const gap = circum - dash;
          const el = (
            <circle key={i} cx="65" cy="65" r={radius} fill="none" stroke={d.color} strokeWidth="18"
              strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset * circum}
              style={{ transform: "rotate(-90deg)", transformOrigin: "65px 65px" }} />
          );
          offset += pct;
          return el;
        })}
        <text x="65" y="65" textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="800" fill="#111">{total}</text>
        <text x="65" y="80" textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#888">leads</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "#555" }}>{d.label}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#111", marginLeft: "auto" }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100, padding: "0 4px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 9, color: "#888", fontWeight: 700 }}>{d.value}</span>
          <div style={{ width: "100%", background: `rgba(124,58,237,${0.3 + (d.value / max) * 0.7})`, borderRadius: "4px 4px 0 0", height: `${Math.max((d.value / max) * 80, 4)}px`, transition: "height 0.6s" }} />
          <span style={{ fontSize: 9, color: "#aaa" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function CRMCliente() {
  const router = useRouter();
  const supabase = createClient();
  const [leads, setLeads] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState<any>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [vista, setVista] = useState<"dashboard" | "kanban" | "lista">("dashboard");
  const [filtro, setFiltro] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [newLead, setNewLead] = useState({ nombre: "", email: "", telefono: "", empresa: "", valor: "", mensaje: "" });
  const [addingLead, setAddingLead] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data: sub } = await supabase.from("subscriptions").select("plan").eq("user_id", user.id).maybeSingle();
      if (sub?.plan !== "empresarial") { router.push("/dashboard/client"); return; }
      const { data: l } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
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
    setNewLead({ nombre: "", email: "", telefono: "", empresa: "", valor: "", mensaje: "" });
    setShowModal(false);
    setAddingLead(false);
  }

  const leadsFiltrados = leads.filter(l => !filtro || l.nombre?.toLowerCase().includes(filtro.toLowerCase()) || l.email?.toLowerCase().includes(filtro.toLowerCase()) || l.empresa?.toLowerCase().includes(filtro.toLowerCase()));

  const totalLeads = leads.length;
  const ganados = leads.filter(l => getColumna(l.id) === "ganado").length;
  const perdidos = leads.filter(l => getColumna(l.id) === "perdido").length;
  const enProceso = leads.filter(l => !["ganado", "perdido"].includes(getColumna(l.id))).length;
  const conversion = totalLeads > 0 ? Math.round((ganados / totalLeads) * 100) : 0;

  const donaData = COLUMNAS.map(col => ({
    label: COLUMNA_LABELS[col],
    value: leads.filter(l => getColumna(l.id) === col).length,
    color: COLUMNA_COLORS[col],
  }));

  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const now = new Date();
  const barData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const mes = d.getMonth();
    const anio = d.getFullYear();
    return {
      label: meses[mes],
      value: leads.filter(l => {
        const ld = new Date(l.created_at);
        return ld.getMonth() === mes && ld.getFullYear() === anio;
      }).length,
    };
  });

  const fuenteData = Array.from(new Set(leads.map(l => l.fuente ?? "directo"))).map(f => ({
    label: f,
    value: leads.filter(l => (l.fuente ?? "directo") === f).length,
    color: f === "manual" ? "#7c3aed" : f === "web" ? "#3b82f6" : f === "whatsapp" ? "#10b981" : "#f59e0b",
  }));

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ padding: "2rem", minWidth: 0, background: "#f8f9fa", minHeight: "100vh" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; }`}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111", margin: 0 }}>CRM Pipeline</h1>
          <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>{totalLeads} leads en total — {enProceso} en proceso</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input placeholder="Buscar lead..." value={filtro} onChange={e => setFiltro(e.target.value)} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 12px", fontSize: 13, outline: "none", width: 180, background: "#fff" }} />
          {(["dashboard", "kanban", "lista"] as const).map(v => (
            <button key={v} onClick={() => setVista(v)} style={{ padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: vista === v ? "#7c3aed" : "#fff", color: vista === v ? "#fff" : "#555", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              {v === "dashboard" ? "Dashboard" : v === "kanban" ? "Kanban" : "Lista"}
            </button>
          ))}
          <button onClick={() => setShowModal(true)} style={{ padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#7c3aed", color: "#fff" }}>+ Nuevo Lead</button>
        </div>
      </div>

      {vista === "dashboard" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Total Leads", value: totalLeads, color: "#7c3aed", icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
              { label: "En Proceso", value: enProceso, color: "#3b82f6", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
              { label: "Ganados", value: ganados, color: "#10b981", icon: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" },
              { label: "Perdidos", value: perdidos, color: "#ef4444", icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
              { label: "Conversion", value: `${conversion}%`, color: "#f59e0b", icon: "M18 20V10M12 20V4M6 20v-6" },
            ].map((m, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "1.25rem", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${m.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={m.color} strokeWidth="2"><path d={m.icon}/></svg>
                  </div>
                </div>
                <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "#111", margin: 0 }}>{m.value}</p>
                <p style={{ fontSize: 12, color: "#888", margin: 0, marginTop: 4 }}>{m.label}</p>
                <MiniBar value={typeof m.value === "number" ? m.value : parseInt(m.value)} max={totalLeads || 1} color={m.color} />
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 24 }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 16 }}>Distribucion por Etapa</h3>
              <DonaChart data={donaData} />
            </div>
            <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 16 }}>Leads por Mes</h3>
              <BarChart data={barData} />
            </div>
            <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 16 }}>Por Fuente</h3>
              <DonaChart data={fuenteData.length > 0 ? fuenteData : [{ label: "Sin datos", value: 1, color: "#e5e7eb" }]} />
            </div>
            <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 16 }}>Actividad Reciente</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {leads.slice(0, 5).map((lead, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: COLUMNA_COLORS[getColumna(lead.id)] + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: COLUMNA_COLORS[getColumna(lead.id)] }}>{lead.nombre?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#111", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.nombre}</p>
                      <p style={{ fontSize: 11, color: "#888", margin: 0 }}>{lead.empresa ?? lead.email ?? "---"}</p>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: COLUMNA_COLORS[getColumna(lead.id)] + "20", color: COLUMNA_COLORS[getColumna(lead.id)], flexShrink: 0 }}>{COLUMNA_LABELS[getColumna(lead.id)]}</span>
                  </div>
                ))}
                {leads.length === 0 && <p style={{ fontSize: 12, color: "#ccc", textAlign: "center" }}>Sin actividad reciente</p>}
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 16 }}>Resumen del Pipeline</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {COLUMNAS.map(col => {
                const count = leads.filter(l => getColumna(l.id) === col).length;
                const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                return (
                  <div key={col} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#555", width: 100, flexShrink: 0 }}>{COLUMNA_LABELS[col]}</span>
                    <div style={{ flex: 1, height: 8, background: "#f0f0f0", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: COLUMNA_COLORS[col], borderRadius: 99, transition: "width 0.6s" }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#111", width: 30, textAlign: "right" }}>{count}</span>
                    <span style={{ fontSize: 11, color: "#aaa", width: 35, textAlign: "right" }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {vista === "kanban" && (
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16 }}>
          {COLUMNAS.map(col => {
            const leadsCol = leadsFiltrados.filter(l => getColumna(l.id) === col);
            return (
              <div key={col} onDragOver={e => { e.preventDefault(); setDragOver(col); }} onDragLeave={() => setDragOver(null)} onDrop={e => { e.preventDefault(); if (dragging) moverLead(dragging.id, col); setDragging(null); setDragOver(null); }} style={{ minWidth: 240, background: dragOver === col ? COLUMNA_BG[col] : "#fff", borderRadius: 14, border: `2px solid ${dragOver === col ? COLUMNA_COLORS[col] : "#e5e7eb"}`, display: "flex", flexDirection: "column", flexShrink: 0, transition: "all 0.2s" }}>
                <div style={{ padding: "12px 14px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 8, background: COLUMNA_BG[col], borderRadius: "12px 12px 0 0" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLUMNA_COLORS[col] }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: COLUMNA_COLORS[col] }}>{COLUMNA_LABELS[col]}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, background: COLUMNA_COLORS[col], color: "#fff", padding: "1px 8px", borderRadius: 999, fontWeight: 700 }}>{leadsCol.length}</span>
                </div>
                <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8, minHeight: 100, flex: 1 }}>
                  {leadsCol.map(lead => (
                    <div key={lead.id} draggable onDragStart={() => setDragging(lead)} onDragEnd={() => { setDragging(null); setDragOver(null); }} onClick={() => setSelectedLead(lead)} style={{ background: "#fff", borderRadius: 10, padding: "12px", cursor: "grab", border: "1px solid #e5e7eb", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", transition: "box-shadow 0.2s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: COLUMNA_COLORS[getColumna(lead.id)] + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: COLUMNA_COLORS[getColumna(lead.id)] }}>{lead.nombre?.charAt(0)?.toUpperCase()}</span>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontWeight: 700, fontSize: 12, color: "#111", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.nombre}</p>
                          {lead.empresa && <p style={{ fontSize: 10, color: "#888", margin: 0 }}>{lead.empresa}</p>}
                        </div>
                      </div>
                      {lead.email && <p style={{ fontSize: 11, color: "#888", margin: 0, marginBottom: 2 }}>{lead.email}</p>}
                      {lead.telefono && <p style={{ fontSize: 11, color: "#888", margin: 0 }}>{lead.telefono}</p>}
                      {lead.mensaje && <p style={{ fontSize: 10, color: "#aaa", margin: 0, marginTop: 6, lineHeight: 1.4 }}>{lead.mensaje.slice(0, 60)}{lead.mensaje.length > 60 ? "..." : ""}</p>}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                        <span style={{ fontSize: 10, color: "#ccc" }}>{new Date(lead.created_at).toLocaleDateString("es-CO")}</span>
                        <span style={{ fontSize: 9, color: lead.fuente === "web" ? "#3b82f6" : lead.fuente === "whatsapp" ? "#10b981" : "#7c3aed", fontWeight: 700, background: lead.fuente === "web" ? "#eff6ff" : lead.fuente === "whatsapp" ? "#f0fdf4" : "#f5f3ff", padding: "1px 6px", borderRadius: 999 }}>{lead.fuente ?? "manual"}</span>
                      </div>
                    </div>
                  ))}
                  {leadsCol.length === 0 && <div style={{ padding: "1.5rem", textAlign: "center", border: "2px dashed #e5e7eb", borderRadius: 10 }}><p style={{ fontSize: 12, color: "#ccc", margin: 0 }}>Arrastra aqui</p></div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {vista === "lista" && (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #e5e7eb" }}>
                {["Nombre", "Empresa", "Correo", "Telefono", "Fuente", "Etapa", "Fecha"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leadsFiltrados.map(lead => (
                <tr key={lead.id} onClick={() => setSelectedLead(lead)} style={{ borderBottom: "1px solid #f0f0f0", cursor: "pointer" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: COLUMNA_COLORS[getColumna(lead.id)] + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: COLUMNA_COLORS[getColumna(lead.id)] }}>{lead.nombre?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <span style={{ fontWeight: 600, color: "#111" }}>{lead.nombre}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#555" }}>{lead.empresa ?? "---"}</td>
                  <td style={{ padding: "12px 16px", color: "#555" }}>{lead.email ?? "---"}</td>
                  <td style={{ padding: "12px 16px", color: "#888" }}>{lead.telefono ?? "---"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: lead.fuente === "web" ? "#eff6ff" : lead.fuente === "whatsapp" ? "#f0fdf4" : "#f5f3ff", color: lead.fuente === "web" ? "#3b82f6" : lead.fuente === "whatsapp" ? "#10b981" : "#7c3aed" }}>{lead.fuente ?? "manual"}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <select value={getColumna(lead.id)} onChange={e => { e.stopPropagation(); moverLead(lead.id, e.target.value); }} style={{ border: `1px solid ${COLUMNA_COLORS[getColumna(lead.id)]}`, borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700, color: COLUMNA_COLORS[getColumna(lead.id)], background: COLUMNA_BG[getColumna(lead.id)], cursor: "pointer" }}>
                      {COLUMNAS.map(c => <option key={c} value={c}>{COLUMNA_LABELS[c]}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#aaa", fontSize: 12 }}>{new Date(lead.created_at).toLocaleDateString("es-CO")}</td>
                </tr>
              ))}
              {leadsFiltrados.length === 0 && (
                <tr><td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#ccc" }}>No hay leads aun.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedLead && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "flex-end" }} onClick={() => setSelectedLead(null)}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 420, height: "100vh", overflowY: "auto", padding: 24, boxShadow: "-4px 0 24px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111", margin: 0 }}>Detalle del Lead</h2>
              <button onClick={() => setSelectedLead(null)} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>x</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "1rem", background: "#f8f9fa", borderRadius: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: COLUMNA_COLORS[getColumna(selectedLead.id)] + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: COLUMNA_COLORS[getColumna(selectedLead.id)] }}>{selectedLead.nombre?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: "#111", margin: 0 }}>{selectedLead.nombre}</p>
                <p style={{ fontSize: 12, color: "#888", margin: 0 }}>{selectedLead.empresa ?? "Sin empresa"}</p>
              </div>
            </div>
            {[
              { label: "Correo", value: selectedLead.email },
              { label: "Telefono", value: selectedLead.telefono },
              { label: "Empresa", value: selectedLead.empresa },
              { label: "Fuente", value: selectedLead.fuente ?? "manual" },
              { label: "Fecha", value: new Date(selectedLead.created_at).toLocaleDateString("es-CO") },
            ].map(({ label, value }) => value ? (
              <div key={label} style={{ marginBottom: 12, padding: "10px 14px", background: "#f8f9fa", borderRadius: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, margin: 0, marginBottom: 2 }}>{label}</p>
                <p style={{ fontSize: 13, color: "#111", margin: 0, fontWeight: 600 }}>{value}</p>
              </div>
            ) : null)}
            {selectedLead.mensaje && (
              <div style={{ marginBottom: 12, padding: "10px 14px", background: "#f8f9fa", borderRadius: 10 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, margin: 0, marginBottom: 2 }}>Mensaje</p>
                <p style={{ fontSize: 13, color: "#555", margin: 0, lineHeight: 1.6 }}>{selectedLead.mensaje}</p>
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, marginBottom: 8 }}>Mover a etapa</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {COLUMNAS.map(col => (
                  <button key={col} onClick={() => { moverLead(selectedLead.id, col); setSelectedLead((prev: any) => ({ ...prev })); }} style={{ padding: "8px", borderRadius: 8, border: `2px solid ${getColumna(selectedLead.id) === col ? COLUMNA_COLORS[col] : "#e5e7eb"}`, background: getColumna(selectedLead.id) === col ? COLUMNA_BG[col] : "#fff", color: COLUMNA_COLORS[col], fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    {COLUMNA_LABELS[col]}
                  </button>
                ))}
              </div>
            </div>
            {selectedLead.telefono && (
              <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
                <a href={`https://wa.me/${selectedLead.telefono.replace(/\D/g, "")}`} target="_blank" style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#25D366", color: "#fff", textDecoration: "none", textAlign: "center", fontSize: 13, fontWeight: 700 }}>WhatsApp</a>
                <a href={`tel:${selectedLead.telefono}`} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#3b82f6", color: "#fff", textDecoration: "none", textAlign: "center", fontSize: 13, fontWeight: 700 }}>Llamar</a>
              </div>
            )}
          </div>
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