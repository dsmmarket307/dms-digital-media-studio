"use client";
import { useState, useRef, useEffect } from "react";

const PLANES = [
  { name: "Basico", price: "$49.000/mes", slug: "basico", items: ["1 Landing Page activa","Editor Basico","Diseno Responsive","Boton WhatsApp","Subdominio DMS","Soporte basico"] },
  { name: "Profesional", price: "$99.000/mes", slug: "profesional", items: ["1 Sitio profesional","Editor Profesional","Galeria de imagenes","SEO basico","Formulario de contacto","Reservas","Dominio personalizado","Leads integrados"], popular: true },
  { name: "Empresarial", price: "$199.000/mes", slug: "empresarial", items: ["Sitios ilimitados","Editor Avanzado","SEO Avanzado","CRM integrado","Automatizaciones IA","Agente IA","Estadisticas","Dominios personalizados","Soporte prioritario"] },
];

const MENU = [
  { id: "planes", label: "Ver planes y precios", desc: "Basico, Profesional y Empresarial" },
  { id: "sitio", label: "Quiero crear mi sitio web", desc: "Con inteligencia artificial en minutos" },
  { id: "ia", label: "Automatizaciones e IA", desc: "Chatbots, CRM y flujos automaticos" },
  { id: "asesor", label: "Hablar con un asesor", desc: "Te ayudamos a elegir la mejor opcion" },
];

type Msg = { role: "bot" | "user"; text?: string; type?: string };
type Step = "ask_name" | "ask_celular" | "ask_email" | "menu" | "show_planes" | "asesoria" | "done";

