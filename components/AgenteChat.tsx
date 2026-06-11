"use client";
import { useState } from "react";

type Step = "saludo" | "nombre" | "celular" | "correo" | "mensaje" | "cita_fecha" | "cita_hora" | "reserva_fecha" | "reserva_hora" | "completado" | "chat";

export default function AgenteChat({ agente, color, siteId }: { agente: any; color: string; siteId?: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("saludo");
  const [datos, setDatos] = useState({ nombre: "", celular: "", correo: "", mensaje: "", fecha: "", hora: "" });
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState([
    { role: "bot", text: `Hola! Soy ${agente.nombre}, el asistente virtual. Me da mucho gusto atenderte. Para ayudarte mejor, me puedes dar tu nombre completo?` }
  ]);
  const [loading, setLoading] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [tipoAccion, setTipoAccion] = useState<"cita" | "reserva" | null>(null);

  const HORAS = ["8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"];

  function addMsg(role: "bot" | "user", text: string) {
    setMsgs(prev => [...prev, { role, text }]);
  }

  function detectarIntencion(text: string): "cita" | "reserva" | null {
    if (/reserva|reservar|mesa|habitacion|cuarto|espacio/i.test(text)) return "reserva";
    if (/cita|agendar|turno|appointment|visita|consulta/i.test(text)) return "cita";
    return null;
  }

  async function guardarLead(d: typeof datos, esCitaFlag: boolean) {
    try {
      await fetch("/api/agente-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...d, agente_id: agente.id, user_id: agente.user_id, site_id: siteId, es_cita: esCitaFlag }),
      });
      setGuardado(true);
    } catch {}
  }

  async function guardarReserva(d: typeof datos) {
    try {
      await fetch("/api/agente-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...d, agente_id: agente.id, user_id: agente.user_id, site_id: siteId, es_cita: true }),
      });
      setGuardado(true);
    } catch {}
  }

  async function handleInput() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    addMsg("user", text);

    if (step === "saludo" || step === "nombre") {
      setDatos(prev => ({ ...prev, nombre: text }));
      setStep("celular");
      setTimeout(() => addMsg("bot", `Encantado, ${text}! Cual es tu numero de celular?`), 400);
      return;
    }

    if (step === "celular") {
      setDatos(prev => ({ ...prev, celular: text }));
      setStep("correo");
      setTimeout(() => addMsg("bot", "Perfecto! Y tu correo electronico?"), 400);
      return;
    }

    if (step === "correo") {
      setDatos(prev => ({ ...prev, correo: text }));
      setStep("mensaje");
      setTimeout(() => addMsg("bot", "Cuentame, en que te puedo ayudar hoy?"), 400);
      return;
    }

    if (step === "mensaje") {
      const nuevoDatos = { ...datos, mensaje: text };
      setDatos(nuevoDatos);
      const intencion = detectarIntencion(text);

      if (intencion === "reserva") {
        setTipoAccion("reserva");
        setStep("reserva_fecha");
        setTimeout(() => addMsg("bot", "Claro! Para que fecha quieres hacer la reserva? (ej: 2026-06-29)"), 400);
      } else if (intencion === "cita") {
        setTipoAccion("cita");
        setStep("cita_fecha");
        setTimeout(() => addMsg("bot", "Claro! Para que fecha quieres agendar tu cita? (ej: 2026-06-29)"), 400);
      } else {
        setStep("chat");
        await guardarLead(nuevoDatos, false);
        setLoading(true);
        const res = await fetch("/api/agente-chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mensaje: text, agente }),
        });
        const data = await res.json();
        setLoading(false);
        addMsg("bot", data.respuesta ?? "Gracias! En breve te contactamos.");
      }
      return;
    }

    if (step === "cita_fecha") {
      setDatos(prev => ({ ...prev, fecha: text }));
      setStep("cita_hora");
      setTimeout(() => addMsg("bot", "A que hora prefieres?"), 400);
      return;
    }

    if (step === "reserva_fecha") {
      setDatos(prev => ({ ...prev, fecha: text }));
      setStep("reserva_hora");
      setTimeout(() => addMsg("bot", "A que hora prefieres?"), 400);
      return;
    }

    if (step === "chat") {
      setLoading(true);
      const res = await fetch("/api/agente-chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: text, agente }),
      });
      const data = await res.json();
      setLoading(false);
      addMsg("bot", data.respuesta ?? "Lo siento, intenta de nuevo.");
    }
  }

  async function seleccionarHora(hora: string) {
    const nuevoDatos = { ...datos, hora };
    setDatos(nuevoDatos);
    setStep("completado");
    if (tipoAccion === "reserva") {
      await guardarReserva(nuevoDatos);
      addMsg("bot", `Listo ${datos.nombre}! Tu reserva queda registrada para el ${datos.fecha} a las ${hora}. Te contactaremos al ${datos.celular} para confirmar.`);
    } else {
      await guardarLead(nuevoDatos, true);
      addMsg("bot", `Listo ${datos.nombre}! Tu cita queda agendada para el ${datos.fecha} a las ${hora}. Te contactaremos al ${datos.celular} para confirmar.`);
    }
  }

  return (
    <>
      <style>{`
        #cb-btn{position:fixed;bottom:24px;right:90px;z-index:9998;width:56px;height:56px;border-radius:50%;background:${color};border:none;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;}
        #cb-win{display:none;position:fixed;bottom:90px;right:24px;width:340px;max-height:500px;background:#fff;border-radius:20px;box-shadow:0 8px 40px rgba(0,0,0,0.18);z-index:9998;flex-direction:column;overflow:hidden;}
        #cb-win.open{display:flex;}
        #cb-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;}
        .cb-b{background:#f3f4f6;border-radius:12px 12px 12px 0;padding:9px 13px;font-size:13px;color:#111;max-width:85%;line-height:1.5;}
        .cb-u{background:${color};border-radius:12px 12px 0 12px;padding:9px 13px;font-size:13px;color:#fff;max-width:85%;align-self:flex-end;line-height:1.5;}
        #cb-footer{display:flex;gap:8px;padding:10px;border-top:1px solid #f0f0f0;}
        #cb-input{flex:1;border:1px solid #e5e7eb;border-radius:10px;padding:8px 12px;font-size:13px;outline:none;}
        #cb-send{background:${color};color:#fff;border:none;border-radius:10px;padding:8px 14px;cursor:pointer;font-weight:700;}
        .hora-btn{background:#f3f4f6;border:1px solid #e5e7eb;border-radius:8px;padding:6px 10px;font-size:12px;cursor:pointer;font-weight:600;}
        .hora-btn:hover{background:${color};color:#fff;border-color:${color};}
      `}</style>

      <button id="cb-btn" onClick={() => setOpen(!open)}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </button>

      <div id="cb-win" className={open ? "open" : ""}>
        <div style={{background:color,padding:"14px 16px",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg>
          </div>
          <div>
            <p style={{color:"#fff",fontWeight:700,fontSize:14,margin:0}}>{agente.nombre}</p>
            <p style={{color:"rgba(255,255,255,0.8)",fontSize:11,margin:0}}>En linea</p>
          </div>
          <button onClick={() => setOpen(false)} style={{marginLeft:"auto",background:"none",border:"none",color:"#fff",cursor:"pointer",fontSize:20}}>x</button>
        </div>

        <div id="cb-msgs">
          {msgs.map((m, i) => (
            <div key={i} className={m.role === "bot" ? "cb-b" : "cb-u"}>{m.text}</div>
          ))}
          {loading && <div className="cb-b">Escribiendo...</div>}
          {(step === "cita_hora" || step === "reserva_hora") && (
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:4}}>
              {HORAS.map(h => (
                <button key={h} className="hora-btn" onClick={() => seleccionarHora(h)}>{h}</button>
              ))}
            </div>
          )}
        </div>

        {step !== "completado" && step !== "cita_hora" && step !== "reserva_hora" && (
          <div id="cb-footer">
            <input id="cb-input" value={input} onChange={e => setInput(e.target.value)} placeholder="Escribe aqui..." onKeyDown={(e) => { if (e.key === "Enter") handleInput(); }} />
            <button id="cb-send" onClick={handleInput}>Enviar</button>
          </div>
        )}
        {step === "completado" && (
          <div style={{padding:"10px 14px",textAlign:"center",fontSize:12,color:"#10b981",fontWeight:700}}>
            {tipoAccion === "reserva" ? "Reserva registrada exitosamente" : "Cita agendada exitosamente"}
          </div>
        )}
      </div>
    </>
  );
}
