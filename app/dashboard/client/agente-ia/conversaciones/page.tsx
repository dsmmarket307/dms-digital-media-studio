"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ConversacionesWhatsApp() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [waSettings, setWaSettings] = useState<any>(null);
  const [conversaciones, setConversaciones] = useState<any[]>([]);
  const [activa, setActiva] = useState<any>(null);
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);
  const [grabando, setGrabando] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUserId(user.id);
      const { data: wa } = await supabase.from("whatsapp_settings").select("*").eq("user_id", user.id).maybeSingle();
      if (!wa) { router.push("/dashboard/client/agente-ia"); return; }
      setWaSettings(wa);
      const { data: convs } = await supabase.from("whatsapp_conversations").select("*").eq("user_id", user.id).order("updated_at", { ascending: false });
      setConversaciones(convs ?? []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!activa) return;
    async function loadMensajes() {
      const { data } = await supabase.from("whatsapp_messages").select("*").eq("conversation_id", activa.id).order("created_at", { ascending: true });
      setMensajes(data ?? []);
    }
    loadMensajes();

    const channel = supabase
      .channel(`wa-msgs-${activa.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "whatsapp_messages", filter: `conversation_id=eq.${activa.id}` }, (payload) => {
        setMensajes(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activa?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  async function enviarTexto() {
    if (!input.trim() || !activa) return;
    setEnviando(true);
    const texto = input.trim();
    setInput("");
    await fetch("/api/whatsapp/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_id: activa.id, phone: activa.phone, phone_number_id: waSettings.phone_number_id, access_token: waSettings.access_token, texto }),
    });
    setEnviando(false);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activa) return;
    setSubiendoArchivo(true);
    const ext = file.name.split(".").pop();
    const fileName = `whatsapp-media/manual-${Date.now()}.${ext}`;
    await supabase.storage.from("logos").upload(fileName, file, { upsert: true });
    const { data } = supabase.storage.from("logos").getPublicUrl(fileName);
    const tipo = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "document";
    await fetch("/api/whatsapp/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_id: activa.id, phone: activa.phone, phone_number_id: waSettings.phone_number_id, access_token: waSettings.access_token, media_url: data.publicUrl, media_type: tipo }),
    });
    setSubiendoArchivo(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function iniciarGrabacion() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach(t => t.stop());
        if (!activa) return;
        setSubiendoArchivo(true);
        const fileName = `whatsapp-media/nota-voz-${Date.now()}.webm`;
        await supabase.storage.from("logos").upload(fileName, blob, { upsert: true, contentType: "audio/webm" });
        const { data } = supabase.storage.from("logos").getPublicUrl(fileName);
        await fetch("/api/whatsapp/enviar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversation_id: activa.id, phone: activa.phone, phone_number_id: waSettings.phone_number_id, access_token: waSettings.access_token, media_url: data.publicUrl, media_type: "audio" }),
        });
        setSubiendoArchivo(false);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setGrabando(true);
    } catch {
      alert("No se pudo acceder al microfono. Revisa los permisos del navegador.");
    }
  }

  function detenerGrabacion() {
    mediaRecorderRef.current?.stop();
    setGrabando(false);
  }

  async function tomarControlManual() {
    if (!activa) return;
    const manualHasta = new Date();
    manualHasta.setHours(manualHasta.getHours() + 2);
    await supabase.from("whatsapp_conversations").update({ modo_manual: true, manual_hasta: manualHasta.toISOString() }).eq("id", activa.id);
    setActiva((prev: any) => ({ ...prev, modo_manual: true, manual_hasta: manualHasta.toISOString() }));
  }

  async function devolverAlBot() {
    if (!activa) return;
    await supabase.from("whatsapp_conversations").update({ modo_manual: false, manual_hasta: null }).eq("id", activa.id);
    setActiva((prev: any) => ({ ...prev, modo_manual: false, manual_hasta: null }));
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img src="/favicon-32.png" alt="Cargando" style={{ width: 44, height: 44, animation: "spin 1s linear infinite", borderRadius: 10 }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f0f0f0" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <header style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111", margin: 0 }}>Conversaciones WhatsApp</h1>
          <p style={{ color: "#888", fontSize: 12, margin: "2px 0 0" }}>{conversaciones.length} conversaciones</p>
        </div>
        <Link href="/dashboard/client/agente-ia" style={{ fontSize: 13, color: "#7c3aed", fontWeight: 700, textDecoration: "none" }}>← Volver</Link>
      </header>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <div style={{ width: 300, background: "#fff", borderRight: "1px solid #e5e7eb", overflowY: "auto", flexShrink: 0 }}>
          {conversaciones.length === 0 && (
            <p style={{ padding: 20, fontSize: 13, color: "#aaa", textAlign: "center" }}>Aun no hay conversaciones.</p>
          )}
          {conversaciones.map(c => (
            <div key={c.id} onClick={() => setActiva(c)} style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0", cursor: "pointer", background: activa?.id === c.id ? "rgba(124,58,237,0.06)" : "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: "#111", margin: 0 }}>{c.phone}</p>
                {c.modo_manual && <span style={{ fontSize: 9, fontWeight: 700, color: "#d97706", background: "#fef3c7", padding: "2px 6px", borderRadius: 999 }}>MANUAL</span>}
              </div>
              <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>{new Date(c.updated_at).toLocaleString("es-CO")}</p>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {!activa ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: 13 }}>
              Selecciona una conversacion para ver los mensajes
            </div>
          ) : (
            <>
              <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#111", margin: 0 }}>{activa.phone}</p>
                {activa.modo_manual ? (
                  <button onClick={devolverAlBot} style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed", background: "rgba(124,58,237,0.08)", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer" }}>Devolver al bot</button>
                ) : (
                  <button onClick={tomarControlManual} style={{ fontSize: 12, fontWeight: 700, color: "#d97706", background: "#fef3c7", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer" }}>Tomar control (2h)</button>
                )}
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                {mensajes.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-start" : "flex-end" }}>
                    <div style={{ maxWidth: "70%", padding: "10px 14px", borderRadius: m.role === "user" ? "4px 16px 16px 16px" : "16px 4px 16px 16px", background: m.role === "user" ? "#fff" : "#dcf8c6", fontSize: 13, color: "#111" }}>
                      {m.media_url && m.media_type === "image" && <img src={m.media_url} alt="" style={{ maxWidth: "100%", borderRadius: 8, marginBottom: 6 }} />}
                      {m.media_url && m.media_type === "audio" && <audio src={m.media_url} controls style={{ marginBottom: 6, maxWidth: "100%" }} />}
                      {m.media_url && m.media_type === "video" && <video src={m.media_url} controls style={{ maxWidth: "100%", borderRadius: 8, marginBottom: 6 }} />}
                      {m.media_url && m.media_type === "document" && <a href={m.media_url} target="_blank" rel="noopener noreferrer" style={{ color: "#7c3aed", fontSize: 12, display: "block", marginBottom: 6 }}>📎 Ver archivo</a>}
                      {m.message}
                      <p style={{ fontSize: 10, color: "#999", margin: "4px 0 0", textAlign: "right" as const }}>{new Date(m.created_at).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <div style={{ background: "#fff", borderTop: "1px solid #e5e7eb", padding: "10px 16px", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                <input ref={fileRef} type="file" accept="image/*,video/*,application/pdf" style={{ display: "none" }} onChange={handleFileChange} />
                <button onClick={() => fileRef.current?.click()} disabled={subiendoArchivo} title="Adjuntar archivo" style={{ background: "#f3f4f6", border: "none", borderRadius: 10, width: 38, height: 38, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                </button>
                <button onClick={grabando ? detenerGrabacion : iniciarGrabacion} disabled={subiendoArchivo} title="Nota de voz" style={{ background: grabando ? "#ef4444" : "#f3f4f6", border: "none", borderRadius: 10, width: 38, height: 38, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={grabando ? "#fff" : "#555"} strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
                </button>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && enviarTexto()} placeholder={grabando ? "Grabando nota de voz..." : "Escribe un mensaje..."} disabled={grabando || subiendoArchivo} style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 14px", fontSize: 13, outline: "none" }} />
                <button onClick={enviarTexto} disabled={enviando || !input.trim() || grabando} style={{ background: "#7c3aed", border: "none", borderRadius: 10, width: 38, height: 38, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: !input.trim() ? 0.5 : 1 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
