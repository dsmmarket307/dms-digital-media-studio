"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const SECTION_LABELS: Record<string, string> = {
  carrusel: "Carrusel",
  hero: "Hero Principal",
  servicios: "Servicios",
  como_funciona: "Como Funciona",
  estadisticas: "Estadisticas",
  portafolio: "Portafolio (textos)",
  planes: "Planes (textos)",
  testimonios: "Testimonios",
  faq: "FAQ",
  contacto: "Contacto",
  footer: "Footer",
};

const SECTIONS = Object.keys(SECTION_LABELS);

const DEFAULT_LANDING: any = {
  carrusel: { imagenes: ["/carousel-1.png", "/carousel-2.png", "/carousel-3.png", "/carousel-4.png"] },
  hero: {
    titulo: "Tu negocio digital completo en",
    titulo_resaltado: "minutos",
    subtitulo: "Crea tu pagina web con IA, gestiona clientes, automatiza procesos y aumenta tus ventas desde una sola plataforma, con soporte real de nuestro equipo en Colombia.",
    boton_principal: "Crear mi negocio digital",
    boton_secundario: "Ver como funciona",
    video_url: "/sitio-demo.mp4",
  },
  servicios: {
    badge: "SOPORTE LOCAL EN PEREIRA, COLOMBIA",
    titulo: "Todo lo que necesitas para crecer online",
    subtitulo: "Crea tu presencia digital, gestiona clientes y automatiza tu negocio desde una sola plataforma, con atencion cercana y en espanol de nuestro equipo colombiano.",
    items: [
      { slug: "diseno-web", titulo: "Sitios Web con IA", descripcion: "Crea paginas web profesionales optimizadas para captar clientes en minutos." },
      { slug: "publicidad-digital", titulo: "Marketing y Captacion", descripcion: "Genera mas oportunidades con herramientas de crecimiento digital." },
      { slug: "automatizacion-ia", titulo: "Automatizaciones Inteligentes", descripcion: "Automatiza tareas repetitivas y responde clientes las 24 horas." },
      { slug: "redes-sociales", titulo: "Gestion de Clientes", descripcion: "Organiza contactos, oportunidades y ventas desde un CRM integrado." },
    ],
  },
  como_funciona: {
    titulo: "Como funciona DMS",
    subtitulo: "Pon tu negocio online y comienza a captar clientes en pocos pasos.",
    boton: "Comenzar ahora",
    pasos: [
      { num: "01", titulo: "Elige un plan", descripcion: "Selecciona la solucion ideal para tu negocio." },
      { num: "02", titulo: "Crea tu sitio con IA", descripcion: "Genera una web profesional optimizada para convertir visitantes en clientes." },
      { num: "03", titulo: "Activa tus herramientas", descripcion: "Conecta CRM, formularios, reservas y automatizaciones." },
      { num: "04", titulo: "Comienza a vender", descripcion: "Gestiona clientes y haz crecer tu negocio desde una sola plataforma." },
    ],
  },
  estadisticas: {
    titulo: "Resultados que hablan por nosotros",
    subtitulo: "Empresas y emprendedores que ya confian en DMS Digital Media Studio",
    items: [
      { valor: 100, sufijo: "+", label: "Clientes satisfechos" },
      { valor: 3, sufijo: "+", label: "Paises atendidos" },
      { valor: 2, sufijo: "+", label: "Anos de experiencia" },
      { valor: 150, sufijo: "+", label: "Sitios web creados" },
    ],
  },
  portafolio: {
    badge: "GENERADO CON IA",
    titulo: "Sitios web generados con IA",
    subtitulo: "Explora ejemplos de sitios creados con IA y listos para impulsar negocios reales.",
    boton: "Ver portafolio completo",
  },
  planes: {
    titulo: "Planes para tu negocio",
    subtitulo: "Sin pagos unicos. Sin contratos. Cancela cuando quieras. Prueba 7 dias gratis.",
    badges: ["Garantia los primeros 7 dias", "Pago seguro con Mercado Pago", "Visa - Mastercard"],
  },
  testimonios: {
    titulo: "Lo que dicen nuestros clientes",
    subtitulo: "Resultados reales de negocios que confiaron en nosotros.",
    items: [
      { nombre: "Carlos Ramirez", cargo: "Dueno de Restaurante, Pereira", texto: "Cree mi sitio web en minutos con la IA de DMS. En 30 dias ya tenia reservas online todos los dias.", inicial: "C" },
      { nombre: "Maria Gonzalez", cargo: "Directora, Clinica Estetica Cali", texto: "El agente IA atiende a mis clientes las 24 horas. Ya no pierdo consultas por no responder rapido.", inicial: "M" },
      { nombre: "Andres Torres", cargo: "Gerente, Inmobiliaria El Dorado", texto: "El CRM me ayuda a hacer seguimiento a cada cliente. Cerre 15 negocios en 2 meses desde que use DMS.", inicial: "A" },
      { nombre: "Laura Ospina", cargo: "Emprendedora, Boutique Moda", texto: "En menos de 10 minutos tenia mi landing page lista. Mis clientes me dicen que se ve muy profesional.", inicial: "L" },
      { nombre: "Ricardo Mejia", cargo: "Abogado, Firma Mejia y Asociados", texto: "Mi sitio aparece en Google y los clientes me encuentran solos. DMS cambio mi negocio completamente.", inicial: "R" },
      { nombre: "Sandra Perez", cargo: "Gerente, Spa Zen Bogota", texto: "El formulario de reservas y la galeria de fotos hicieron que mis ventas subieran un 40% el primer mes.", inicial: "S" },
    ],
  },
  faq: {
    titulo: "Preguntas frecuentes",
    subtitulo: "Todo lo que necesitas saber antes de empezar.",
    items: [
      { pregunta: "Cuanto cuesta usar DMS?", respuesta: "Los planes van desde $49.000/mes. Todos incluyen 7 dias de prueba gratis sin necesidad de tarjeta de credito." },
      { pregunta: "En cuanto tiempo puedo tener mi sitio web listo?", respuesta: "Con nuestro constructor de IA tu sitio puede estar listo en minutos. Solo describes tu negocio y la IA genera todo automaticamente." },
      { pregunta: "Necesito conocimientos tecnicos?", respuesta: "No. DMS esta disenado para que cualquier persona pueda crear y gestionar su sitio sin saber programacion." },
      { pregunta: "Que incluye el plan Profesional?", respuesta: "Sitio completo, editor profesional, galeria, SEO basico, formulario de contacto, reservas, dominio personalizado y leads integrados. Todo desde $99.000/mes." },
      { pregunta: "Puedo cancelar cuando quiera?", respuesta: "Si. No hay contratos de permanencia. Cancelas cuando quieras desde tu panel sin ninguna penalizacion." },
      { pregunta: "Como funciona el pago?", respuesta: "Los pagos son mensuales a traves de Mercado Pago. Los primeros 7 dias son completamente gratis, luego se cobra automaticamente segun el plan elegido." },
    ],
  },
  contacto: {
    titulo: "Tienes dudas? Hablemos",
    subtitulo: "Escribenos y te ayudamos a elegir el plan ideal para tu negocio en menos de 24 horas.",
  },
  footer: {
    descripcion: "Desarrollo web, marketing digital, automatizacion e inteligencia artificial para empresas y emprendedores.",
    email: "contacto@dmsdigitalstudio.com",
    telefono: "+57 315 565 4948",
    ciudad: "Pereira, Colombia",
  },
};

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  const [local, setLocal] = useState(value ?? "");
  useEffect(() => { setLocal(value ?? ""); }, [value]);
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.5px" }}>{label}</label>
      {multiline ? (
        <textarea value={local} onChange={e => setLocal(e.target.value)} onBlur={() => onChange(local)} rows={3} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box" as const }} />
      ) : (
        <input value={local} onChange={e => setLocal(e.target.value)} onBlur={() => onChange(local)} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
      )}
    </div>
  );
}

