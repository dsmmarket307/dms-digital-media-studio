"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const PRECIOS: Record<string, number> = { basico: 49000, profesional: 99000, empresarial: 199000 };

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  trial:     { label: "En prueba", color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
  active:    { label: "Activa", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  past_due:  { label: "Pago pendiente", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  cancelled: { label: "Cancelada", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  expired:   { label: "Vencida", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  suspended: { label: "Suspendida", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
};

export default function SuscripcionesAdmin() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [suscripciones, setSuscripciones] = useState<any[]>([]);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (prof?.role !== "admin") { router.push("/dashboard/client"); return; }
      const { data: subs } = await supabase.from("subscriptions").select("*, profiles(name, email)").order("created_at", { ascending: false });
      setSuscripciones(subs ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleCambiarEstado(id: string, status: string) {
    await supabase.from("subscriptions").update({ status }).eq("id", id);
    setSuscripciones(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const sActivas = suscripciones.filter(s => s.status === "active");
  const sTrial = suscripciones.filter(s => s.status === "trial");
  const sVencidas = suscripciones.filter(s => s.status === "expired" || s.status === "cancelled");
  const mrr = sActivas.reduce((sum, s) => sum + (PRECIOS[s.plan] ?? 0), 0);
  const arr = mrr * 12;
  const conversionRate = suscripciones.length > 0 ? Math.round((sActivas.length / suscripciones.length) * 100) : 0;

  const filtradas = suscripciones
    .filter(s => filtro === "todos" || s.status === filtro)
    .filter(s => !busqueda || s.profiles?.name?.toLowerCase().includes(busqueda.toLowerCase()) || s.profiles?.email?.toLowerCase().includes(busqueda.toLowerCase()) || s.plan?.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <div style={{ minHeight: "100vh", background: "#f0f0f0" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <header style={{ background: "#fff", borderBottom: "1px solid rgba(124,58,237,0.1)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111", margin: 0 }}>Suscripciones</h1>
          <p style={{ color: "#888", fontSize: 12, margin: "4px 0 0" }}>Gestion de planes y clientes activos</p>
        </div>
      </header>

      <div style={{ padding: "20px 16px", maxWidth: 1100, margin: "0 auto" }}>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
          {[
            { label: "MRR", value: "$" + mrr.toLocaleString("es-CO"), color: "#059669", desc: "Ingresos mensuales" },
            { label: "ARR", value: "$" + arr.toLocaleString("es-CO"), color: "#059669", desc: "Proyeccion anual" },
            { label: "Activas", value: sActivas.length, color: "#10b981", desc: "Suscripciones activas" },
            { label: "En prueba", value: sTrial.length, color: "#7c3aed", desc: "Clientes en trial" },
            { label: "Vencidas", value: sVencidas.length, color: "#ef4444", desc: "Canceladas o vencidas" },
            { label: "Conversion", value: conversionRate + "%", color: "#3b82f6", desc: "Trial a pago" },
          ].map((m, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "16px", border: "1px solid rgba(124,58,237,0.08)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <p style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6, fontWeight: 600 }}>{m.label}</p>
              <p style={{ fontSize: "1.4rem", fontWeight: 800, color: m.color, margin: "0 0 4px" }}>{m.value}</p>
              <p style={{ fontSize: 10, color: "#aaa", margin: 0 }}>{m.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(124,58,237,0.08)", padding: "12px 16px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre, email o plan..." style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 12px", fontSize: 13, outline: "none", width: 260 }} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["todos", "trial", "active", "past_due", "cancelled", "expired"].map(f => (
              <button key={f} onClick={() => setFiltro(f)} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 999, fontWeight: 600, border: "none", cursor: "pointer", background: filtro === f ? "#7c3aed" : "#ececec", color: filtro === f ? "#fff" : "#6b7280", textTransform: "capitalize" }}>
                {f === "todos" ? "Todos" : STATUS_LABELS[f]?.label ?? f}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtradas.length === 0 && (
            <div style={{ background: "#fff", borderRadius: 12, padding: 40, textAlign: "center", color: "#888", fontSize: 13 }}>
              No hay suscripciones con estos filtros
            </div>
          )}
          {filtradas.map(s => {
            const diasTrial = s.trial_end ? Math.max(0, Math.ceil((new Date(s.trial_end).getTime() - Date.now()) / 86400000)) : 0;
            return (
              <div key={s.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e0e0e0", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#7c3aed", flexShrink: 0 }}>
                      {s.profiles?.name?.[0]?.toUpperCase() ?? "C"}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14, color: "#111", margin: 0 }}>{s.profiles?.name ?? "Cliente"}</p>
                      <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0" }}>{s.profiles?.email}</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: 10, color: "#888", textTransform: "uppercase", margin: "0 0 2px" }}>Plan</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#111", textTransform: "capitalize", margin: 0 }}>{s.plan}</p>
                      <p style={{ fontSize: 11, color: "#888", margin: 0 }}>${(PRECIOS[s.plan] ?? 0).toLocaleString("es-CO")}/mes</p>
                    </div>

                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: 10, color: "#888", textTransform: "uppercase", margin: "0 0 4px" }}>Estado</p>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: STATUS_LABELS[s.status]?.bg, color: STATUS_LABELS[s.status]?.color }}>
                        {STATUS_LABELS[s.status]?.label ?? s.status}
                      </span>
                    </div>

                    {s.status === "trial" && (
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: 10, color: "#888", textTransform: "uppercase", margin: "0 0 2px" }}>Trial</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: diasTrial <= 2 ? "#ef4444" : "#7c3aed", margin: 0 }}>{diasTrial} dias</p>
                      </div>
                    )}

                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: 10, color: "#888", textTransform: "uppercase", margin: "0 0 2px" }}>Desde</p>
                      <p style={{ fontSize: 12, color: "#555", margin: 0 }}>{new Date(s.created_at).toLocaleDateString("es-CO")}</p>
                    </div>

                    <select value={s.status} onChange={e => handleCambiarEstado(s.id, e.target.value)} style={{ fontSize: 11, padding: "5px 10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fafafa", color: "#333", cursor: "pointer" }}>
                      <option value="trial">En prueba</option>
                      <option value="active">Activa</option>
                      <option value="past_due">Pago pendiente</option>
                      <option value="suspended">Suspendida</option>
                      <option value="cancelled">Cancelada</option>
                      <option value="expired">Vencida</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}