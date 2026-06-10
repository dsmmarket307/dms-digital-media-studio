"use client";
import { useState } from "react";

export default function ClientChatbot({ agente, color }: { agente: any; color: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "bot", text: `Hola! Soy ${agente.nombre}. Como puedo ayudarte?` }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMsg() {
    if (!input.trim()) return;
    const userText = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setLoading(true);
    try {
      const res = await fetch("/api/agente-chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: userText, agente }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "bot", text: data.respuesta ?? "Lo siento, intenta de nuevo." }]);
    } catch {
      setMessages(prev => [...prev, { role: "bot", text: "Error de conexion." }]);
    }
    setLoading(false);
  }

  return (
    <>
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
        <button onClick={() => setOpen(!open)} style={{ width: 56, height: 56, borderRadius: "50%", background: color, border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </button>
      </div>
      {open && (
        <div style={{ position: "fixed", bottom: 84, right: 24, width: 340, maxHeight: 480, background: "#fff", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.18)", zIndex: 9999, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ background: color, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg>
            </div>
            <div>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0 }}>{agente.nombre}</p>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, margin: 0 }}>En linea</p>
            </div>
            <button onClick={() => setOpen(false)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 20 }}>x</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ background: m.role === "bot" ? "#f3f4f6" : color, color: m.role === "bot" ? "#111" : "#fff", borderRadius: m.role === "bot" ? "12px 12px 12px 0" : "12px 12px 0 12px", padding: "10px 14px", fontSize: 13, maxWidth: "85%", alignSelf: m.role === "bot" ? "flex-start" : "flex-end", lineHeight: 1.5 }}>
                {m.text}
              </div>
            ))}
            {loading && <div style={{ background: "#f3f4f6", borderRadius: "12px 12px 12px 0", padding: "10px 14px", fontSize: 13, color: "#888" }}>Escribiendo...</div>}
          </div>
          <div style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid #f0f0f0" }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") sendMsg(); }} placeholder="Escribe tu mensaje..." style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 12px", fontSize: 13, outline: "none" }} />
            <button onClick={sendMsg} style={{ background: color, color: "#fff", border: "none", borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Enviar</button>
          </div>
        </div>
      )}
    </>
  );
}