function ListEditor({ items, fields, onChange, addLabel, newItem }: { items: any[]; fields: { key: string; label: string; multiline?: boolean }[]; onChange: (items: any[]) => void; addLabel: string; newItem: any }) {
  function updateItem(i: number, key: string, value: string) {
    const next = items.map((it, idx) => idx === i ? { ...it, [key]: value } : it);
    onChange(next);
  }
  function removeItem(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  function addItem() {
    onChange([...items, { ...newItem }]);
  }
  function moveItem(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 14, marginBottom: 12, background: "#fafafa" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed" }}>#{i + 1}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => moveItem(i, -1)} disabled={i === 0} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", cursor: i === 0 ? "not-allowed" : "pointer", opacity: i === 0 ? 0.4 : 1 }}>↑</button>
              <button onClick={() => moveItem(i, 1)} disabled={i === items.length - 1} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", cursor: i === items.length - 1 ? "not-allowed" : "pointer", opacity: i === items.length - 1 ? 0.4 : 1 }}>↓</button>
              <button onClick={() => removeItem(i)} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", cursor: "pointer" }}>Eliminar</button>
            </div>
          </div>
          {fields.map(f => (
            <Field key={f.key} label={f.label} value={item[f.key] ?? ""} onChange={v => updateItem(i, f.key, v)} multiline={f.multiline} />
          ))}
        </div>
      ))}
      <button onClick={addItem} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px dashed #7c3aed", background: "rgba(124,58,237,0.05)", color: "#7c3aed", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ {addLabel}</button>
    </div>
  );
}

