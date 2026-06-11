"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Reservas() {
  const router = useRouter();
  const supabase = createClient();
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [form, setForm] = useState({ nombre: "", telefono: "", fecha: "", hora: "", personas: "", estado: "pendiente" });
  const [saving, setSaving] = useState(false);

  const ESTADO_COLORS: Record<string, string> = { pendiente: "#F59E0B", confirmada: "#10B981", cancelada: "#EF4444" };
  const ESTADOS = ["pendiente", "confirmada", "cancelada"];

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUserId(user.id);
      const { data } = await supabase.from("reservas").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setReservas(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  function abrirNuevo() {
    setEditando(null);
    setForm({ nombre: "", telefono: "", fecha: "", hora: "", personas: "", estado: "pendiente" });
    setShowModal(true);
  }

  function abrirEditar(r: any) {
    setEditando(r);
    setForm({ nombre: r.nombre ?? "", telefono: r.telefono ?? "", fecha: r.fecha ?? "", hora: r.hora ?? "", personas: r.personas ?? "", estado: r.estado ?? "pendiente" });
    setShowModal(true);
  }

  async function guardar() {
    if (!form.nombre) return;
    setSaving(true);
    if (editando) {
      const { data } = await supabase.from("reservas").update({ nombre: form.nombre, telefono: form.telefono, fecha: form.fecha || null, hora: form.hora || null, personas: form.personas ? Number(form.personas) : null, estado: form.estado }).eq("id", editando.id).select().single();
      if (data) setReservas(prev => prev.map(r => r.id === editando.id ? data : r));
    } else {
      const { data } = await supabase.from("reservas").insert({ nombre: form.nombre, telefono: form.telefono, fecha: form.fecha || null, hora: form.hora || null, personas: form.personas ? Number(form.personas) : null, estado: form.estado, user_id: userId }).select().single();
      if (data) setReservas(prev => [data, ...prev]);
    }
    setShowModal(false);
    setSaving(false);
  }

  async function eliminar(id: number) {
    if (!confirm("Eliminar esta reserva?")) return;
    await supabase.from("reservas").delete().eq("id", id);
    setReservas(prev => prev.filter(r => r.id !== id));
  }

  async function cambiarEstado(id: number, estado: string) {
    await supabase.from("reservas").update({ estado }).eq("id", id);
    setReservas(prev => prev.map(r => r.id === id ? { ...r, estado } : r));
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ padding: "2rem", minWidth: 0 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111", margin: 0 }}>Reservas</h1>
          <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Reservas recibidas en tu sitio web.</p>
        </div>
        <button onClick={abrirNuevo} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Nueva Reserva</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
        {[
          { label: "Total", value: reservas.length, color: "#7c3aed" },
          { label: "Pendientes", value: reservas.filter(r => r.estado === "pendiente").length, color: "#F59E0B" },
          { label: "Confirmadas", value: reservas.filter(r => r.estado === "confirmada").length, color: "#10B981" },
          { label: "Canceladas", value: reservas.filter(r => r.estado === "cancelada").length, color: "#EF4444" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "1rem" }}>
            <p style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "#888", margin: 0, marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #e5e7eb" }}>
              {["Nombre", "Telefono", "Fecha", "Hora", "Personas", "Estado", "Acciones"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reservas.map(r => (
              <tr key={r.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "10px 16px", fontWeight: 700, color: "#111" }}>{r.nombre}</td>
                <td style={{ padding: "10px 16px", color: "#555" }}>{r.telefono ?? "---"}</td>
                <td style={{ padding: "10px 16px", color: "#888" }}>{r.fecha ? new Date(r.fecha).toLocaleDateString("es-CO") : "---"}</td>
                <td style={{ padding: "10px 16px", color: "#888" }}>{r.hora ?? "---"}</td>
                <td style={{ padding: "10px 16px", color: "#888" }}>{r.personas ?? "---"}</td>
                <td style={{ padding: "10px 16px" }}>
                  <select value={r.estado} onChange={e => cambiarEstado(r.id, e.target.value)} style={{ border: `1px solid ${ESTADO_COLORS[r.estado] ?? "#6b7280"}`, borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700, color: ESTADO_COLORS[r.estado] ?? "#6b7280", background: "#fff", cursor: "pointer" }}>
                    {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </td>
                <td style={{ padding: "10px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => abrirEditar(r)} style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Editar</button>
                    <button onClick={() => eliminar(r.id)} style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {reservas.length === 0 && (
              <tr><td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#ccc" }}>No hay reservas aun.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 480, boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111", marginBottom: 16 }}>{editando ? "Editar Reserva" : "Nueva Reserva"}</h2>
            {[["nombre","Nombre *"],["telefono","Telefono"],["personas","Personas"]].map(([field, label]) => (
              <div key={field} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>{label}</label>
                <input value={(form as any)[field]} onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
              </div>
            ))}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Fecha</label>
              <input type="date" value={form.fecha} onChange={e => setForm(prev => ({ ...prev, fecha: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Hora</label>
              <input type="time" value={form.hora} onChange={e => setForm(prev => ({ ...prev, hora: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Estado</label>
              <select value={form.estado} onChange={e => setForm(prev => ({ ...prev, estado: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }}>
                {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
              <button onClick={guardar} disabled={saving || !form.nombre} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>{saving ? "Guardando..." : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
