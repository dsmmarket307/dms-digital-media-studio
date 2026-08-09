"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

const CATEGORIAS_INGRESO = ["Venta", "Servicio", "Anticipo", "Otro ingreso"];
const CATEGORIAS_EGRESO = ["Insumos", "Arriendo", "Nomina", "Servicios publicos", "Marketing", "Transporte", "Otro gasto"];

function formatCOP(n: number) {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

function DonaChart({ ingresos, egresos }: { ingresos: number; egresos: number }) {
  const total = ingresos + egresos;
  if (total === 0) return <div style={{ textAlign: "center", color: "#ccc", fontSize: 12, padding: "2rem" }}>Sin movimientos</div>;
  const pctIngreso = ingresos / total;
  const radius = 50;
  const circum = 2 * Math.PI * radius;
  const dashIngreso = pctIngreso * circum;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="#f0f0f0" strokeWidth="18" />
        <circle cx="65" cy="65" r={radius} fill="none" stroke="#ef4444" strokeWidth="18" strokeDasharray={`${circum} ${circum}`} style={{ transform: "rotate(-90deg)", transformOrigin: "65px 65px" }} />
        <circle cx="65" cy="65" r={radius} fill="none" stroke="#10b981" strokeWidth="18" strokeDasharray={`${dashIngreso} ${circum - dashIngreso}`} style={{ transform: "rotate(-90deg)", transformOrigin: "65px 65px" }} />
        <text x="65" y="62" textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="800" fill="#111">{formatCOP(ingresos - egresos)}</text>
        <text x="65" y="78" textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#888">balance</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: "#10b981", flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "#555" }}>Ingresos</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#111", marginLeft: "auto" }}>{formatCOP(ingresos)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: "#ef4444", flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "#555" }}>Egresos</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#111", marginLeft: "auto" }}>{formatCOP(egresos)}</span>
        </div>
      </div>
    </div>
  );
}