function StringListEditor({ items, onChange, addLabel, placeholder }: { items: string[]; onChange: (items: string[]) => void; addLabel: string; placeholder: string }) {
  function update(i: number, v: string) {
    onChange(items.map((it, idx) => idx === i ? v : it));
  }
  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  function add() {
    onChange([...items, ""]);
  }
  return (
    <div>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input value={it} onChange={e => update(i, e.target.value)} placeholder={placeholder} style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13, outline: "none" }} />
          <button onClick={() => remove(i)} style={{ fontSize: 11, padding: "0 12px", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", cursor: "pointer" }}>X</button>
        </div>
      ))}
      <button onClick={add} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px dashed #7c3aed", background: "rgba(124,58,237,0.05)", color: "#7c3aed", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ {addLabel}</button>
    </div>
  );
}

function ImageListEditor({ images, onChange, uploading, onUpload }: { images: string[]; onChange: (imgs: string[]) => void; uploading: boolean; onUpload: (i: number, file: File) => void }) {
  function remove(i: number) {
    onChange(images.filter((_, idx) => idx !== i));
  }
  function add() {
    onChange([...images, ""]);
  }
  return (
    <div>
      {images.map((url, i) => (
        <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, marginBottom: 10 }}>
          {url && <img src={url} alt="" style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />}
          <div style={{ display: "flex", gap: 8 }}>
            <label style={{ flex: 1, textAlign: "center", padding: "7px", borderRadius: 8, background: "#f3f4f6", color: "#555", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {uploading ? "Subiendo..." : "Subir imagen"}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(i, f); }} />
            </label>
            <button onClick={() => remove(i)} style={{ fontSize: 11, padding: "0 12px", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", color: "#b91c1c", cursor: "pointer" }}>Eliminar</button>
          </div>
        </div>
      ))}
      <button onClick={add} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px dashed #7c3aed", background: "rgba(124,58,237,0.05)", color: "#7c3aed", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ Agregar imagen</button>
    </div>
  );
}

