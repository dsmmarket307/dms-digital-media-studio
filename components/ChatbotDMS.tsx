"use client";
import { useState, useRef, useEffect } from "react";

const CATEGORIAS = [
  "Landing Page","Sitio Corporativo","Tienda Online","Agencia","Portafolio",
  "Restaurantes y Comida","Hoteles y Hospedaje","Tiendas y Comercio","Belleza y Estetica",
  "Salud y Bienestar","Gimnasios y Fitness","Automotriz","Hogar y Decoracion",
  "Construccion y Remodelacion","Servicios Profesionales","Educacion y Cursos",
  "Tecnologia e Informatica","Marketing y Publicidad","Fotografia y Video",
  "Eventos y Entretenimiento","Turismo y Viajes","Mascotas","Moda y Accesorios",
  "Finanzas y Seguros","Bienes Raices","Transporte y Logistica","Agricultura y Campo",
  "Arte y Diseno","Reparaciones y Mantenimiento","Supermercados y Minimercados",
  "Bebes y Ninos","Librerias y Papelirias","Videojuegos y Tecnologia",
  "Limpieza y Servicios Domesticos","Industria y Manufactura","Inmobiliaria",
  "Medicos","Abogados","Deporte","Noticias","Blog Personal"
];

const SERVICIOS_DMS = [
  { id: "web", label: "Pagina Web / Landing Page", emoji: "🌐", desc: "Creamos tu sitio web profesional con IA" },
  { id: "publicidad", label: "Publicidad Digital", emoji: "📣", desc: "Facebook Ads, Instagram Ads y Google Ads" },
  { id: "redes", label: "Redes Sociales", emoji: "📱", desc: "Gestion de contenido y crecimiento organico" },
  { id: "ia", label: "Automatizacion IA", emoji: "🤖", desc: "Chatbots, flujos automaticos y asistentes" },
  { id: "todo", label: "No se / Necesito asesoria", emoji: "💡", desc: "Te orientamos sin compromiso" },
];

const PLANES = [
  { name: "Basico", price: "$499.000 COP", slug: "emprendedor", items: ["Landing page profesional","Diseno responsive","Boton WhatsApp","1 revision"] },
  { name: "Profesional", price: "$999.000 COP", slug: "negocio", items: ["Sitio web completo","SEO basico","Publicidad digital","3 revisiones"], popular: true },
  { name: "Empresarial", price: "Personalizado", slug: "premium", items: ["Todo incluido","Automatizacion IA","Soporte prioritario","Revisiones ilimitadas"] },
];

type Msg = { role: "bot" | "user"; text?: string; type?: string; data?: any };
type Step = "inicio" | "detecting" | "confirm_category" | "show_cats" | "ask_name" | "ask_email" | "ask_whatsapp" | "ask_project" | "generating" | "done" | "servicio_publicidad" | "servicio_redes" | "servicio_ia" | "asesoria" | "show_planes";

