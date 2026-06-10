"use client";
import { useEffect } from "react";

export default function AgenteChat({ agente, color }: { agente: any; color: string }) {
  function sendMsg() {
    const input = document.getElementById("cb-input") as HTMLInputElement;
    const text = input?.value.trim();
    if (!text) return;
    input.value = "";
    const msgs = document.getElementById("cb-msgs");
    if (msgs) {
      msgs.innerHTML += `<div class="cb-u">${text}</div><div class="cb-b" id="cb-typing">Escribiendo...</div>`;
      msgs.scrollTop = msgs.scrollHeight;
    }
    fetch("/api/agente-chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensaje: text, agente }),
    }).then(r => r.json()).then(d => {
      const ty = document.getElementById("cb-typing");
      if (ty) ty.remove();
      if (msgs) {
        msgs.innerHTML += `<div class="cb-b">${d.respuesta || "Error"}</div>`;
        msgs.scrollTop = msgs.scrollHeight;
      }
    });
  }

  return (
    <>
      <style>{`
        #cb-btn{position:fixed;bottom:24px;right:90px;z-index:9998;width:56px;height:56px;border-radius:50%;background:${color};border:none;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;}
        #cb-win{display:none;position:fixed;bottom:90px;right:24px;width:320px;max-height:460px;background:#fff;border-radius:20px;box-shadow:0 8px 40px rgba(0,0,0,0.18);z-index:9998;flex-direction:column;overflow:hidden;}
        #cb-win.open{display:flex;}
        #cb-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;}
        .cb-b{background:#f3f4f6;border-radius:12px 12px 12px 0;padding:9px 13px;font-size:13px;color:#111;max-width:85%;line-height:1.5;}
        .cb-u{background:${color};border-radius:12px 12px 0 12px;padding:9px 13px;font-size:13px;color:#fff;max-width:85%;align-self:flex-end;line-height:1.5;}
        #cb-footer{display:flex;gap:8px;padding:10px;border-top:1px solid #f0f0f0;}
        #cb-input{flex:1;border:1px solid #e5e7eb;border-radius:10px;padding:8px 12px;font-size:13px;outline:none;}
        #cb-send{background:${color};color:#fff;border:none;border-radius:10px;padding:8px 14px;cursor:pointer;font-weight:700;}
      `}</style>
      <button id="cb-btn" onClick={() => document.getElementById("cb-win")?.classList.toggle("open")}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </button>
      <div id="cb-win">
        <div style={{background:color,padding:"14px 16px",display:"flex",alignItems:"center",gap:10}}>
          <p style={{color:"#fff",fontWeight:700,fontSize:14,margin:0}}>{agente.nombre}</p>
          <button onClick={() => document.getElementById("cb-win")?.classList.remove("open")} style={{marginLeft:"auto",background:"none",border:"none",color:"#fff",cursor:"pointer",fontSize:20}}>x</button>
        </div>
        <div id="cb-msgs">
          <div className="cb-b">Hola! Soy {agente.nombre}. Como puedo ayudarte?</div>
        </div>
        <div id="cb-footer">
          <input id="cb-input" placeholder="Escribe tu mensaje..." onKeyDown={(e) => { if (e.key === "Enter") sendMsg(); }} />
          <button id="cb-send" onClick={sendMsg}>Enviar</button>
        </div>
      </div>
    </>
  );
}