function BarChart({ data }: { data: { label: string; ingreso: number; egreso: number }[] }) {
  const max = Math.max(...data.map(d => Math.max(d.ingreso, d.egreso)), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120, padding: "0 4px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 90 }}>
            <div title={`Ingresos: ${formatCOP(d.ingreso)}`} style={{ width: 10, background: "#10b981", borderRadius: "3px 3px 0 0", height: `${Math.max((d.ingreso / max) * 85, d.ingreso > 0 ? 4 : 0)}px` }} />
            <div title={`Egresos: ${formatCOP(d.egreso)}`} style={{ width: 10, background: "#ef4444", borderRadius: "3px 3px 0 0", height: `${Math.max((d.egreso / max) * 85, d.egreso > 0 ? 4 : 0)}px` }} />
          </div>
          <span style={{ fontSize: 9, color: "#aaa" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function FinanzasPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState<string>("");
  const [movimientos, setMovimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "ingreso" | "egreso">("todos");
  const [filtroMes, setFiltroMes] = useState("todos");
  const [form, setForm] = useState({ tipo: "ingreso", concepto: "", categoria: "", monto: "", fecha: new Date().toISOString().slice(0, 10), notas: "" });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUserId(user.id);
      const { data } = await supabase.from("movimientos_manuales").select("*").eq("user_id", user.id).order("fecha", { ascending: false });
      setMovimientos(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function guardarMovimiento() {
    if (!form.concepto || !form.monto) return;
    setSaving(true);
    const { data, error } = await supabase.from("movimientos_manuales").insert({
      user_id: userId,
      tipo: form.tipo,
      concepto: form.concepto,
      categoria: form.categoria || null,
      monto: Number(form.monto),
      fecha: form.fecha,
      notas: form.notas || null,
    }).select().single();
    if (!error && data) {
      setMovimientos(prev => [data, ...prev].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()));
      setForm({ tipo: "ingreso", concepto: "", categoria: "", monto: "", fecha: new Date().toISOString().slice(0, 10), notas: "" });
      setShowModal(false);
    } else if (error) {
      alert("Error al guardar: " + error.message);
    }
    setSaving(false);
  }

  async function eliminarMovimiento(id: string) {
    if (!confirm("Eliminar este movimiento?")) return;
    await supabase.from("movimientos_manuales").delete().eq("id", id);
    setMovimientos(prev => prev.filter(m => m.id !== id));
  }

  const movimientosFiltrados = movimientos.filter(m => {
    if (filtroTipo !== "todos" && m.tipo !== filtroTipo) return false;
    if (filtroMes !== "todos") {
      const mesM = new Date(m.fecha).getMonth() + "-" + new Date(m.fecha).getFullYear();
      if (mesM !== filtroMes) return false;
    }
    return true;
  });

  const totalIngresos = movimientos.filter(m => m.tipo === "ingreso").reduce((s, m) => s + Number(m.monto), 0);
  const totalEgresos = movimientos.filter(m => m.tipo === "egreso").reduce((s, m) => s + Number(m.monto), 0);
  const balance = totalIngresos - totalEgresos;

  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const now = new Date();
  const barData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const mes = d.getMonth();
    const anio = d.getFullYear();
    const delMes = movimientos.filter(m => { const md = new Date(m.fecha); return md.getMonth() === mes && md.getFullYear() === anio; });
    return {
      label: meses[mes],
      ingreso: delMes.filter(m => m.tipo === "ingreso").reduce((s, m) => s + Number(m.monto), 0),
      egreso: delMes.filter(m => m.tipo === "egreso").reduce((s, m) => s + Number(m.monto), 0),
    };
  });

  const mesesDisponibles = Array.from(new Set(movimientos.map(m => { const d = new Date(m.fecha); return d.getMonth() + "-" + d.getFullYear(); } ))).map(key => {
    const [mes, anio] = key.split("-").map(Number);
    return { key, label: `${meses[mes]} ${anio}` };
  });

  function exportarExcel() {
    const rows = movimientosFiltrados.map(m => ({
      Fecha: new Date(m.fecha).toLocaleDateString("es-CO"),
      Tipo: m.tipo === "ingreso" ? "Ingreso" : "Egreso",
      Concepto: m.concepto,
      Categoria: m.categoria ?? "",
      Monto: Number(m.monto),
      Notas: m.notas ?? "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 12 }, { wch: 10 }, { wch: 30 }, { wch: 18 }, { wch: 14 }, { wch: 30 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Movimientos");
    const resumen = [
      { Concepto: "Total Ingresos", Valor: totalIngresos },
      { Concepto: "Total Egresos", Valor: totalEgresos },
      { Concepto: "Balance", Valor: balance },
    ];
    const wsResumen = XLSX.utils.json_to_sheet(resumen);
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");
    XLSX.writeFile(wb, `finanzas_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img src="/favicon-32.png" alt="Cargando" style={{ width: 44, height: 44, animation: "spin 1s linear infinite", borderRadius: 10 }} />      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ padding: "2rem", minWidth: 0, background: "#f8f9fa", minHeight: "100vh" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; }`}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111", margin: 0 }}>Finanzas</h1>
          <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Controla los ingresos y egresos de tu negocio</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={exportarExcel} style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid #e5e7eb", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#fff", color: "#555" }}>Exportar Excel</button>
          <button onClick={() => setShowModal(true)} style={{ padding: "9px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#7c3aed", color: "#fff" }}>+ Nuevo Movimiento</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Ingresos Totales", value: totalIngresos, color: "#10b981" },
          { label: "Egresos Totales", value: totalEgresos, color: "#ef4444" },
          { label: "Balance", value: balance, color: balance >= 0 ? "#7c3aed" : "#ef4444" },
        ].map((m, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "1.25rem", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
            <p style={{ fontSize: 12, color: "#888", margin: 0 }}>{m.label}</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 800, color: m.color, margin: 0, marginTop: 6 }}>{formatCOP(m.value)}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 16 }}>Ingresos vs Egresos</h3>
          <DonaChart ingresos={totalIngresos} egresos={totalEgresos} />
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", border: "1px solid #f0f0f0" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 16 }}>Ultimos 6 meses</h3>
          <BarChart data={barData} />
          <div style={{ display: "flex", gap: 16, marginTop: 8, justifyContent: "center" }}>
            <span style={{ fontSize: 10, color: "#555" }}><span style={{ display: "inline-block", width: 8, height: 8, background: "#10b981", borderRadius: 2, marginRight: 4 }} />Ingresos</span>
            <span style={{ fontSize: 10, color: "#555" }}><span style={{ display: "inline-block", width: 8, height: 8, background: "#ef4444", borderRadius: 2, marginRight: 4 }} />Egresos</span>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: "#111", margin: 0 }}>Movimientos</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value as any)} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 10px", fontSize: 12, outline: "none" }}>
              <option value="todos">Todos los tipos</option>
              <option value="ingreso">Ingresos</option>
              <option value="egreso">Egresos</option>
            </select>
            <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 10px", fontSize: 12, outline: "none" }}>
              <option value="todos">Todos los meses</option>
              {mesesDisponibles.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #e5e7eb" }}>
              {["Fecha", "Tipo", "Concepto", "Categoria", "Monto", ""].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movimientosFiltrados.map(m => (
              <tr key={m.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "10px 16px", color: "#888" }}>{new Date(m.fecha).toLocaleDateString("es-CO")}</td>
                <td style={{ padding: "10px 16px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: m.tipo === "ingreso" ? "#d1fae5" : "#fee2e2", color: m.tipo === "ingreso" ? "#059669" : "#dc2626" }}>
                    {m.tipo === "ingreso" ? "Ingreso" : "Egreso"}
                  </span>
                </td>
                <td style={{ padding: "10px 16px", fontWeight: 600, color: "#111" }}>{m.concepto}</td>
                <td style={{ padding: "10px 16px", color: "#888" }}>{m.categoria ?? "---"}</td>
                <td style={{ padding: "10px 16px", fontWeight: 700, color: m.tipo === "ingreso" ? "#059669" : "#dc2626" }}>{m.tipo === "ingreso" ? "+" : "-"}{formatCOP(Number(m.monto))}</td>
                <td style={{ padding: "10px 16px" }}>
                  <button onClick={() => eliminarMovimiento(m.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 14 }} title="Eliminar">x</button>
                </td>
              </tr>
            ))}
            {movimientosFiltrados.length === 0 && (
              <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#ccc" }}>No hay movimientos registrados aun.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 460, boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111", marginBottom: 16 }}>Nuevo Movimiento</h2>

            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {(["ingreso", "egreso"] as const).map(t => (
                <button key={t} onClick={() => setForm(prev => ({ ...prev, tipo: t, categoria: "" }))} style={{ flex: 1, padding: "9px", borderRadius: 8, border: `2px solid ${form.tipo === t ? (t === "ingreso" ? "#10b981" : "#ef4444") : "#e5e7eb"}`, background: form.tipo === t ? (t === "ingreso" ? "#d1fae5" : "#fee2e2") : "#fff", color: form.tipo === t ? (t === "ingreso" ? "#059669" : "#dc2626") : "#888", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  {t === "ingreso" ? "Ingreso" : "Egreso"}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Concepto *</label>
              <input value={form.concepto} onChange={e => setForm(prev => ({ ...prev, concepto: e.target.value }))} placeholder="Ej: Venta de producto, Pago de arriendo" style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Categoria</label>
              <select value={form.categoria} onChange={e => setForm(prev => ({ ...prev, categoria: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }}>
                <option value="">Sin categoria</option>
                {(form.tipo === "ingreso" ? CATEGORIAS_INGRESO : CATEGORIAS_EGRESO).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Monto *</label>
                <input type="number" value={form.monto} onChange={e => setForm(prev => ({ ...prev, monto: e.target.value }))} placeholder="0" style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Fecha</label>
                <input type="date" value={form.fecha} onChange={e => setForm(prev => ({ ...prev, fecha: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Notas</label>
              <textarea value={form.notas} onChange={e => setForm(prev => ({ ...prev, notas: e.target.value }))} rows={2} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const, resize: "vertical" as const }} />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
              <button onClick={guardarMovimiento} disabled={saving || !form.concepto || !form.monto} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>{saving ? "Guardando..." : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