export default function ChatbotDMS() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<Step>("inicio");
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [lead, setLead] = useState({ nombre: "", email: "", whatsapp: "" });
  const [projectName, setProjectName] = useState("");
  const [demoId, setDemoId] = useState("");
  const [servicio, setServicio] = useState("");
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      if (msgs.length === 0) {
        setTimeout(() => addBot("👋 Hola! Bienvenido a *DMS Digital Media Studio*.\n\nSoy tu asistente virtual. Estoy aqui para ayudarte a hacer crecer tu negocio con tecnologia e inteligencia artificial.\n\n¿En que te puedo ayudar hoy?", "menu_servicios"), 400);
      }
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    if (!open && msgs.length > 0 && msgs[msgs.length-1].role === "bot") {
      setUnread(u => u + 1);
    }
  }, [msgs]);

  function addBot(text: string, type?: string, data?: any) {
    setMsgs(m => [...m, { role: "bot", text, type, data }]);
  }
  function addUser(text: string) {
    setMsgs(m => [...m, { role: "user", text }]);
  }

  function selectServicio(s: typeof SERVICIOS_DMS[0]) {
    setServicio(s.id);
    addUser(s.label);
    if (s.id === "web") {
      addBot("Excelente! Tenemos el *AI Website Builder* que crea tu pagina web profesional en minutos con inteligencia artificial.\n\nCuentame, ¿que tipo de negocio tienes? Por ejemplo: tengo un restaurante, soy abogado, vendo ropa...");
      setStep("detecting");
    } else if (s.id === "publicidad") {
      addBot("📣 *Publicidad Digital con DMS*\n\nGestionamos campanas en:\n• Facebook e Instagram Ads\n• Google Ads\n• TikTok Ads\n\nCreamos anuncios que convierten y optimizamos tu presupuesto para maximo retorno.\n\n¿Quieres ver nuestros planes o prefieres una asesoria personalizada?", "opciones_publicidad");
      setStep("servicio_publicidad");
    } else if (s.id === "redes") {
      addBot("📱 *Gestion de Redes Sociales*\n\nNos encargamos de:\n• Creacion de contenido\n• Publicacion diaria\n• Crecimiento organico\n• Reportes mensuales\n\n¿Quieres ver nuestros planes o una asesoria?", "opciones_redes");
      setStep("servicio_redes");
    } else if (s.id === "ia") {
      addBot("🤖 *Automatizacion con Inteligencia Artificial*\n\nCreamos para tu negocio:\n• Chatbots 24/7\n• Flujos automaticos de ventas\n• Asistentes virtuales\n• Integracion con WhatsApp\n\n¿Quieres ver nuestros planes o una asesoria?", "opciones_ia");
      setStep("servicio_ia");
    } else {
      addBot("💡 Sin problema! Cuentame un poco sobre tu negocio y te orientamos hacia la mejor solucion digital.\n\n¿A que te dedicas o que tipo de negocio tienes?");
      setStep("asesoria");
    }
  }

  function selectPlan(plan: typeof PLANES[0]) {
    addUser(`Me interesa el plan ${plan.name}`);
    addBot(`Perfecto! El plan *${plan.name}* (${plan.price}) es ideal para ti.\n\nPara continuar necesito tus datos. ¿Cual es tu nombre?`);
    setStep("ask_name");
  }

  async function handleSend() {
    const val = input.trim();
    if (!val || loading) return;
    setInput("");
    addUser(val);

    if (step === "detecting" || step === "asesoria") {
      setLoading(true);
      try {
        const res = await fetch("/api/chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "detect", message: val }),
        });
        const data = await res.json();
        if (data.categoria) {
          setCategory(data.categoria);
          addBot(`✅ Detecte que tu negocio es: *${data.categoria}*\n\n${data.mensaje}\n\n¿Generamos ahora mismo una demo GRATIS de tu pagina web? Responde *Si* para continuar.`);
          setStep("confirm_category");
        } else {
          addBot(data.mensaje ?? "No pude detectar el tipo de negocio exacto. Selecciona tu categoria:");
          setStep("show_cats");
        }
      } catch {
        addBot("Hubo un error. Por favor selecciona tu categoria:");
        setStep("show_cats");
      } finally {
        setLoading(false);
      }
    } else if (step === "confirm_category") {
      const lower = val.toLowerCase();
      if (lower.includes("si") || lower.includes("s") || lower.includes("claro") || lower.includes("ok") || lower.includes("dale") || lower.includes("listo") || lower.includes("yes")) {
        addBot(`Genial! Para crear tu demo personalizada necesito algunos datos rapidos.\n\n¿Cual es tu nombre?`);
        setStep("ask_name");
      } else {
        addBot("Sin problema! Selecciona tu categoria del negocio:");
        setStep("show_cats");
      }
    } else if (step === "servicio_publicidad" || step === "servicio_redes" || step === "servicio_ia") {
      const lower = val.toLowerCase();
      if (lower.includes("plan") || lower.includes("precio") || lower.includes("costo") || lower.includes("ver")) {
        addBot("Aqui nuestros planes:", "planes");
        setStep("show_planes");
      } else {
        addBot("Perfecto! Te conectamos con un asesor. Primero necesito tus datos.\n\n¿Cual es tu nombre?");
        setStep("ask_name");
      }
    } else if (step === "ask_name") {
      setLead(l => ({ ...l, nombre: val }));
      addBot(`Mucho gusto *${val}*! ¿Cual es tu correo electronico?`);
      setStep("ask_email");
    } else if (step === "ask_email") {
      setLead(l => ({ ...l, email: val }));
      addBot("Perfecto! ¿Y tu numero de WhatsApp?");
      setStep("ask_whatsapp");
    } else if (step === "ask_whatsapp") {
      const newLead = { ...lead, whatsapp: val };
      setLead(newLead);
      if (servicio === "web" || category) {
        addBot("Ultimo paso: ¿Como se llama tu negocio o proyecto?");
        setStep("ask_project");
      } else {
        addBot(`Listo *${lead.nombre}*! Un asesor de DMS se pondra en contacto contigo pronto por WhatsApp o correo.\n\nTambien puedes escribirnos directamente:`, "contacto_final");
        await saveLead({ ...newLead }, "asesoria");
        setStep("done");
      }
    } else if (step === "ask_project") {
      setProjectName(val);
      addBot(`Listo! Generando tu demo para *${val}* — categoria *${category}*. Dame un momento... ⚡`);
      setStep("generating");
      await generateDemo(val, { ...lead, whatsapp: lead.whatsapp });
    }
  }

  async function saveLead(leadData: typeof lead, fuente: string) {
    try {
      await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_lead", lead: leadData, categoria: servicio, fuente }),
      });
    } catch {}
  }

  async function generateDemo(projName: string, leadData: typeof lead) {
    setLoading(true);
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", category, project_name: projName, lead: leadData }),
      });
      const data = await res.json();
      if (data.demo_id) {
        setDemoId(data.demo_id);
        addBot(`🎉 *Tu demo esta lista, ${leadData.nombre}!*\n\nHemos creado una pagina web profesional para *${projName}* con inteligencia artificial.\n\nHaz clic abajo para verla:`, "demo_lista");
        setStep("done");
      } else {
        addBot("Hubo un error generando la demo. Por favor contactanos directamente por WhatsApp.");
        setStep("done");
      }
    } catch {
      addBot("Error generando la demo. Contactanos por WhatsApp.");
      setStep("done");
    } finally {
      setLoading(false);
    }
  }

  function selectCategory(cat: string) {
    setCategory(cat);
    addUser(cat);
    addBot(`Perfecto! *${cat}* es una excelente categoria.\n\nUna landing page profesional te ayudara a conseguir mas clientes y diferenciarte de la competencia.\n\n¿Generamos tu demo GRATIS ahora? Responde *Si* para continuar.`);
    setStep("confirm_category");
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const placeholder =
    step === "ask_name" ? "Tu nombre completo..." :
    step === "ask_email" ? "Tu correo electronico..." :
    step === "ask_whatsapp" ? "Tu numero WhatsApp..." :
    step === "ask_project" ? "Nombre de tu negocio..." :
    "Escribe tu mensaje...";

  const showInput = !["inicio", "done"].includes(step) && step !== "show_cats" && step !== "show_planes";

  return (
    <>
      {/* BOTON FLOTANTE */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position:"fixed",bottom:24,right:24,zIndex:9999,
          width:62,height:62,borderRadius:"50%",
          background:"linear-gradient(135deg,#7c3aed,#4f46e5)",
          border:"none",cursor:"pointer",
          boxShadow:"0 4px 28px rgba(124,58,237,0.55)",
          display:"flex",alignItems:"center",justifyContent:"center",
          transition:"transform 0.2s",
        }}
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

      {/* VENTANA */}
      {open && (
        <div style={{
          position:"fixed",bottom:98,right:24,zIndex:9998,
          width:370,maxHeight:580,borderRadius:20,
          background:"#fff",boxShadow:"0 8px 48px rgba(0,0,0,0.18)",
          display:"flex",flexDirection:"column",overflow:"hidden",
          fontFamily:"'Segoe UI',sans-serif",
        }}>
          {/* HEADER */}
          <div style={{background:"linear-gradient(135deg,#7c3aed,#4f46e5)",padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:42,height:42,borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 8v4l3 3"/></svg>
            </div>
            <div style={{flex:1}}>
              <p style={{color:"#fff",fontWeight:700,fontSize:14,margin:0}}>DMS Asistente IA</p>
              <p style={{color:"rgba(255,255,255,0.75)",fontSize:11,margin:0}}>Digital Media Studio • En linea</p>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"#4ade80"}}/>
              <span style={{color:"rgba(255,255,255,0.8)",fontSize:11}}>Online</span>
            </div>
          </div>

          {/* MENSAJES */}
          <div style={{flex:1,overflowY:"auto",padding:"14px",display:"flex",flexDirection:"column",gap:10,maxHeight:400}}>
            {msgs.map((m, i) => (
              <div key={i}>
                {m.role === "bot" && m.text && (
                  <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2a10 10 0 1 0 10 10"/></svg>
                    </div>
                    <div style={{maxWidth:"85%",padding:"10px 14px",borderRadius:"4px 18px 18px 18px",background:"#f3f4f6",color:"#111",fontSize:13,lineHeight:1.55,whiteSpace:"pre-wrap"}}>
                      {m.text.split("*").map((part,pi)=>pi%2===1?<strong key={pi}>{part}</strong>:part)}
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

                {/* MENU SERVICIOS */}
                {m.type === "menu_servicios" && (
                  <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:6,paddingLeft:36}}>
                    {SERVICIOS_DMS.map(s => (
                      <button key={s.id} onClick={()=>selectServicio(s)} style={{textAlign:"left",padding:"10px 14px",borderRadius:12,border:"1px solid #e5e7eb",background:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,color:"#111",display:"flex",alignItems:"center",gap:8,transition:"all 0.15s"}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor="#7c3aed";e.currentTarget.style.background="#f5f3ff"}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor="#e5e7eb";e.currentTarget.style.background="#fff"}}>
                        <span style={{fontSize:18}}>{s.emoji}</span>
                        <div>
                          <div>{s.label}</div>
                          <div style={{fontSize:11,color:"#9ca3af",fontWeight:400}}>{s.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* OPCIONES SI/NO */}
                {(m.type === "opciones_publicidad" || m.type === "opciones_redes" || m.type === "opciones_ia") && (
                  <div style={{marginTop:8,display:"flex",gap:8,paddingLeft:36,flexWrap:"wrap"}}>
                    {["Ver planes y precios","Quiero una asesoria"].map(op=>(
                      <button key={op} onClick={()=>{setInput(op);setTimeout(()=>handleSend(),50)}} style={{padding:"8px 14px",borderRadius:999,border:"1px solid #7c3aed",background:"#f5f3ff",color:"#7c3aed",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                        {op}
                      </button>
                    ))}
                  </div>
                )}

                {/* PLANES */}
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
                          {p.name==="Empresarial"?"Contactar asesor":"Elegir este plan"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* CATEGORIAS */}
                {m.type === "categorias" && (
                  <div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:6,paddingLeft:36}}>
                    {CATEGORIAS.map(cat=>(
                      <button key={cat} onClick={()=>selectCategory(cat)} style={{padding:"5px 11px",borderRadius:999,fontSize:11,fontWeight:600,cursor:"pointer",background:"#f3f0ff",color:"#7c3aed",border:"1px solid #ddd6fe"}}>
                        {cat}
                      </button>
                    ))}
                  </div>
                )}

                {/* DEMO LISTA */}
                {m.type === "demo_lista" && demoId && (
                  <div style={{marginTop:8,paddingLeft:36,display:"flex",flexDirection:"column",gap:8}}>
                    <a href={`/demo/${demoId}`} target="_blank" style={{display:"block",textAlign:"center",padding:"12px",borderRadius:12,background:"linear-gradient(135deg,#7c3aed,#4f46e5)",color:"#fff",fontWeight:700,fontSize:13,textDecoration:"none"}}>
                      🚀 Ver mi demo ahora
                    </a>
                    <a href="/planes" style={{display:"block",textAlign:"center",padding:"10px",borderRadius:12,border:"2px solid #7c3aed",color:"#7c3aed",fontWeight:700,fontSize:13,textDecoration:"none"}}>
                      Ver planes y precios
                    </a>
                  </div>
                )}

                {/* CONTACTO FINAL */}
                {m.type === "contacto_final" && (
                  <div style={{marginTop:8,paddingLeft:36,display:"flex",flexDirection:"column",gap:6}}>
                    <a href="https://wa.me/573000000000" target="_blank" style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:12,background:"#25D366",color:"#fff",fontWeight:700,fontSize:13,textDecoration:"none"}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.533 5.858L0 24l6.335-1.54A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 0 1-5.032-1.384l-.36-.214-3.733.908.949-3.638-.235-.374A9.818 9.818 0 0 1 12 2.182c5.42 0 9.818 4.398 9.818 9.818s-4.398 9.818-9.818 9.818z"/></svg>
                      WhatsApp directo
                    </a>
                    <a href="mailto:dms.digitalstudio@outlook.com" style={{display:"block",textAlign:"center",padding:"10px",borderRadius:12,border:"1px solid #e5e7eb",color:"#666",fontSize:12,textDecoration:"none"}}>
                      dms.digitalstudio@outlook.com
                    </a>
                  </div>
                )}
              </div>
            ))}

            {/* CATEGORIAS INLINE */}
            {step === "show_cats" && (
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:4}}>
                {CATEGORIAS.map(cat=>(
                  <button key={cat} onClick={()=>selectCategory(cat)} style={{padding:"5px 11px",borderRadius:999,fontSize:11,fontWeight:600,cursor:"pointer",background:"#f3f0ff",color:"#7c3aed",border:"1px solid #ddd6fe"}}>
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M12 2a10 10 0 1 0 10 10"/></svg>
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

          {/* INPUT */}
          {showInput && (
            <div style={{padding:"10px 14px",borderTop:"1px solid #f0f0f0",display:"flex",gap:8}}>
              <input
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={placeholder}
                disabled={loading}
                style={{flex:1,border:"1px solid #e5e7eb",borderRadius:10,padding:"9px 12px",fontSize:13,outline:"none",background:loading?"#f9f9f9":"#fff"}}
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
