"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LeadsCliente() {
  const router = useRouter();
  const supabase = createClient();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", mensaje: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUserId(user.id);
      const { data } = await supabase.from("leads").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setLeads(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  function abrirNuevo() {
    setEditando(null);
    setForm({ nombre: "", email: "", telefono: "", mensaje: "" });
    setShowModal(true);
  }

  function abrirEditar(lead: any) {
    setEditando(lead);
    setForm({ nombre: lead.nombre ?? "", email: lead.email ?? "", telefono: lead.telefono ?? "", mensaje: lead.mensaje ?? "" });
    setShowModal(true);
  }

  async function guardar() {
    if (!form.nombre) return;
    setSaving(true);
    if (editando) {
      const { data } = await supabase.from("leads").update({ nombre: form.nombre, email: form.email, telefono: form.telefono, mensaje: form.mensaje }).eq("id", editando.id).select().single();
      if (data) setLeads(prev => prev.map(l => l.id === editando.id ? data : l));
    } else {
      const { data } = await supabase.from("leads").insert({ nombre: form.nombre, email: form.email, telefono: form.telefono, mensaje: form.mensaje, estado: "nuevo", fuente: "manual", user_id: userId }).select().single();
      if (data) setLeads(prev => [data, ...prev]);
    }
    setShowModal(false);
    setSaving(false);
  }

  async function eliminar(id: number) {
    if (!confirm("Eliminar este lead?")) return;
    await supabase.from("leads").delete().eq("id", id);
    setLeads(prev => prev.filter(l => l.id !== id));
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
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111", margin: 0 }}>Leads</h1>
          <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Personas que han solicitado informacion sobre tu negocio.</p>
        </div>
        <button onClick={abrirNuevo} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Nuevo Lead</button>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #e5e7eb" }}>
              {["Nombre", "Correo", "Telefono", "Mensaje", "Fuente", "Fecha", "Acciones"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map(l => (
              <tr key={l.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "10px 16px", fontWeight: 700, color: "#111" }}>{l.nombre}</td>
                <td style={{ padding: "10px 16px", color: "#555" }}>{l.email}</td>
                <td style={{ padding: "10px 16px", color: "#888" }}>{l.telefono ?? "---"}</td>
                <td style={{ padding: "10px 16px", color: "#888", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{l.mensaje ?? "---"}</td>
                <td style={{ padding: "10px 16px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: l.fuente === "chatbot" ? "#e0f2fe" : "#f3f4f6", color: l.fuente === "chatbot" ? "#0284c7" : "#888" }}>{l.fuente ?? "manual"}</span>
                </td>
                <td style={{ padding: "10px 16px", color: "#aaa", fontSize: 12 }}>{new Date(l.created_at).toLocaleDateString("es-CO")}</td>
                <td style={{ padding: "10px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => abrirEditar(l)} style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Editar</button>
                    <button onClick={() => eliminar(l.id)} style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr><td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#ccc" }}>No hay leads aun.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 480, boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111", marginBottom: 16 }}>{editando ? "Editar Lead" : "Nuevo Lead"}</h2>
            {[["nombre","Nombre *"],["email","Correo"],["telefono","Telefono"],["mensaje","Mensaje"]].map(([field, label]) => (
              <div key={field} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>{label}</label>
                <input value={(form as any)[field]} onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
              </div>
            ))}
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