export default function MiSitioDMS() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedSection, setSelectedSection] = useState("hero");
  const [lc, setLc] = useState<any>(DEFAULT_LANDING);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [view, setView] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (prof?.role !== "admin") { router.push("/dashboard/client"); return; }
      const { data } = await supabase.from("dms_landing_config").select("content").eq("id", 1).maybeSingle();
      if (data?.content && Object.keys(data.content).length > 0) {
        setLc((prev: any) => ({ ...prev, ...data.content }));
      }
      setLoading(false);
    }
    check();
  }, []);

  useEffect(() => {
    const imgs = lc.carrusel?.imagenes ?? [];
    if (imgs.length === 0) return;
    const interval = setInterval(() => setCurrent(p => (p + 1) % imgs.length), 3500);
    return () => clearInterval(interval);
  }, [lc.carrusel?.imagenes]);

  function updateField(section: string, key: string, value: any) {
    setLc((prev: any) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  }

  async function handleUploadCarrusel(i: number, file: File) {
    setUploadingIdx(i);
    const ext = file.name.split(".").pop();
    const fileName = `carrusel-${Date.now()}-${i}.${ext}`;
    await supabase.storage.from("logos").upload(fileName, file, { upsert: true });
    const { data } = supabase.storage.from("logos").getPublicUrl(fileName);
    const imgs = [...(lc.carrusel?.imagenes ?? [])];
    imgs[i] = data.publicUrl;
    updateField("carrusel", "imagenes", imgs);
    setUploadingIdx(null);
  }

  async function handleSave() {
    setSaving(true);
    await supabase.from("dms_landing_config").update({ content: lc, updated_at: new Date().toISOString() }).eq("id", 1);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontSize: 13 }}>Cargando editor...</div>;
  }

  const pr = "#7c3aed";
  const carruselImgs = lc.carrusel?.imagenes ?? [];
  const previewWidth = view === "desktop" ? "100%" : view === "tablet" ? "768px" : "375px";
  const siteUrl = typeof window !== "undefined" ? window.location.origin + "/" : "/";

  return (
    <div style={{ height: "100vh", background: "#f0f0f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`* { box-sizing: border-box; }`}</style>

      {/* TOPBAR */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexShrink: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.push("/dashboard/admin")} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#555", display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Volver
          </button>
          <span style={{ fontWeight: 800, fontSize: 15, color: "#111" }}>Mi Sitio DMS</span>
          <span style={{ fontSize: 11, background: "rgba(124,58,237,0.1)", color: "#7c3aed", padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>Editor de Landing</span>
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {(["desktop", "tablet", "mobile"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: view === v ? pr : "#f3f4f6", color: view === v ? "#fff" : "#555", display: "flex", alignItems: "center", gap: 5 }}>
              {v === "desktop" && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>}
              {v === "tablet" && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>}
              {v === "mobile" && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>}
              {v === "desktop" ? "Desktop" : v === "tablet" ? "Tablet" : "Mobile"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "6px 12px" }}>
            <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>En vivo</span>
            <a href={siteUrl} target="_blank" style={{ fontSize: 11, color: "#16a34a", fontWeight: 700, textDecoration: "underline", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{siteUrl}</a>
          </div>
          <button onClick={handleSave} disabled={saving} style={{ background: saved ? "#10b981" : pr, color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            {saving ? "Guardando..." : saved ? "Guardado ✓" : "Guardar cambios"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* PANEL IZQUIERDO - SECCIONES */}
        <div style={{ width: 200, background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", overflow: "auto", flexShrink: 0 }}>
          <div style={{ padding: "12px 14px 8px", borderBottom: "1px solid #f0f0f0" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>Secciones</p>
          </div>
          <nav style={{ padding: "8px 8px", flex: 1 }}>
            {SECTIONS.map(s => (
              <button key={s} onClick={() => setSelectedSection(s)} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer", marginBottom: 3, fontWeight: selectedSection === s ? 700 : 500, fontSize: 12, background: selectedSection === s ? `${pr}15` : "transparent", color: selectedSection === s ? pr : "#555", borderLeft: selectedSection === s ? `3px solid ${pr}` : "3px solid transparent" }}>
                {SECTION_LABELS[s]}
              </button>
            ))}
          </nav>
        </div>

        {/* PANEL CENTRAL - PREVIEW */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px", background: "#e0e0e0", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 8, padding: "6px 12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", flexShrink: 0, alignSelf: "flex-start" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span style={{ fontSize: 11, color: "#888", fontWeight: 600 }}>Vista previa</span>
            <span style={{ fontSize: 11, color: "#aaa" }}>|</span>
            <span style={{ fontSize: 11, color: "#555", fontWeight: 600 }}>{view === "desktop" ? "Escritorio" : view === "tablet" ? "Tableta" : "Movil"}</span>
          </div>

          <div style={{ width: previewWidth, maxWidth: "100%", background: "#fff", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.12)", transition: "width 0.3s", overflow: "hidden" }}>

            {selectedSection === "carrusel" && carruselImgs.length > 0 && (
              <div>
                {carruselImgs[current] && <img src={carruselImgs[current]} alt="" style={{ width: "100%", display: "block" }} />}
                <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: 12 }}>
                  {carruselImgs.map((_: string, i: number) => (
                    <div key={i} style={{ width: i === current ? 28 : 8, height: 8, borderRadius: 4, background: i === current ? pr : "rgba(0,0,0,0.2)" }} />
                  ))}
                </div>
              </div>
            )}

            {selectedSection === "hero" && (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <h1 style={{ fontSize: view === "mobile" ? 26 : 38, fontWeight: 800, margin: 0 }}>{lc.hero.titulo} <span style={{ color: pr }}>{lc.hero.titulo_resaltado}</span></h1>
                <p style={{ color: "#888", marginTop: 16 }}>{lc.hero.subtitulo}</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
                  <span style={{ background: pr, color: "#fff", padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>{lc.hero.boton_principal}</span>
                  <span style={{ border: "1px solid #e5e7eb", padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>{lc.hero.boton_secundario}</span>
                </div>
              </div>
            )}

            {selectedSection === "servicios" && (
              <div style={{ padding: "36px 20px", background: "#fafafa" }}>
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: pr, background: "rgba(124,58,237,0.1)", padding: "4px 12px", borderRadius: 20 }}>{lc.servicios.badge}</span>
                </div>
                <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 800, margin: "10px 0" }}>{lc.servicios.titulo}</h2>
                <p style={{ textAlign: "center", color: "#888", fontSize: 13, marginBottom: 20 }}>{lc.servicios.subtitulo}</p>
                <div style={{ display: "grid", gridTemplateColumns: view === "mobile" ? "1fr" : "repeat(2, 1fr)", gap: 12 }}>
                  {(lc.servicios.items ?? []).map((s: any, i: number) => (
                    <div key={i} style={{ background: "#fff", borderRadius: 10, padding: 14, border: "1px solid #eee" }}>
                      <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 4px" }}>{s.titulo}</p>
                      <p style={{ fontSize: 12, color: "#888", margin: 0 }}>{s.descripcion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedSection === "como_funciona" && (
              <div style={{ padding: "36px 20px" }}>
                <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>{lc.como_funciona.titulo}</h2>
                <p style={{ textAlign: "center", color: "#888", fontSize: 13, marginBottom: 20 }}>{lc.como_funciona.subtitulo}</p>
                <div style={{ display: "grid", gridTemplateColumns: view === "mobile" ? "1fr" : "repeat(2, 1fr)", gap: 16 }}>
                  {(lc.como_funciona.pasos ?? []).map((p: any, i: number) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: pr, color: "#fff", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>{p.num}</div>
                      <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 4px" }}>{p.titulo}</p>
                      <p style={{ fontSize: 12, color: "#888", margin: 0 }}>{p.descripcion}</p>
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: "center", marginTop: 20 }}>
                  <span style={{ background: pr, color: "#fff", padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>{lc.como_funciona.boton}</span>
                </div>
              </div>
            )}

            {selectedSection === "estadisticas" && (
              <div style={{ padding: "36px 20px", background: `linear-gradient(135deg, ${pr} 0%, #5b21b6 100%)` }}>
                <h2 style={{ textAlign: "center", color: "#fff", fontSize: 20, fontWeight: 800, margin: "0 0 6px" }}>{lc.estadisticas.titulo}</h2>
                <p style={{ textAlign: "center", color: "rgba(255,255,255,0.75)", fontSize: 13, marginBottom: 20 }}>{lc.estadisticas.subtitulo}</p>
                <div style={{ display: "grid", gridTemplateColumns: view === "mobile" ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12 }}>
                  {(lc.estadisticas.items ?? []).map((s: any, i: number) => (
                    <div key={i} style={{ textAlign: "center", background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: 12 }}>
                      <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>{s.valor}{s.sufijo}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedSection === "portafolio" && (
              <div style={{ padding: "36px 20px", background: "#fafafa" }}>
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: pr, background: "rgba(124,58,237,0.1)", padding: "4px 12px", borderRadius: 20 }}>{lc.portafolio.badge}</span>
                </div>
                <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 800, margin: "10px 0" }}>{lc.portafolio.titulo}</h2>
                <p style={{ textAlign: "center", color: "#888", fontSize: 13, marginBottom: 20 }}>{lc.portafolio.subtitulo}</p>
                <div style={{ textAlign: "center" }}>
                  <span style={{ background: pr, color: "#fff", padding: "10px 22px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>{lc.portafolio.boton}</span>
                </div>
              </div>
            )}

            {selectedSection === "planes" && (
              <div style={{ padding: "36px 20px", background: "#fafafa" }}>
                <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>{lc.planes.titulo}</h2>
                <p style={{ textAlign: "center", color: "#888", fontSize: 13, marginBottom: 16 }}>{lc.planes.subtitulo}</p>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
                  {(lc.planes.badges ?? []).map((b: string, i: number) => (
                    <span key={i} style={{ fontSize: 11, fontWeight: 700, color: "#374151", background: "#f3f4f6", padding: "5px 12px", borderRadius: 20 }}>{b}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedSection === "testimonios" && (
              <div style={{ padding: "36px 20px", background: "#fafafa" }}>
                <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>{lc.testimonios.titulo}</h2>
                <p style={{ textAlign: "center", color: "#888", fontSize: 13, marginBottom: 20 }}>{lc.testimonios.subtitulo}</p>
                <div style={{ display: "grid", gridTemplateColumns: view === "mobile" ? "1fr" : "repeat(2, 1fr)", gap: 12 }}>
                  {(lc.testimonios.items ?? []).map((t: any, i: number) => (
                    <div key={i} style={{ background: "#fff", borderRadius: 10, padding: 14, border: "1px solid #eee" }}>
                      <p style={{ fontSize: 12, color: "#555", fontStyle: "italic", margin: "0 0 10px" }}>"{t.texto}"</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: pr, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>{t.inicial}</div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 12, margin: 0 }}>{t.nombre}</p>
                          <p style={{ fontSize: 10, color: "#aaa", margin: 0 }}>{t.cargo}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedSection === "faq" && (
              <div style={{ padding: "36px 20px" }}>
                <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>{lc.faq.titulo}</h2>
                <p style={{ textAlign: "center", color: "#888", fontSize: 13, marginBottom: 20 }}>{lc.faq.subtitulo}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(lc.faq.items ?? []).map((f: any, i: number) => (
                    <div key={i} style={{ border: "1px solid #eee", borderRadius: 10, padding: 14 }}>
                      <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 4px" }}>{f.pregunta}</p>
                      <p style={{ fontSize: 12, color: "#888", margin: 0 }}>{f.respuesta}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedSection === "contacto" && (
              <div style={{ padding: "36px 20px", textAlign: "center" }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>{lc.contacto.titulo}</h2>
                <p style={{ color: "#888", fontSize: 13 }}>{lc.contacto.subtitulo}</p>
              </div>
            )}

            {selectedSection === "footer" && (
              <div style={{ padding: "36px 20px", background: "#0f0f0f", color: "#fff" }}>
                <p style={{ fontSize: 12, color: "#aaa", marginBottom: 16 }}>{lc.footer.descripcion}</p>
                <p style={{ fontSize: 12, color: "#aaa", margin: "4px 0" }}>{lc.footer.email}</p>
                <p style={{ fontSize: 12, color: "#aaa", margin: "4px 0" }}>{lc.footer.telefono}</p>
                <p style={{ fontSize: 12, color: "#aaa", margin: "4px 0" }}>{lc.footer.ciudad}</p>
              </div>
            )}

          </div>
        </div>

        {/* PANEL DERECHO - CAMPOS DE EDICION */}
        <div style={{ width: 340, background: "#fff", borderLeft: "1px solid #e5e7eb", overflow: "auto", flexShrink: 0, padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: "#111", marginBottom: 16 }}>{SECTION_LABELS[selectedSection]}</h2>

          {selectedSection === "carrusel" && (
            <ImageListEditor images={carruselImgs} onChange={imgs => updateField("carrusel", "imagenes", imgs)} uploading={uploadingIdx !== null} onUpload={handleUploadCarrusel} />
          )}

          {selectedSection === "hero" && (<>
            <Field label="Titulo" value={lc.hero.titulo} onChange={v => updateField("hero", "titulo", v)} />
            <Field label="Titulo resaltado (en morado)" value={lc.hero.titulo_resaltado} onChange={v => updateField("hero", "titulo_resaltado", v)} />
            <Field label="Subtitulo" value={lc.hero.subtitulo} onChange={v => updateField("hero", "subtitulo", v)} multiline />
            <Field label="Boton principal" value={lc.hero.boton_principal} onChange={v => updateField("hero", "boton_principal", v)} />
            <Field label="Boton secundario" value={lc.hero.boton_secundario} onChange={v => updateField("hero", "boton_secundario", v)} />
            <Field label="URL del video" value={lc.hero.video_url} onChange={v => updateField("hero", "video_url", v)} />
          </>)}

          {selectedSection === "servicios" && (<>
            <Field label="Badge" value={lc.servicios.badge} onChange={v => updateField("servicios", "badge", v)} />
            <Field label="Titulo" value={lc.servicios.titulo} onChange={v => updateField("servicios", "titulo", v)} />
            <Field label="Subtitulo" value={lc.servicios.subtitulo} onChange={v => updateField("servicios", "subtitulo", v)} multiline />
            <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", margin: "20px 0 10px" }}>Tarjetas de servicios</p>
            <ListEditor
              items={lc.servicios.items ?? []}
              onChange={items => updateField("servicios", "items", items)}
              addLabel="Agregar servicio"
              newItem={{ slug: "nuevo-servicio", titulo: "Nuevo servicio", descripcion: "Descripcion" }}
              fields={[{ key: "titulo", label: "Titulo" }, { key: "descripcion", label: "Descripcion", multiline: true }]}
            />
          </>)}

          {selectedSection === "como_funciona" && (<>
            <Field label="Titulo" value={lc.como_funciona.titulo} onChange={v => updateField("como_funciona", "titulo", v)} />
            <Field label="Subtitulo" value={lc.como_funciona.subtitulo} onChange={v => updateField("como_funciona", "subtitulo", v)} multiline />
            <Field label="Texto del boton" value={lc.como_funciona.boton} onChange={v => updateField("como_funciona", "boton", v)} />
            <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", margin: "20px 0 10px" }}>Pasos</p>
            <ListEditor
              items={lc.como_funciona.pasos ?? []}
              onChange={items => updateField("como_funciona", "pasos", items)}
              addLabel="Agregar paso"
              newItem={{ num: "0" + ((lc.como_funciona.pasos?.length ?? 0) + 1), titulo: "Nuevo paso", descripcion: "Descripcion" }}
              fields={[{ key: "num", label: "Numero" }, { key: "titulo", label: "Titulo" }, { key: "descripcion", label: "Descripcion", multiline: true }]}
            />
          </>)}

          {selectedSection === "estadisticas" && (<>
            <Field label="Titulo" value={lc.estadisticas.titulo} onChange={v => updateField("estadisticas", "titulo", v)} />
            <Field label="Subtitulo" value={lc.estadisticas.subtitulo} onChange={v => updateField("estadisticas", "subtitulo", v)} multiline />
            <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", margin: "20px 0 10px" }}>Metricas</p>
            <ListEditor
              items={lc.estadisticas.items ?? []}
              onChange={items => updateField("estadisticas", "items", items)}
              addLabel="Agregar metrica"
              newItem={{ valor: 0, sufijo: "+", label: "Nueva metrica" }}
              fields={[{ key: "valor", label: "Valor (numero)" }, { key: "sufijo", label: "Sufijo (ej: +)" }, { key: "label", label: "Etiqueta" }]}
            />
          </>)}

          {selectedSection === "portafolio" && (<>
            <Field label="Badge" value={lc.portafolio.badge} onChange={v => updateField("portafolio", "badge", v)} />
            <Field label="Titulo" value={lc.portafolio.titulo} onChange={v => updateField("portafolio", "titulo", v)} />
            <Field label="Subtitulo" value={lc.portafolio.subtitulo} onChange={v => updateField("portafolio", "subtitulo", v)} multiline />
            <Field label="Texto del boton" value={lc.portafolio.boton} onChange={v => updateField("portafolio", "boton", v)} />
            <p style={{ fontSize: 11, color: "#aaa", marginTop: 12 }}>Los 6 sitios de ejemplo de esta seccion no son editables aqui.</p>
          </>)}

          {selectedSection === "planes" && (<>
            <Field label="Titulo" value={lc.planes.titulo} onChange={v => updateField("planes", "titulo", v)} />
            <Field label="Subtitulo" value={lc.planes.subtitulo} onChange={v => updateField("planes", "subtitulo", v)} multiline />
            <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", margin: "20px 0 10px" }}>Badges de confianza</p>
            <StringListEditor items={lc.planes.badges ?? []} onChange={items => updateField("planes", "badges", items)} addLabel="Agregar badge" placeholder="Texto del badge" />
            <p style={{ fontSize: 11, color: "#aaa", marginTop: 12 }}>Los precios y features de cada plan se editan desde Suscripcion, no aqui.</p>
          </>)}

          {selectedSection === "testimonios" && (<>
            <Field label="Titulo" value={lc.testimonios.titulo} onChange={v => updateField("testimonios", "titulo", v)} />
            <Field label="Subtitulo" value={lc.testimonios.subtitulo} onChange={v => updateField("testimonios", "subtitulo", v)} multiline />
            <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", margin: "20px 0 10px" }}>Testimonios</p>
            <ListEditor
              items={lc.testimonios.items ?? []}
              onChange={items => updateField("testimonios", "items", items)}
              addLabel="Agregar testimonio"
              newItem={{ nombre: "Nombre Cliente", cargo: "Cargo, Ciudad", texto: "Texto del testimonio", inicial: "N" }}
              fields={[{ key: "nombre", label: "Nombre" }, { key: "cargo", label: "Cargo / Ciudad" }, { key: "texto", label: "Testimonio", multiline: true }, { key: "inicial", label: "Inicial (avatar)" }]}
            />
          </>)}

          {selectedSection === "faq" && (<>
            <Field label="Titulo" value={lc.faq.titulo} onChange={v => updateField("faq", "titulo", v)} />
            <Field label="Subtitulo" value={lc.faq.subtitulo} onChange={v => updateField("faq", "subtitulo", v)} multiline />
            <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", margin: "20px 0 10px" }}>Preguntas</p>
            <ListEditor
              items={lc.faq.items ?? []}
              onChange={items => updateField("faq", "items", items)}
              addLabel="Agregar pregunta"
              newItem={{ pregunta: "Nueva pregunta?", respuesta: "Respuesta" }}
              fields={[{ key: "pregunta", label: "Pregunta" }, { key: "respuesta", label: "Respuesta", multiline: true }]}
            />
          </>)}

          {selectedSection === "contacto" && (<>
            <Field label="Titulo" value={lc.contacto.titulo} onChange={v => updateField("contacto", "titulo", v)} />
            <Field label="Subtitulo" value={lc.contacto.subtitulo} onChange={v => updateField("contacto", "subtitulo", v)} multiline />
          </>)}

          {selectedSection === "footer" && (<>
            <Field label="Descripcion" value={lc.footer.descripcion} onChange={v => updateField("footer", "descripcion", v)} multiline />
            <Field label="Email" value={lc.footer.email} onChange={v => updateField("footer", "email", v)} />
            <Field label="Telefono" value={lc.footer.telefono} onChange={v => updateField("footer", "telefono", v)} />
            <Field label="Ciudad" value={lc.footer.ciudad} onChange={v => updateField("footer", "ciudad", v)} />
          </>)}
        </div>
      </div>
    </div>
  );
}