export default function ChatbotDMS() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<Step>("ask_name");
  const [loading, setLoading] = useState(false);
  const [lead, setLead] = useState({ nombre: "", celular: "", email: "" });
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      if (msgs.length === 0) {
        setTimeout(() => addBot("Hola! Soy Sofia, asesora de DMS. Me alegra que estes aqui. Como te llamas?"), 400);
      }
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    if (!open && msgs.length > 0 && msgs[msgs.length-1].role === "bot") {
      setUnread(u => u + 1);
    }
  }, [msgs]);

  function addBot(text: string, type?: string) {
    setMsgs(m => [...m, { role: "bot", text, type }]);
  }
  function addUser(text: string) {
    setMsgs(m => [...m, { role: "user", text }]);
  }

  async function saveLead() {
    try {
      await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_lead", lead, categoria: "chatbot-dms", fuente: "landing" }),
      });
    } catch {}
  }

  async function handleSend() {
    const val = input.trim();
    if (!val || loading) return;
    setInput("");
    addUser(val);

    if (step === "ask_name") {
      setLead(l => ({ ...l, nombre: val }));
      addBot(`Que gusto conocerte, ${val}! Y tu numero de celular?`);
      setStep("ask_celular");
    } else if (step === "ask_celular") {
      setLead(l => ({ ...l, celular: val }));
      addBot("Perfecto! Y tu correo electronico?");
      setStep("ask_email");
    } else if (step === "ask_email") {
      const newLead = { ...lead, email: val };
      setLead(newLead);
      setTimeout(async () => {
        await fetch("/api/chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "save_lead", lead: newLead, categoria: "chatbot-dms", fuente: "landing" }),
        });
      }, 100);
      addBot(`Listo ${lead.nombre}! En que te puedo ayudar hoy?`, "menu");
      setStep("menu");
    } else if (step === "asesoria") {
      addBot("Entendido! Un asesor de DMS te contactara pronto. Tambien puedes escribirnos directamente.", "contacto_final");
      setStep("done");
    }
  }

  function selectMenu(id: string) {
    const item = MENU.find(m => m.id === id);
    if (!item) return;
    addUser(item.label);
    if (id === "planes") {
      addBot("Claro! Todos los planes incluyen 7 dias de prueba gratis.", "planes");
      setStep("show_planes");
    } else if (id === "sitio") {
      addBot("Con DMS tu sitio web se genera con IA en minutos. Te muestro los planes para que elijas el que mas te conviene.", "planes");
      setStep("show_planes");
    } else if (id === "ia") {
      addBot("Tenemos chatbots, CRM, automatizaciones y agente IA incluidos en los planes superiores. Te los muestro.", "planes");
      setStep("show_planes");
    } else {
      addBot(`Claro ${lead.nombre}! Cuentame que necesitas y te ayudo.`);
      setStep("asesoria");
    }
  }

  function selectPlan(plan: typeof PLANES[0]) {
    addUser(`Me interesa el plan ${plan.name}`);
    addBot(`Excelente eleccion! El plan ${plan.name} a ${plan.price} es perfecto. Puedes comenzar tu prueba gratis en este momento.`, "ir_registro");
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const showInput = step === "ask_name" || step === "ask_celular" || step === "ask_email" || step === "asesoria";

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ position:"fixed",bottom:24,right:24,zIndex:9999,width:62,height:62,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",border:"none",cursor:"pointer",boxShadow:"0 4px 28px rgba(124,58,237,0.55)",display:"flex",alignItems:"center",justifyContent:"center",transition:"transform 0.2s" }}
        onMouseEnter={e=>(e.currentTarget.style.transform="scale(1.1)")}
        onMouseLeave={e=>(e.currentTarget.style.transform="scale(1)")}
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
        {unread > 0 && !open && (
          <div style={{position:"absolute",top:0,right:0,width:20,height:20,borderRadius:"50%",background:"#ef4444",color:"#fff",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #fff"}}>
            {unread}
          </div>
        )}
      </button>

      {open && (
        <div style={{ position:"fixed",bottom:98,right:24,zIndex:9998,width:370,maxHeight:580,borderRadius:20,background:"#fff",boxShadow:"0 8px 48px rgba(0,0,0,0.18)",display:"flex",flexDirection:"column",overflow:"hidden",fontFamily:"'Segoe UI',sans-serif" }}>
          <div style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)",padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:42,height:42,borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            </div>
            <div style={{flex:1}}>
              <p style={{color:"#fff",fontWeight:700,fontSize:14,margin:0}}>Sofia - Asesora DMS</p>
              <p style={{color:"rgba(255,255,255,0.75)",fontSize:11,margin:0}}>Digital Media Studio</p>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"#4ade80"}}/>
              <span style={{color:"rgba(255,255,255,0.8)",fontSize:11}}>En linea</span>
            </div>
          </div>

          <div style={{flex:1,overflowY:"auto",padding:"14px",display:"flex",flexDirection:"column",gap:10,maxHeight:400}}>
            {msgs.map((m, i) => (
              <div key={i}>
                {m.role === "bot" && m.text && (
                  <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                    </div>
                    <div style={{maxWidth:"85%",padding:"10px 14px",borderRadius:"4px 18px 18px 18px",background:"#f3f4f6",color:"#111",fontSize:13,lineHeight:1.55}}>
                      {m.text}
                    </div>
                  </div>
                )}
                {m.role === "user" && m.text && (
                  <div style={{display:"flex",justifyContent:"flex-end"}}>
                    <div style={{maxWidth:"82%",padding:"10px 14px",borderRadius:"18px 18px 4px 18px",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",color:"#fff",fontSize:13,lineHeight:1.5}}>
                      {m.text}
                    </div>
                  </div>
                )}

                {m.type === "menu" && (
                  <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:6,paddingLeft:36}}>
                    {MENU.map(s => (
                      <button key={s.id} onClick={()=>selectMenu(s.id)} style={{textAlign:"left",padding:"10px 14px",borderRadius:12,border:"1px solid #e5e7eb",background:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,color:"#111",transition:"all 0.15s"}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor="#7c3aed";e.currentTarget.style.background="#f5f3ff"}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor="#e5e7eb";e.currentTarget.style.background="#fff"}}>
                        <div>{s.label}</div>
                        <div style={{fontSize:11,color:"#9ca3af",fontWeight:400}}>{s.desc}</div>
                      </button>
                    ))}
                  </div>
                )}

                {m.type === "planes" && (
                  <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:8,paddingLeft:36}}>
                    {PLANES.map(p=>(
                      <div key={p.name} style={{border:p.popular?"2px solid #7c3aed":"1px solid #e5e7eb",borderRadius:14,padding:"12px 14px",background:p.popular?"#f5f3ff":"#fff",position:"relative"}}>
                        {p.popular && <span style={{position:"absolute",top:-10,left:12,background:"#7c3aed",color:"#fff",fontSize:10,padding:"2px 10px",borderRadius:999,fontWeight:700}}>MAS POPULAR</span>}
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                          <span style={{fontWeight:700,fontSize:13,color:p.popular?"#7c3aed":"#111"}}>{p.name}</span>
                          <span style={{fontWeight:800,fontSize:13,color:"#111"}}>{p.price}</span>
                        </div>
                        <ul style={{margin:"0 0 8px 0",padding:0,listStyle:"none",display:"flex",flexDirection:"column",gap:3}}>
                          {p.items.map(item=>(
                            <li key={item} style={{fontSize:11,color:"#666",display:"flex",alignItems:"center",gap:6}}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                              {item}
                            </li>
                          ))}
                        </ul>
                        <button onClick={()=>selectPlan(p)} style={{width:"100%",padding:"7px",borderRadius:8,border:"none",background:p.popular?"#7c3aed":"#111",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                          Comenzar prueba gratis
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {m.type === "ir_registro" && (
                  <div style={{marginTop:8,paddingLeft:36}}>
                    <a href="/auth/register" style={{display:"block",textAlign:"center",padding:"12px",borderRadius:12,background:"linear-gradient(135deg,#7c3aed,#4f46e5)",color:"#fff",fontWeight:700,fontSize:13,textDecoration:"none"}}>
                      Comenzar prueba gratis
                    </a>
                  </div>
                )}

                {m.type === "contacto_final" && (
                  <div style={{marginTop:8,paddingLeft:36,display:"flex",flexDirection:"column",gap:6}}>
                    <a href="https://wa.me/573000000000" target="_blank" style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:12,background:"#25D366",color:"#fff",fontWeight:700,fontSize:13,textDecoration:"none"}}>
                      WhatsApp directo
                    </a>
                    <a href="mailto:dms.digitalstudio@outlook.com" style={{display:"block",textAlign:"center",padding:"10px",borderRadius:12,border:"1px solid #e5e7eb",color:"#666",fontSize:12,textDecoration:"none"}}>
                      dms.digitalstudio@outlook.com
                    </a>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><circle cx="12" cy="8" r="4"/></svg>
                </div>
                <div style={{background:"#f3f4f6",borderRadius:"4px 18px 18px 18px",padding:"10px 16px",display:"flex",gap:4,alignItems:"center"}}>
                  {[0,1,2].map(i=>(
                    <div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#7c3aed",animation:`bounce 1s ${i*0.2}s infinite`}}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {showInput && (
            <div style={{padding:"10px 14px",borderTop:"1px solid #f0f0f0",display:"flex",gap:8}}>
              <input
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={step === "ask_name" ? "Tu nombre completo..." : step === "ask_celular" ? "Tu numero de celular..." : step === "ask_email" ? "Tu correo electronico..." : "Escribe tu mensaje..."}
                disabled={loading}
                style={{flex:1,border:"1px solid #e5e7eb",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none"}}
              />
              <button onClick={handleSend} disabled={loading||!input.trim()} style={{width:38,height:38,borderRadius:10,border:"none",cursor:"pointer",background:loading||!input.trim()?"#e5e7eb":"linear-gradient(135deg,#7c3aed,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}`}</style>
    </>
  );
}