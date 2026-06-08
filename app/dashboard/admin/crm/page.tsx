"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ESTADOS = ["nuevo", "pendiente", "contactado", "propuesta enviada", "seguimiento", "negociacion", "ganado", "perdido"];
const ESTADO_COLORS: Record<string, string> = {
  nuevo: "#6366f1", pendiente: "#8B5CF6", contactado: "#3B82F6",
  "propuesta enviada": "#F59E0B", seguimiento: "#EC4899",
  negociacion: "#F97316", ganado: "#10B981", perdido: "#EF4444",
};
const PRIORIDAD_COLORS: Record<string, string> = { alta: "#EF4444", media: "#F59E0B", baja: "#10B981" };

function Avatar({ nombre }: { nombre: string }) {
  const initials = nombre.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const colors = ["#7c3aed","#3b82f6","#10b981","#f59e0b","#ef4444","#ec4899","#6366f1","#f97316"];
  const color = colors[nombre.charCodeAt(0) % colors.length];
  return (
    <div style={{ width:44, height:44, borderRadius:10, background:color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <span style={{ color:"#fff", fontWeight:800, fontSize:"0.9rem" }}>{initials}</span>
    </div>
  );
}

export default function CRMComercial() {
  const router = useRouter();
  const supabase = createClient();
  const [prospectos, setProspectos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState("todos");
  const [selected, setSelected] = useState<any>(null);
  const [observacion, setObservacion] = useState("");
  const [saving, setSaving] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data } = await supabase.from("prospectos").select("*").order("created_at", { ascending: false });
      setProspectos(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleUpdateEstado(id: string, estado: string) {
    await supabase.from("prospectos").update({ estado_crm: estado, ultimo_contacto: new Date().toISOString() }).eq("id", id);
    setProspectos(prev => prev.map(p => p.id === id ? { ...p, estado_crm: estado } : p));
    if (selected?.id === id) setSelected((s: any) => ({ ...s, estado_crm: estado }));
  }

  async function handleGuardarObservacion() {
    if (!selected || !observacion) return;
    setSaving(true);
    await supabase.from("prospectos").update({ observaciones: observacion }).eq("id", selected.id);
    await supabase.from("seguimientos").insert({ prospecto_id: selected.id, observaciones: observacion, fecha: new Date().toISOString() });
    setProspectos(prev => prev.map(p => p.id === selected.id ? { ...p, observaciones: observacion } : p));
    setSelected((s: any) => ({ ...s, observaciones: observacion }));
    setObservacion("");
    setSaving(false);
  }

  const filtrados = prospectos
    .filter(p => filtroEstado === "todos" || p.estado_crm === filtroEstado)
    .filter(p => filtroPrioridad === "todos" || p.prioridad === filtroPrioridad)
    .filter(p => !busqueda || p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || p.ciudad?.toLowerCase().includes(busqueda.toLowerCase()));

  const stats = [
    { label: "Total", value: prospectos.length, color: "#7c3aed" },
    { label: "Nuevos", value: prospectos.filter(p => p.estado_crm === "nuevo").length, color: "#6366f1" },
    { label: "En proceso", value: prospectos.filter(p => ["contactado","propuesta enviada","negociacion"].includes(p.estado_crm)).length, color: "#F59E0B" },
    { label: "Ganados", value: prospectos.filter(p => p.estado_crm === "ganado").length, color: "#10B981" },
    { label: "Perdidos", value: prospectos.filter(p => p.estado_crm === "perdido").length, color: "#EF4444" },
  ];

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:40, height:40, border:"3px solid #e9d5ff", borderTopColor:"#7c3aed", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#e8e8e8", padding:"0" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <header style={{ background:"#fff", borderBottom:"1px solid rgba(124,58,237,0.1)", padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, position:"sticky", top:0, zIndex:10 }}>
        <div>
          <h1 style={{ fontSize:"1.25rem", fontWeight:800, color:"#111", margin:0 }}>CRM Comercial</h1>
          <p style={{ color:"#888", fontSize:12, margin:"4px 0 0" }}>Administra tus prospectos y oportunidades</p>
        </div>
        <Link href="/dashboard/admin/prospeccion" style={{ background:"#7c3aed", color:"#fff", padding:"8px 18px", borderRadius:10, fontSize:13, fontWeight:700, textDecoration:"none" }}>
          + Nuevo prospecto
        </Link>
      </header>

      <div style={{ padding:"20px 16px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(110px, 1fr))", gap:10, marginBottom:16 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background:"#fff", borderRadius:12, border:"1px solid rgba(124,58,237,0.08)", padding:"14px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize:"1.5rem", fontWeight:800, color:s.color, margin:0 }}>{s.value}</p>
              <p style={{ fontSize:11, color:"#888", margin:"4px 0 0" }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div style={{ background:"#fff", borderRadius:12, border:"1px solid rgba(124,58,237,0.08)", padding:"12px 16px", marginBottom:16, display:"flex", flexWrap:"wrap", gap:10, alignItems:"center" }}>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre o ciudad..." style={{ border:"1px solid #e5e7eb", borderRadius:8, padding:"6px 12px", fontSize:13, outline:"none", width:220 }} />
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {["todos", ...ESTADOS].map(e => (
              <button key={e} onClick={() => setFiltroEstado(e)} style={{ fontSize:11, padding:"4px 10px", borderRadius:999, fontWeight:600, border:"none", cursor:"pointer", background: filtroEstado===e ? "#7c3aed" : "#ececec", color: filtroEstado===e ? "#fff" : "#6b7280", textTransform:"capitalize" }}>
                {e === "todos" ? "Todos" : e}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {["todos","alta","media","baja"].map(p => (
              <button key={p} onClick={() => setFiltroPrioridad(p)} style={{ fontSize:11, padding:"4px 10px", borderRadius:999, fontWeight:600, border:"none", cursor:"pointer", background: filtroPrioridad===p ? "#0f172a" : "#ececec", color: filtroPrioridad===p ? "#fff" : "#6b7280", textTransform:"capitalize" }}>
                {p === "todos" ? "Todas" : p}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns: selected ? "1fr 320px" : "1fr", gap:14, alignItems:"start" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {filtrados.length === 0 && (
              <div style={{ background:"#fff", borderRadius:12, padding:"40px", textAlign:"center", color:"#888", fontSize:13 }}>No hay prospectos con estos filtros</div>
            )}
            {filtrados.map(p => {
              const score = p.score_ia ?? p.puntaje_digital ?? null;
              return (
                <div key={p.id} onClick={() => setSelected(selected?.id === p.id ? null : p)} style={{ background:"#fff", borderRadius:12, border:"1px solid #e0e0e0", borderLeft:`4px solid ${ESTADO_COLORS[p.estado_crm] ?? "#e5e7eb"}`, padding:"12px 14px", cursor:"pointer", transition:"all .2s", boxShadow: selected?.id===p.id ? "0 0 0 2px #7c3aed44" : "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Avatar nombre={p.nombre ?? "?"} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                        <p style={{ fontWeight:800, color:"#111", fontSize:13, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.nombre}</p>
                        {p.prioridad && <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:999, background:`${PRIORIDAD_COLORS[p.prioridad]}22`, color:PRIORIDAD_COLORS[p.prioridad] ?? "#888", flexShrink:0 }}>{p.prioridad}</span>}
                        {score && <span style={{ fontSize:10, fontWeight:700, color:"#7c3aed", flexShrink:0 }}>{score}/100</span>}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"#999", flexWrap:"wrap", marginBottom:6 }}>
                        {p.categoria && <span>{p.categoria}</span>}
                        {p.ciudad && <><span>•</span><span>{p.ciudad}</span></>}
                        {p.telefono && <><span>•</span><span>{p.telefono}</span></>}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                        <select value={p.estado_crm ?? "nuevo"} onChange={e => { e.stopPropagation(); handleUpdateEstado(p.id, e.target.value); }} onClick={e => e.stopPropagation()} style={{ fontSize:11, padding:"3px 8px", borderRadius:8, border:"1px solid #e5e7eb", background:"#fafafa", color:"#333", cursor:"pointer" }}>
                          {ESTADOS.map(est => <option key={est} value={est}>{est}</option>)}
                        </select>
                        {p.sitio_web && <a href={p.sitio_web} target="_blank" onClick={e => e.stopPropagation()} style={{ fontSize:11, color:"#3b82f6", textDecoration:"none", fontWeight:600 }}>🌐 Web</a>}
                        {p.instagram && <a href={`https://instagram.com/${p.instagram.replace("@","")}`} target="_blank" onClick={e => e.stopPropagation()} style={{ fontSize:11, color:"#ec4899", textDecoration:"none", fontWeight:600 }}>📷 IG</a>}
                        {p.facebook && <a href={p.facebook.startsWith("http") ? p.facebook : `https://facebook.com/${p.facebook}`} target="_blank" onClick={e => e.stopPropagation()} style={{ fontSize:11, color:"#3b82f6", textDecoration:"none", fontWeight:600 }}>👍 FB</a>}
                        {p.whatsapp && <a href={`https://wa.me/${p.whatsapp.replace(/\D/g,"")}`} target="_blank" onClick={e => e.stopPropagation()} style={{ fontSize:11, color:"#10b981", textDecoration:"none", fontWeight:600 }}>💬 WA</a>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {selected && (
            <div style={{ background:"#fff", borderRadius:14, border:"1px solid rgba(124,58,237,0.12)", padding:"18px", position:"sticky", top:72, maxHeight:"calc(100vh - 90px)", overflowY:"auto" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <h2 style={{ fontSize:14, fontWeight:800, color:"#111", margin:0 }}>{selected.nombre}</h2>
                <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"#aaa", fontSize:20, lineHeight:1 }}>×</button>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:7, fontSize:12, color:"#555", marginBottom:14 }}>
                {selected.categoria && <span><b>Categoria:</b> {selected.categoria}</span>}
                {selected.ciudad && <span><b>Ciudad:</b> {selected.ciudad}</span>}
                {selected.telefono && <span><b>Telefono:</b> {selected.telefono}</span>}
                {selected.whatsapp && <span><b>WhatsApp:</b> <a href={`https://wa.me/${selected.whatsapp.replace(/\D/g,"")}`} target="_blank" style={{ color:"#10b981" }}>{selected.whatsapp}</a></span>}
                {selected.email && <span><b>Email:</b> {selected.email}</span>}
                {selected.sitio_web && <span><b>Web:</b> <a href={selected.sitio_web} target="_blank" style={{ color:"#3b82f6" }}>{selected.sitio_web}</a></span>}
                {selected.instagram && <span><b>Instagram:</b> <a href={`https://instagram.com/${selected.instagram.replace("@","")}`} target="_blank" style={{ color:"#ec4899" }}>{selected.instagram}</a></span>}
                {selected.facebook && <span><b>Facebook:</b> <a href={selected.facebook.startsWith("http") ? selected.facebook : `https://facebook.com/${selected.facebook}`} target="_blank" style={{ color:"#3b82f6" }}>{selected.facebook}</a></span>}
                {(selected.score_ia ?? selected.puntaje_digital) && <span><b>Score IA:</b> <span style={{ color:"#7c3aed", fontWeight:700 }}>{selected.score_ia ?? selected.puntaje_digital}/100</span></span>}
                {selected.observaciones && <span><b>Obs:</b> {selected.observaciones}</span>}
              </div>
              <textarea value={observacion} onChange={e => setObservacion(e.target.value)} placeholder="Nueva observacion..." rows={3} style={{ width:"100%", border:"1px solid #e5e7eb", borderRadius:8, padding:"8px 10px", fontSize:12, resize:"none", outline:"none", boxSizing:"border-box" }} />
              <button onClick={handleGuardarObservacion} disabled={saving || !observacion} style={{ marginTop:8, width:"100%", background: saving || !observacion ? "#f3f4f6" : "#7c3aed", color: saving || !observacion ? "#aaa" : "#fff", border:"none", borderRadius:8, padding:"9px", fontSize:13, fontWeight:700, cursor: saving || !observacion ? "not-allowed" : "pointer" }}>
                {saving ? "Guardando..." : "Guardar observacion"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}