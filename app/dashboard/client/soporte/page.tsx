"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Soporte() {
  const supabase = createClient();
  const [form, setForm] = useState({ asunto: "", mensaje: "" });
  const [sending, setSending] = useState(false);
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<"nuevo" | "historial">("nuevo");
  const [respondiendo, setRespondiendo] = useState<string | null>(null);
  const [respuestaCliente, setRespuestaCliente] = useState("");
  const [savingResp, setSavingResp] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);
      const { data } = await supabase.from("soporte_mensajes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setMensajes(data ?? []);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSending(true);
    const { data: prof } = await supabase.from("profiles").select("name,email").eq("id", user.id).single();
    await supabase.from("soporte_mensajes").insert({ user_id: user.id, nombre: prof?.name ?? "", email: prof?.email ?? user.email, asunto: form.asunto, mensaje: form.mensaje, estado: "pendiente" });
    const { data } = await supabase.from("soporte_mensajes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setMensajes(data ?? []);
    setForm({ asunto: "", mensaje: "" });
    setSending(false);
    setTab("historial");
  }

  async function handleResponderCliente(id: string) {
    if (!respuestaCliente.trim()) return;
    setSavingResp(true);
    await supabase.from("soporte_mensajes").update({ respuesta_cliente: respuestaCliente, respuesta_cliente_at: new Date().toISOString(), estado: "pendiente" }).eq("id", id);
    const { data } = await supabase.from("soporte_mensajes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setMensajes(data ?? []);
    setRespuestaCliente("");
    setRespondiendo(null);
    setSavingResp(false);
  }

  const ESTADO_COLORS: Record<string, { bg: string; color: string; label: string }> = {
    pendiente:  { bg: "#fef3c7", color: "#d97706", label: "Pendiente" },
    respondido: { bg: "#d1fae5", color: "#059669", label: "Respondido" },
    cerrado:    { bg: "#f3f4f6", color: "#6b7280", label: "Cerrado" },
  };

  return (
    <div style={{ padding: "2rem", minWidth: 0, maxWidth: 700 }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111", margin: 0 }}>Soporte</h1>
        <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Estamos aqui para ayudarte.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
        {[
          { label: "WhatsApp", value: "Respuesta inmediata", href: "https://wa.me/573000000000", btn: "Abrir WhatsApp" },
          { label: "Correo", value: "dms.digitalstudio@outlook.com", href: "mailto:dms.digitalstudio@outlook.com", btn: "Enviar correo" },
          { label: "Horario", value: "Lun - Vie 8am - 6pm", href: "#", btn: "Ver horario" },
        ].map(c => (
          <div key={c.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1rem", textAlign: "center" }}>
            <p style={{ fontWeight: 700, color: "#111", fontSize: 13, marginBottom: 4 }}>{c.label}</p>
            <p style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>{c.value}</p>
            <a href={c.href} style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", textDecoration: "none" }}>{c.btn}</a>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: "1.5rem", borderBottom: "1px solid #e5e7eb" }}>
        {(["nuevo","historial"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600, background: "none", border: "none", cursor: "pointer", borderBottom: tab === t ? "2px solid #7c3aed" : "2px solid transparent", color: tab === t ? "#7c3aed" : "#888" }}>
            {t === "nuevo" ? "Nuevo mensaje" : `Mis mensajes (${mensajes.length})`}
          </button>
        ))}
      </div>
      {tab === "nuevo" && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "1.5rem" }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: "#111", marginBottom: 16 }}>Enviar mensaje</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Asunto</label>
              <input required value={form.asunto} onChange={e => setForm({ ...form, asunto: e.target.value })} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" }} placeholder="Como podemos ayudarte?" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Mensaje</label>
              <textarea required rows={5} value={form.mensaje} onChange={e => setForm({ ...form, mensaje: e.target.value })} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box" }} placeholder="Describe tu consulta..." />
            </div>
            <button type="submit" disabled={sending} style={{ width: "100%", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, padding: "10px", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: sending ? 0.6 : 1 }}>
              {sending ? "Enviando..." : "Enviar mensaje"}
            </button>
          </form>
        </div>
      )}
      {tab === "historial" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mensajes.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "3rem", textAlign: "center", color: "#ccc" }}>No has enviado mensajes aun.</div>
          ) : mensajes.map(m => (
            <div key={m.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <p style={{ fontWeight: 700, color: "#111", fontSize: 13, margin: 0 }}>{m.asunto}</p>
                  <p style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{new Date(m.created_at).toLocaleDateString("es-CO")}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: ESTADO_COLORS[m.estado]?.bg, color: ESTADO_COLORS[m.estado]?.color }}>{ESTADO_COLORS[m.estado]?.label ?? m.estado}</span>
              </div>
              <div style={{ background: "#f8f9fa", borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 4 }}>Tu mensaje:</p>
                <p style={{ fontSize: 13, color: "#555", margin: 0 }}>{m.mensaje}</p>
              </div>
              {m.respuesta && (
                <div style={{ borderLeft: "3px solid #7c3aed", paddingLeft: 12, background: "rgba(124,58,237,0.04)", borderRadius: "0 8px 8px 0", padding: "10px 12px", marginBottom: 8 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", marginBottom: 4 }}>Respuesta DMS:</p>
                  <p style={{ fontSize: 13, color: "#555", margin: 0 }}>{m.respuesta}</p>
                </div>
              )}
              {m.respuesta && m.estado !== "cerrado" && (
                respondiendo === m.id ? (
                  <div style={{ marginTop: 8 }}>
                    <textarea value={respuestaCliente} onChange={e => setRespuestaCliente(e.target.value)} rows={3} placeholder="Escribe tu respuesta..." style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box", marginBottom: 8 }} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => handleResponderCliente(m.id)} disabled={savingResp || !respuestaCliente.trim()} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{savingResp ? "Enviando..." : "Enviar"}</button>
                      <button onClick={() => { setRespondiendo(null); setRespuestaCliente(""); }} style={{ background: "#f3f4f6", color: "#555", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setRespondiendo(m.id)} style={{ fontSize: 12, color: "#7c3aed", fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 4 }}>Responder al equipo DMS</button>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
