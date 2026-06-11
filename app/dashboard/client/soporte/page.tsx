"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Soporte() {
  const supabase = createClient();
  const [form, setForm] = useState({ asunto: "", mensaje: "" });
  const [sending, setSending] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<"nuevo" | "historial">("nuevo");
  const [ticketAbierto, setTicketAbierto] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const hiloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);
      const { data } = await supabase.from("soporte_mensajes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setTickets(data ?? []);
    }
    load();
  }, []);

  useEffect(() => {
    if (hiloRef.current) hiloRef.current.scrollTop = hiloRef.current.scrollHeight;
  }, [replies]);

  async function loadReplies(ticketId: string) {
    const { data } = await supabase.from("soporte_replies").select("*").eq("ticket_id", ticketId).order("created_at", { ascending: true });
    setReplies(data ?? []);
  }

  async function abrirTicket(ticket: any) {
    setTicketAbierto(ticket);
    await loadReplies(ticket.id);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSending(true);
    const { data: prof } = await supabase.from("profiles").select("name,email").eq("id", user.id).single();
    await supabase.from("soporte_mensajes").insert({ user_id: user.id, nombre: prof?.name ?? "", email: prof?.email ?? user.email, asunto: form.asunto, mensaje: form.mensaje, estado: "pendiente" });
    const { data } = await supabase.from("soporte_mensajes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setTickets(data ?? []);
    setForm({ asunto: "", mensaje: "" });
    setSending(false);
    setTab("historial");
  }

  async function handleEnviarReply() {
    if (!nuevoMensaje.trim() && !archivo) return;
    if (!ticketAbierto || !user) return;
    setSubiendo(true);
    let archivo_url = null;
    let archivo_tipo = null;
    if (archivo) {
      const ext = archivo.name.split(".").pop();
      const path = `${ticketAbierto.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("soporte-archivos").upload(path, archivo, { upsert: true });
      if (!error) {
        const { data: urlData } = supabase.storage.from("soporte-archivos").getPublicUrl(path);
        archivo_url = urlData.publicUrl;
        archivo_tipo = archivo.type.startsWith("video") ? "video" : "imagen";
      }
    }
    const { data: prof } = await supabase.from("profiles").select("name").eq("id", user.id).single();
    await supabase.from("soporte_replies").insert({ ticket_id: ticketAbierto.id, user_id: user.id, autor: prof?.name ?? "Cliente", rol: "cliente", mensaje: nuevoMensaje.trim() || "", archivo_url, archivo_tipo });
    await supabase.from("soporte_mensajes").update({ estado: "pendiente" }).eq("id", ticketAbierto.id);
    setNuevoMensaje("");
    setArchivo(null);
    if (fileRef.current) fileRef.current.value = "";
    await loadReplies(ticketAbierto.id);
    const { data } = await supabase.from("soporte_mensajes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setTickets(data ?? []);
    setSubiendo(false);
  }

  const ESTADO_COLORS: Record<string, { bg: string; color: string; label: string }> = {
    pendiente:  { bg: "#fef3c7", color: "#d97706", label: "Pendiente" },
    respondido: { bg: "#d1fae5", color: "#059669", label: "Respondido" },
    cerrado:    { bg: "#f3f4f6", color: "#6b7280", label: "Cerrado" },
  };

  if (ticketAbierto) {
    return (
      <div style={{ padding: "2rem", maxWidth: 700 }}>
        <button onClick={() => { setTicketAbierto(null); setReplies([]); }} style={{ fontSize: 12, color: "#7c3aed", fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 16 }}>
          &larr; Volver a mis mensajes
        </button>
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "1.25rem", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontWeight: 800, fontSize: 14, color: "#111", margin: 0 }}>{ticketAbierto.asunto}</p>
              <p style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{new Date(ticketAbierto.created_at).toLocaleDateString("es-CO")}</p>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: ESTADO_COLORS[ticketAbierto.estado]?.bg, color: ESTADO_COLORS[ticketAbierto.estado]?.color }}>{ESTADO_COLORS[ticketAbierto.estado]?.label ?? ticketAbierto.estado}</span>
          </div>
          <div style={{ background: "#f8f9fa", borderRadius: 8, padding: "10px 12px", marginTop: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 4 }}>Mensaje inicial:</p>
            <p style={{ fontSize: 13, color: "#555", margin: 0 }}>{ticketAbierto.mensaje}</p>
          </div>
        </div>
        <div ref={hiloRef} style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 380, overflowY: "auto", marginBottom: 16, padding: "4px 0" }}>
          {replies.length === 0 && (
            <p style={{ fontSize: 12, color: "#ccc", textAlign: "center", padding: "2rem 0" }}>Sin respuestas aun. El equipo DMS te respondera pronto.</p>
          )}
          {replies.map(r => {
            const esCliente = r.rol === "cliente";
            return (
              <div key={r.id} style={{ display: "flex", justifyContent: esCliente ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "75%", background: esCliente ? "#7c3aed" : "#f3f4f6", color: esCliente ? "#fff" : "#111", borderRadius: esCliente ? "12px 12px 2px 12px" : "12px 12px 12px 2px", padding: "10px 14px" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, marginBottom: 4, opacity: 0.7 }}>{esCliente ? "Tu" : "DMS Digital"}</p>
                  {r.mensaje && <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5 }}>{r.mensaje}</p>}
                  {r.archivo_url && r.archivo_tipo === "imagen" && (
                    <img src={r.archivo_url} alt="evidencia" style={{ maxWidth: 200, borderRadius: 8, marginTop: 8, display: "block" }} />
                  )}
                  {r.archivo_url && r.archivo_tipo === "video" && (
                    <video src={r.archivo_url} controls style={{ maxWidth: 200, borderRadius: 8, marginTop: 8, display: "block" }} />
                  )}
                  <p style={{ fontSize: 10, opacity: 0.5, margin: "6px 0 0", textAlign: "right" }}>{new Date(r.created_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            );
          })}
        </div>
        {ticketAbierto.estado !== "cerrado" && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "1rem" }}>
            <textarea value={nuevoMensaje} onChange={e => setNuevoMensaje(e.target.value)} rows={3} placeholder="Escribe tu mensaje..." style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box", marginBottom: 8 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <input ref={fileRef} type="file" accept="image/*,video/*" onChange={e => setArchivo(e.target.files?.[0] ?? null)} style={{ fontSize: 11, color: "#888", flex: 1 }} />
              {archivo && <span style={{ fontSize: 11, color: "#7c3aed", fontWeight: 700 }}>{archivo.name}</span>}
              <button onClick={handleEnviarReply} disabled={subiendo || (!nuevoMensaje.trim() && !archivo)} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: subiendo ? 0.6 : 1 }}>
                {subiendo ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        )}
        {ticketAbierto.estado === "cerrado" && (
          <p style={{ fontSize: 12, color: "#aaa", textAlign: "center", padding: "1rem" }}>Este ticket esta cerrado.</p>
        )}
      </div>
    );
  }

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
            {t === "nuevo" ? "Nuevo mensaje" : `Mis mensajes (${tickets.length})`}
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
          {tickets.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "3rem", textAlign: "center", color: "#ccc" }}>No has enviado mensajes aun.</div>
          ) : tickets.map(m => (
            <div key={m.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "1.25rem", cursor: "pointer" }} onClick={() => abrirTicket(m)}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontWeight: 700, color: "#111", fontSize: 13, margin: 0 }}>{m.asunto}</p>
                  <p style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{new Date(m.created_at).toLocaleDateString("es-CO")}</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: ESTADO_COLORS[m.estado]?.bg, color: ESTADO_COLORS[m.estado]?.color }}>{ESTADO_COLORS[m.estado]?.label ?? m.estado}</span>
              </div>
              <p style={{ fontSize: 12, color: "#888", marginTop: 8, margin: "8px 0 0" }}>{m.mensaje.length > 80 ? m.mensaje.slice(0, 80) + "..." : m.mensaje}</p>
              <p style={{ fontSize: 11, color: "#7c3aed", fontWeight: 700, marginTop: 8 }}>Ver hilo &rarr;</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
