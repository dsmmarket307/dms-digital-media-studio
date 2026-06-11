"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SoporteAdmin() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [tab, setTab] = useState<"tickets" | "leads">("tickets");
  const [ticketAbierto, setTicketAbierto] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const hiloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (prof?.role !== "admin") { router.push("/dashboard/client"); return; }
      const [{ data: t }, { data: l }] = await Promise.all([
        supabase.from("soporte_mensajes").select("*").order("created_at", { ascending: false }),
        supabase.from("leads").select("*").order("created_at", { ascending: false }),
      ]);
      setTickets(t ?? []);
      setLeads(l ?? []);
      setLoading(false);
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

  async function handleEnviarReply() {
    if (!nuevoMensaje.trim() && !archivo) return;
    if (!ticketAbierto) return;
    setSubiendo(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
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
    await supabase.from("soporte_replies").insert({ ticket_id: ticketAbierto.id, user_id: user.id, autor: "DMS Digital", rol: "admin", mensaje: nuevoMensaje.trim() || "", archivo_url, archivo_tipo });
    await supabase.from("soporte_mensajes").update({ estado: "respondido", respondido_at: new Date().toISOString() }).eq("id", ticketAbierto.id);
    setNuevoMensaje("");
    setArchivo(null);
    if (fileRef.current) fileRef.current.value = "";
    await loadReplies(ticketAbierto.id);
    const { data: t } = await supabase.from("soporte_mensajes").select("*").order("created_at", { ascending: false });
    setTickets(t ?? []);
    setTicketAbierto((prev: any) => ({ ...prev, estado: "respondido" }));
    setSubiendo(false);
  }

  async function cerrarTicket(id: string) {
    await supabase.from("soporte_mensajes").update({ estado: "cerrado" }).eq("id", id);
    setTickets(prev => prev.map(t => t.id === id ? { ...t, estado: "cerrado" } : t));
    if (ticketAbierto?.id === id) setTicketAbierto((prev: any) => ({ ...prev, estado: "cerrado" }));
  }

  async function updateLeadEstado(id: number, estado: string) {
    await supabase.from("leads").update({ estado }).eq("id", id);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, estado } : l));
  }

  const ESTADO_COLORS: Record<string, { bg: string; color: string; label: string }> = {
    pendiente:  { bg: "#fef3c7", color: "#d97706", label: "Pendiente" },
    respondido: { bg: "#d1fae5", color: "#059669", label: "Respondido" },
    cerrado:    { bg: "#f3f4f6", color: "#6b7280", label: "Cerrado" },
    nuevo:      { bg: "#ede9fe", color: "#7c3aed", label: "Nuevo" },
    contactado: { bg: "#dbeafe", color: "#2563eb", label: "Contactado" },
    ganado:     { bg: "#d1fae5", color: "#059669", label: "Ganado" },
    perdido:    { bg: "#fee2e2", color: "#dc2626", label: "Perdido" },
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div style={{ width: 40, height: 40, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const pendientes = tickets.filter(t => t.estado === "pendiente").length;
  const leadsNuevos = leads.filter(l => l.estado === "nuevo").length;

  if (ticketAbierto) {
    return (
      <div className="min-h-screen bg-gray-50">
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/logo-dms.png" alt="DMS" width={120} height={38} />
              <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-3 py-1 rounded-full">Soporte</span>
            </div>
            <button onClick={() => { setTicketAbierto(null); setReplies([]); }} className="text-sm text-gray-500 hover:text-purple-600 transition-colors">
              &larr; Volver a tickets
            </button>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-6 py-8">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <p className="font-bold text-gray-900 text-base">{ticketAbierto.asunto}</p>
                <div className="flex gap-3 mt-1 flex-wrap">
                  <p className="text-xs text-gray-500 font-medium">{ticketAbierto.nombre}</p>
                  <p className="text-xs text-gray-400">{ticketAbierto.email}</p>
                  <p className="text-xs text-gray-400">{new Date(ticketAbierto.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}</p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: ESTADO_COLORS[ticketAbierto.estado]?.bg, color: ESTADO_COLORS[ticketAbierto.estado]?.color }}>
                  {ESTADO_COLORS[ticketAbierto.estado]?.label ?? ticketAbierto.estado}
                </span>
                {ticketAbierto.estado !== "cerrado" && (
                  <button onClick={() => cerrarTicket(ticketAbierto.id)} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                    Cerrar ticket
                  </button>
                )}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mt-4">
              <p className="text-xs font-semibold text-gray-400 mb-1">Mensaje inicial:</p>
              <p className="text-sm text-gray-600 leading-relaxed">{ticketAbierto.mensaje}</p>
            </div>
          </div>
          <div ref={hiloRef} className="flex flex-col gap-3 max-h-96 overflow-y-auto mb-6 px-1">
            {replies.length === 0 && (
              <p className="text-xs text-gray-300 text-center py-8">Sin respuestas aun.</p>
            )}
            {replies.map(r => {
              const esAdmin = r.rol === "admin";
              return (
                <div key={r.id} style={{ display: "flex", justifyContent: esAdmin ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "75%", background: esAdmin ? "#7c3aed" : "#f3f4f6", color: esAdmin ? "#fff" : "#111", borderRadius: esAdmin ? "12px 12px 2px 12px" : "12px 12px 12px 2px", padding: "10px 14px" }}>
                    <p style={{ fontSize: 10, fontWeight: 700, marginBottom: 4, opacity: 0.7 }}>{esAdmin ? "DMS Digital" : r.autor}</p>
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
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <textarea value={nuevoMensaje} onChange={e => setNuevoMensaje(e.target.value)} rows={3} placeholder="Escribe tu respuesta al cliente..." className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600 resize-none mb-3" />
              <div className="flex items-center gap-3 flex-wrap">
                <input ref={fileRef} type="file" accept="image/*,video/*" onChange={e => setArchivo(e.target.files?.[0] ?? null)} className="text-xs text-gray-400 flex-1" />
                {archivo && <span className="text-xs text-purple-600 font-semibold">{archivo.name}</span>}
                <button onClick={handleEnviarReply} disabled={subiendo || (!nuevoMensaje.trim() && !archivo)} className="bg-purple-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50">
                  {subiendo ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </div>
          )}
          {ticketAbierto.estado === "cerrado" && (
            <p className="text-xs text-gray-400 text-center py-4">Este ticket esta cerrado.</p>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo-dms.png" alt="DMS" width={120} height={38} />
            <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-3 py-1 rounded-full">Soporte</span>
          </div>
          <a href="/dashboard/admin" className="text-sm text-gray-500 hover:text-purple-600 transition-colors">Volver al admin</a>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Centro de Soporte</h1>
            <p className="text-gray-500 text-sm mt-1">Mensajes de clientes y leads del sitio web</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold text-yellow-600">{pendientes}</p>
              <p className="text-xs text-yellow-600">Tickets pendientes</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-bold text-purple-600">{leadsNuevos}</p>
              <p className="text-xs text-purple-600">Leads nuevos</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {(["tickets","leads"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className="px-4 py-2 text-sm font-semibold capitalize transition-colors" style={{ borderBottom: tab === t ? "2px solid #7c3aed" : "2px solid transparent", color: tab === t ? "#7c3aed" : "#6b7280" }}>
              {t === "tickets" ? `Tickets Soporte (${tickets.length})` : `Leads Landing (${leads.length})`}
            </button>
          ))}
        </div>
        {tab === "tickets" && (
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">No hay tickets de soporte aun.</div>
            ) : tickets.map(t => (
              <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 cursor-pointer hover:border-purple-200 transition-colors" onClick={() => abrirTicket(t)}>
                <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                  <div>
                    <p className="font-bold text-gray-900">{t.asunto}</p>
                    <div className="flex gap-3 mt-1 flex-wrap">
                      <p className="text-xs text-gray-500 font-medium">{t.nombre}</p>
                      <p className="text-xs text-gray-400">{t.email}</p>
                      <p className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: ESTADO_COLORS[t.estado]?.bg, color: ESTADO_COLORS[t.estado]?.color }}>
                    {ESTADO_COLORS[t.estado]?.label ?? t.estado}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">{t.mensaje.length > 100 ? t.mensaje.slice(0, 100) + "..." : t.mensaje}</p>
                <p className="text-xs text-purple-600 font-semibold mt-3">Ver hilo &rarr;</p>
              </div>
            ))}
          </div>
        )}
        {tab === "leads" && (
          <div className="space-y-4">
            {leads.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">No hay leads aun.</div>
            ) : leads.map(l => (
              <div key={l.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <p className="font-bold text-gray-900">{l.nombre}</p>
                    <div className="flex gap-3 mt-1 flex-wrap">
                      <p className="text-xs text-gray-500">{l.email}</p>
                      {l.telefono && (
                        <a href={`https://wa.me/57${l.telefono.replace(/\D/g,"")}`} target="_blank" className="text-xs text-green-600 font-semibold hover:underline">
                          WhatsApp: {l.telefono}
                        </a>
                      )}
                      <p className="text-xs text-gray-400">{new Date(l.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}</p>
                    </div>
                  </div>
                  <select value={l.estado ?? "nuevo"} onChange={e => updateLeadEstado(l.id, e.target.value)} className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-600 font-semibold" style={{ color: ESTADO_COLORS[l.estado]?.color ?? "#7c3aed", background: ESTADO_COLORS[l.estado]?.bg ?? "#ede9fe" }}>
                    {["nuevo","contactado","ganado","perdido"].map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 leading-relaxed">{l.mensaje ?? "Sin mensaje"}</p>
                {l.fuente && <p className="text-xs text-gray-400 mt-2">Fuente: {l.fuente}</p>}
                <div className="flex gap-2 mt-4 flex-wrap">
                  <a href={`mailto:${l.email}`} className="text-xs bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors">Enviar email</a>
                  {l.telefono && (
                    <a href={`https://wa.me/57${l.telefono.replace(/\D/g,"")}`} target="_blank" className="text-xs bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors">WhatsApp</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
