"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const TIPOS = ["Landing Page", "Sitio Corporativo", "Tienda Online", "Agencia", "Restaurante", "Inmobiliaria", "Consultorio", "Portafolio", "Salon de Belleza", "Spa", "Abogados", "Contaduria", "Medicos", "Gimnasio", "Fotografia", "Tecnologia", "Turismo", "Veterinaria", "Eventos", "Consultoria", "Barberia", "Odontologia", "Farmacia", "Mecanica", "Construccion", "Educacion", "Hotel", "Panaderia", "Joyeria", "Peluqueria", "Floristeria", "Optica", "Arquitectura", "Decoracion", "Catering", "Transporte", "Seguridad", "Limpieza", "Jardineria", "Plomeria", "Electricidad", "Pintura", "Mudanzas", "Lavanderia", "Sastreria", "Zapateria", "Libreria", "Papeleria", "Ferreteria", "Supermercado", "Carniceria", "Pescaderia", "Fruteria", "Heladeria", "Cafeteria", "Bar", "Discoteca", "Teatro", "Museo", "Galeria Arte", "Ingenieria Civil", "Deporte", "Noticias", "Blog Personal", "Musica", "Psicologia", "Nutricion", "Moda", "ONG", "Otro"];
const TEMAS = ["Moderno", "Corporativo", "Premium", "Minimalista"];

const PLAN_ACCESO: Record<string, string[]> = {
  basico:      ["/dashboard/client", "/dashboard/client/builder", "/dashboard/client/sitio", "/dashboard/client/facturacion", "/dashboard/client/soporte", "/dashboard/client/suscripcion"],
  profesional: ["/dashboard/client", "/dashboard/client/builder", "/dashboard/client/sitio", "/dashboard/client/galeria", "/dashboard/client/leads", "/dashboard/client/reservas", "/dashboard/client/facturacion", "/dashboard/client/soporte", "/dashboard/client/suscripcion"],
  empresarial: ["/dashboard/client", "/dashboard/client/builder", "/dashboard/client/sitio", "/dashboard/client/galeria", "/dashboard/client/leads", "/dashboard/client/reservas", "/dashboard/client/facturacion", "/dashboard/client/soporte", "/dashboard/client/suscripcion"],
};

const MENU = [
  { href: "/dashboard/client",             label: "Inicio"         },
  { href: "/dashboard/client/builder",     label: "Mi Editor",     active: true },
  { href: "/dashboard/client/sitio",       label: "Mi Sitio Web"   },
  { href: "/dashboard/client/galeria",     label: "Galeria"        },
  { href: "/dashboard/client/reservas",    label: "Reservas"       },
  { href: "/dashboard/client/leads",       label: "Leads"          },
  { href: "/dashboard/client/facturacion", label: "Facturacion"    },
  { href: "/dashboard/client/soporte",     label: "Soporte"        },
  { href: "/dashboard/client/suscripcion", label: "Mi Suscripcion" },
];

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Principal", servicios: "Servicios", beneficios: "Beneficios",
  testimonios: "Testimonios", faq: "FAQ", contacto: "Contacto", footer: "Footer",
  nosotros: "Nosotros", galeria: "Galeria", equipo: "Equipo",
  estadisticas: "Estadisticas", planes: "Planes",
};

const SECTIONS_BASICO      = ["hero", "servicios", "testimonios", "contacto", "footer"];
const SECTIONS_PROFESIONAL = ["hero", "nosotros", "servicios", "beneficios", "testimonios", "faq", "contacto", "footer"];
const SECTIONS_EMPRESARIAL = ["hero", "nosotros", "servicios", "beneficios", "estadisticas", "planes", "testimonios", "faq", "galeria", "equipo", "contacto", "footer"];

function MenuItem({ item, permitido }: { item: any; permitido: boolean }) {
  if (permitido) {
    return (
      <Link href={item.href} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", borderRadius:10, textDecoration:"none", fontSize:13, fontWeight: item.active ? 700 : 500, background: item.active ? "rgba(124,58,237,0.08)" : "transparent", color: item.active ? "#7c3aed" : "#555", borderLeft: item.active ? "3px solid #7c3aed" : "3px solid transparent" }}>
        {item.label}
      </Link>
    );
  }
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", borderRadius:10, color:"#ccc", fontSize:13, fontWeight:500, cursor:"not-allowed" }}>
      <span>{item.label}</span>
      <span style={{ fontSize:10, background:"#f3f4f6", color:"#aaa", padding:"2px 7px", borderRadius:6, fontWeight:700 }}>PRO</span>
    </div>
  );
}

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  const [local, setLocal] = useState(value ?? "");
  useEffect(() => { setLocal(value ?? ""); }, [value]);
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#888", textTransform:"uppercase", marginBottom:6, letterSpacing:"0.5px" }}>{label}</label>
      {multiline ? (
        <textarea value={local} onChange={e => setLocal(e.target.value)} onBlur={() => onChange(local)} rows={3} style={{ width:"100%", border:"1px solid #e5e7eb", borderRadius:8, padding:"8px 10px", fontSize:13, outline:"none", resize:"none", boxSizing:"border-box" as const }} />
      ) : (
        <input value={local} onChange={e => setLocal(e.target.value)} onBlur={() => onChange(local)} style={{ width:"100%", border:"1px solid #e5e7eb", borderRadius:8, padding:"8px 10px", fontSize:13, outline:"none", boxSizing:"border-box" as const }} />
      )}
    </div>
  );
}

function UpgradeBadge({ plan }: { plan: string }) {
  return (
    <div style={{ background:"linear-gradient(135deg,#7c3aed,#4f46e5)", borderRadius:12, padding:"16px 20px", textAlign:"center", margin:"12px 0" }}>
      <p style={{ color:"#fff", fontWeight:700, fontSize:13, margin:"0 0 4px" }}>Funcion disponible en Plan {plan}</p>
      <p style={{ color:"rgba(255,255,255,0.7)", fontSize:12, margin:"0 0 12px" }}>Actualiza tu plan para desbloquear esta funcion</p>
      <Link href="/dashboard/client/suscripcion" style={{ background:"#fff", color:"#7c3aed", padding:"8px 20px", borderRadius:8, fontSize:12, fontWeight:700, textDecoration:"none", display:"inline-block" }}>Ver planes</Link>
    </div>
  );
}

async function fetchPexels(query: string): Promise<string> {
  try {
    const res = await fetch(`/api/pexels?query=${encodeURIComponent(query)}&per_page=1`);
    const data = await res.json();
    return data?.photos?.[0]?.src?.large ?? "";
  } catch { return ""; }
}

export default function ClientBuilder() {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingImg, setUploadingImg] = useState<string | null>(null);
  const [content, setContent] = useState<any>(null);
  const [miSitio, setMiSitio] = useState<any>(null);
  const [suscripcion, setSuscripcion] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [editando, setEditando] = useState(false);
  const [selectedSection, setSelectedSection] = useState("hero");
  const [view, setView] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [primaryColor, setPrimaryColor] = useState("#7c3aed");
  const [secondaryColor, setSecondaryColor] = useState("#000000");
  const [images, setImages] = useState<Record<string, string>>({});
  const [imgTarget, setImgTarget] = useState("");
  const [form, setForm] = useState({
    project_name: "",
    prompt: "",
    website_type: "Landing Page",
    theme: "Moderno",
    primary_color: "#7c3aed",
    secondary_color: "#000000",
  });

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUserId(user.id);
      setUserEmail(user.email ?? "");
      const [{ data: sitio }, { data: sub }] = await Promise.all([
        supabase.from("generated_websites").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      if (sitio) {
        setMiSitio(sitio);
        setContent(sitio.generated_content);
        setPrimaryColor(sitio.primary_color ?? "#7c3aed");
        setSecondaryColor(sitio.secondary_color ?? "#000000");
        setLogoUrl(sitio.logo_url ?? "");
        setImages(sitio.custom_images ?? {});
        setForm({
          project_name: sitio.project_name,
          prompt: sitio.prompt,
          website_type: sitio.website_type,
          theme: sitio.theme,
          primary_color: sitio.primary_color,
          secondary_color: sitio.secondary_color,
        });
      }
      setSuscripcion(sub ?? null);
      setLoading(false);
    }
    check();
  }, []);

  const planActivo = suscripcion?.status === "active" ? (suscripcion.plan ?? "basico") : "basico";
  const rutasPermitidas = PLAN_ACCESO[planActivo] ?? ["/dashboard/client", "/dashboard/client/suscripcion"];
  const sections = planActivo === "empresarial" ? SECTIONS_EMPRESARIAL : planActivo === "profesional" ? SECTIONS_PROFESIONAL : SECTIONS_BASICO;
  const canAddRemove = planActivo === "profesional" || planActivo === "empresarial";
  const canChangeTipo = planActivo === "profesional" || planActivo === "empresarial";
  const pr = primaryColor;
  const previewWidth = view === "desktop" ? "100%" : view === "tablet" ? "768px" : "375px";

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const ext = file.name.split(".").pop();
    const fileName = `logo-${userId}-${Date.now()}.${ext}`;
    await supabase.storage.from("logos").upload(fileName, file, { upsert: true });
    const { data } = supabase.storage.from("logos").getPublicUrl(fileName);
    setLogoUrl(data.publicUrl);
    setUploadingLogo(false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !imgTarget) return;
    setUploadingImg(imgTarget);
    const ext = file.name.split(".").pop();
    const fileName = `img-${imgTarget}-${Date.now()}.${ext}`;
    await supabase.storage.from("logos").upload(fileName, file, { upsert: true });
    const { data } = supabase.storage.from("logos").getPublicUrl(fileName);
    setImages(prev => ({ ...prev, [imgTarget]: data.publicUrl }));
    setUploadingImg(null);
  }

  function triggerImg(target: string) {
    setImgTarget(target);
    setTimeout(() => imgRef.current?.click(), 100);
  }

  async function refreshPexels(target: string, query: string) {
    setUploadingImg(target);
    const url = await fetchPexels(query);
    if (url) setImages(prev => ({ ...prev, [target]: url }));
    setUploadingImg(null);
  }

  async function handleGenerate() {
    if (!form.prompt || !form.project_name) return;
    setGenerating(true);
    setContent(null);
    try {
      const res = await fetch("/api/ai-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setContent(data.content);
      const categoria = form.website_type;
      const newImgs: Record<string, string> = {};
      await Promise.all([
        fetchPexels(`${categoria} professional`).then(url => { if (url) newImgs.hero = url; }),
        fetchPexels(`${categoria} services`).then(url => { if (url) newImgs.servicios = url; }),
        fetchPexels(`${categoria} people happy`).then(url => { if (url) newImgs.testimonios = url; }),
      ]);
      setImages(newImgs);
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave(publish = false) {
    if (!content) return;
    setSaving(true);
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 7);
    const payload = {
      user_id: userId,
      client_email: userEmail,
      project_name: form.project_name,
      prompt: form.prompt,
      website_type: form.website_type,
      theme: form.theme,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      generated_content: content,
      logo_url: logoUrl,
      custom_images: images,
      status: publish ? "published" : "demo",
      trial_ends_at: trialEnds.toISOString(),
    };
    if (miSitio) {
      await supabase.from("generated_websites").update(payload).eq("id", miSitio.id);
      setMiSitio({ ...miSitio, ...payload });
    } else {
      const { data } = await supabase.from("generated_websites").insert(payload).select().single();
      setMiSitio(data);
    }
    setSaving(false);
    setSaved(true);
    setEditando(false);
    setTimeout(() => setSaved(false), 3000);
  }

  function updateText(path: string[], value: string) {
    setContent((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      let obj = next;
      for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
      obj[path[path.length - 1]] = value;
      return next;
    });
  }

  function updateArray(section: string, index: number, field: string, value: string) {
    setContent((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[section][index][field] = value;
      return next;
    });
  }

  function updateNestedArray(section: string, subkey: string, index: number, field: string, value: string) {
    setContent((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[section][subkey][index][field] = value;
      return next;
    });
  }

  function addArrayItem(section: string, template: any) {
    setContent((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      if (!next[section]) next[section] = [];
      next[section].push(template);
      return next;
    });
  }

  function addNestedItem(section: string, subkey: string, template: any) {
    setContent((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      if (!next[section][subkey]) next[section][subkey] = [];
      next[section][subkey].push(template);
      return next;
    });
  }

  function removeArrayItem(section: string, index: number) {
    setContent((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[section].splice(index, 1);
      return next;
    });
  }

  function removeNestedItem(section: string, subkey: string, index: number) {
    setContent((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[section][subkey].splice(index, 1);
      return next;
    });
  }

  function getDaysLeft(trial_ends_at: string) {
    return Math.ceil((new Date(trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  }

  function ImgUploader({ label, target, pexelsQuery }: { label: string; target: string; pexelsQuery?: string }) {
    return (
      <div style={{ marginBottom: 14 }}>
        <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#888", textTransform:"uppercase" as const, marginBottom:6 }}>{label}</label>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={() => triggerImg(target)} style={{ flex:1, padding:"8px", borderRadius:8, border:`1px dashed ${pr}`, background:`${pr}08`, color:pr, fontSize:12, fontWeight:600, cursor:"pointer" }}>
            {uploadingImg === target ? "Subiendo..." : "Cambiar imagen"}
          </button>
          {pexelsQuery && (
            <button onClick={() => refreshPexels(target, pexelsQuery)} style={{ padding:"8px 10px", borderRadius:8, border:`1px dashed ${pr}`, background:`${pr}08`, color:pr, fontSize:12, cursor:"pointer" }} title="Nueva imagen automatica">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            </button>
          )}
        </div>
        {images[target] && <img src={images[target]} alt="preview" style={{ width:"100%", height:80, objectFit:"cover", borderRadius:8, marginTop:8 }} />}
      </div>
    );
  }

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:40, height:40, border:"3px solid #e9d5ff", borderTopColor:"#7c3aed", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!miSitio || editando) {
    return (
      <div style={{ minHeight:"100vh", background:"#f8f9fa", display:"flex" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleLogoUpload} />



        <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
          <header style={{ background:"#fff", borderBottom:"1px solid #e5e7eb", padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <h1 style={{ fontSize:"1.1rem", fontWeight:800, color:"#111", margin:0 }}>Generar Mi Sitio Web</h1>
              <p style={{ color:"#888", fontSize:12, margin:"2px 0 0" }}>Describe tu negocio y la IA crea tu sitio profesional</p>
            </div>
            {editando && <button onClick={() => setEditando(false)} style={{ fontSize:12, color:"#888", border:"1px solid #e5e7eb", background:"#fff", padding:"6px 14px", borderRadius:8, cursor:"pointer" }}>Cancelar</button>}
          </header>

          <main style={{ flex:1, padding:"24px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, maxWidth:1100, margin:"0 auto", width:"100%" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e5e7eb", padding:20 }}>
                <h2 style={{ fontSize:14, fontWeight:800, color:"#111", marginBottom:16 }}>Logo de tu negocio</h2>
                <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                  {logoUrl ? (
                    <div style={{ width:72, height:72, borderRadius:12, border:"1px solid #e5e7eb", overflow:"hidden", background:"#f8f8f8", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <img src={logoUrl} alt="Logo" style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain" }} />
                    </div>
                  ) : (
                    <div style={{ width:72, height:72, borderRadius:12, border:"2px dashed #e5e7eb", display:"flex", alignItems:"center", justifyContent:"center", background:"#f8f8f8" }}>
                      <span style={{ fontSize:10, color:"#aaa" }}>Sin logo</span>
                    </div>
                  )}
                  <div>
                    <button onClick={() => fileRef.current?.click()} disabled={uploadingLogo} style={{ fontSize:12, border:`1px solid ${pr}`, color:pr, padding:"7px 14px", borderRadius:8, background:"transparent", cursor:"pointer", fontWeight:600 }}>
                      {uploadingLogo ? "Subiendo..." : logoUrl ? "Cambiar logo" : "Subir logo"}
                    </button>
                    <p style={{ fontSize:11, color:"#aaa", marginTop:4 }}>PNG, JPG o SVG. Max 2MB</p>
                  </div>
                </div>
              </div>

              <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e5e7eb", padding:20 }}>
                <h2 style={{ fontSize:14, fontWeight:800, color:"#111", marginBottom:16 }}>Configuracion</h2>
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#888", marginBottom:6, textTransform:"uppercase" as const }}>Nombre de tu negocio</label>
                    <input type="text" value={form.project_name} onChange={e => setForm({ ...form, project_name: e.target.value })} placeholder="Ej: Restaurante El Buen Sabor" style={{ width:"100%", border:"1px solid #e5e7eb", borderRadius:8, padding:"10px 12px", fontSize:13, outline:"none", boxSizing:"border-box" as const }} />
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#888", marginBottom:6, textTransform:"uppercase" as const }}>Tipo de sitio {!canChangeTipo && <span style={{ fontSize:10, background:"#f3f4f6", color:"#aaa", padding:"1px 6px", borderRadius:4, marginLeft:4 }}>PRO</span>}</label>
                    <select value={form.website_type} onChange={e => canChangeTipo && setForm({ ...form, website_type: e.target.value })} disabled={!canChangeTipo} style={{ width:"100%", border:"1px solid #e5e7eb", borderRadius:8, padding:"10px 12px", fontSize:13, outline:"none", opacity: canChangeTipo ? 1 : 0.5 }}>
                      {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#888", marginBottom:6, textTransform:"uppercase" as const }}>Tema</label>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                      {TEMAS.map(t => (
                        <button key={t} onClick={() => setForm({ ...form, theme: t })} style={{ padding:"10px", borderRadius:8, fontSize:12, fontWeight:500, border:"1px solid", borderColor: form.theme===t ? pr : "#e5e7eb", background: form.theme===t ? `${pr}10` : "#fff", color: form.theme===t ? pr : "#888", cursor:"pointer" }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <div>
                      <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#888", marginBottom:6, textTransform:"uppercase" as const }}>Color principal</label>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <input type="color" value={form.primary_color} onChange={e => setForm({ ...form, primary_color: e.target.value })} style={{ width:36, height:36, borderRadius:6, border:"1px solid #e5e7eb", cursor:"pointer" }} />
                        <span style={{ fontSize:12, color:"#888" }}>{form.primary_color}</span>
                      </div>
                    </div>
                    <div>
                      <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#888", marginBottom:6, textTransform:"uppercase" as const }}>Color secundario</label>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <input type="color" value={form.secondary_color} onChange={e => setForm({ ...form, secondary_color: e.target.value })} style={{ width:36, height:36, borderRadius:6, border:"1px solid #e5e7eb", cursor:"pointer" }} />
                        <span style={{ fontSize:12, color:"#888" }}>{form.secondary_color}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e5e7eb", padding:20 }}>
                <h2 style={{ fontSize:14, fontWeight:800, color:"#111", marginBottom:6 }}>Describe tu negocio</h2>
                <p style={{ fontSize:12, color:"#aaa", marginBottom:12 }}>Cuentanos sobre tus servicios, productos y lo que te hace especial.</p>
                <textarea value={form.prompt} onChange={e => setForm({ ...form, prompt: e.target.value })} rows={6} placeholder="Ej: Tengo un restaurante de comida italiana en Pereira. Ofrecemos pizza, pasta y postres. Horario: lunes a domingo 12pm-10pm. WhatsApp: 3001234567" style={{ width:"100%", border:"1px solid #e5e7eb", borderRadius:8, padding:"10px 12px", fontSize:13, outline:"none", resize:"none", boxSizing:"border-box" as const }} />
                <button onClick={handleGenerate} disabled={generating || !form.prompt || !form.project_name} style={{ width:"100%", marginTop:12, padding:"12px", borderRadius:10, background:pr, color:"#fff", fontSize:13, fontWeight:700, border:"none", cursor:"pointer", opacity: generating || !form.prompt || !form.project_name ? 0.5 : 1 }}>
                  {generating ? "Generando tu sitio..." : "Generar Mi Sitio con IA"}
                </button>
              </div>
            </div>

            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e5e7eb", overflow:"hidden", position:"sticky", top:20, maxHeight:"calc(100vh - 120px)", display:"flex", flexDirection:"column" }}>
              <div style={{ padding:"12px 16px", borderBottom:"1px solid #f0f0f0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <h2 style={{ fontSize:12, fontWeight:800, color:"#555", margin:0 }}>Vista previa</h2>
                {content && <button onClick={() => handleSave(false)} disabled={saving} style={{ fontSize:12, padding:"6px 14px", borderRadius:8, background:saved ? "#10b981" : pr, color:"#fff", border:"none", cursor:"pointer", fontWeight:700 }}>{saving ? "Guardando..." : saved ? "Guardado" : "Guardar sitio"}</button>}
              </div>
              {!content && !generating && (
                <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, textAlign:"center" }}>
                  <div style={{ width:48, height:48, borderRadius:12, background:`${pr}10`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={pr} strokeWidth="1.75"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                  </div>
                  <p style={{ color:"#aaa", fontSize:13 }}>Describe tu negocio y genera tu sitio</p>
                </div>
              )}
              {generating && (
                <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32 }}>
                  <div style={{ width:40, height:40, border:`3px solid ${pr}30`, borderTopColor:pr, borderRadius:"50%", animation:"spin 0.8s linear infinite", marginBottom:12 }} />
                  <p style={{ color:"#888", fontSize:13 }}>Generando tu sitio...</p>
                </div>
              )}
              {content && !generating && (
                <div style={{ overflowY:"auto", flex:1 }}>
                  <div style={{ position:"relative", minHeight:180, background:`linear-gradient(135deg,${form.primary_color},${form.secondary_color||"#1a1a1a"})`, textAlign:"center", color:"#fff", padding:32, overflow:"hidden" }}>
                    {images.hero && <img src={images.hero} alt="hero" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity:0.3 }} />}
                    <div style={{ position:"relative", zIndex:1 }}>
                      {logoUrl && <img src={logoUrl} alt="Logo" style={{ height:36, objectFit:"contain", margin:"0 auto 10px", display:"block", filter:"brightness(0) invert(1)" }} />}
                      <h1 style={{ fontSize:"1.1rem", fontWeight:800, marginBottom:6 }}>{content.hero?.titulo}</h1>
                      <p style={{ fontSize:11, opacity:0.8, marginBottom:12 }}>{content.hero?.subtitulo}</p>
                      <span style={{ background:"#fff", color:form.primary_color, padding:"5px 14px", borderRadius:8, fontSize:11, fontWeight:700 }}>{content.hero?.cta_principal}</span>
                    </div>
                  </div>
                  {content.servicios && (
                    <div style={{ padding:14, background:"#f8f9fa" }}>
                      <p style={{ fontSize:10, fontWeight:700, letterSpacing:3, textTransform:"uppercase" as const, color:pr, textAlign:"center", marginBottom:10 }}>Servicios</p>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                        {content.servicios.slice(0,3).map((s: any, i: number) => (
                          <div key={i} style={{ background:"#fff", borderRadius:8, padding:10, textAlign:"center" }}>
                            <p style={{ fontSize:10, fontWeight:700, color:"#111", marginBottom:3 }}>{s.titulo}</p>
                            <p style={{ fontSize:9, color:"#888" }}>{s.descripcion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {content.contacto && (
                    <div style={{ padding:14, background:form.primary_color, color:"#fff" }}>
                      <h3 style={{ fontSize:12, fontWeight:700, marginBottom:3 }}>{content.contacto.titulo}</h3>
                      <p style={{ fontSize:10, opacity:0.8 }}>{content.contacto.descripcion}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height:"100vh", background:"#f0f0f0", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; }`}</style>
      <input ref={logoRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleLogoUpload} />
      <input ref={imgRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleImageUpload} />

      <div style={{ background:"#fff", borderBottom:"1px solid #e5e7eb", padding:"10px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexShrink:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Link href="/dashboard/client"><Image src="/logo-dms.png" alt="DMS" width={100} height={32} /></Link>
          <span style={{ fontWeight:800, fontSize:14, color:"#111" }}>{miSitio?.project_name}</span>
          <span style={{ fontSize:10, background:`${pr}15`, color:pr, padding:"2px 8px", borderRadius:999, fontWeight:700 }}>Plan {planActivo}</span>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {(["desktop","tablet","mobile"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding:"5px 12px", borderRadius:8, border:"none", cursor:"pointer", fontSize:11, fontWeight:700, background: view===v ? pr : "#f3f4f6", color: view===v ? "#fff" : "#555" }}>
              {v === "desktop" ? "Desktop" : v === "tablet" ? "Tablet" : "Mobile"}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {miSitio && <a href={`/demo/${miSitio.id}`} target="_blank" style={{ background:"#f3f4f6", color:"#555", padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:700, textDecoration:"none" }}>Ver demo</a>}
          {planActivo === "empresarial" && miSitio && (
            <Link href={`/dashboard/client/editor/${miSitio.id}`} style={{ background:"rgba(124,58,237,0.1)", color:"#7c3aed", padding:"6px 12px", borderRadius:8, fontSize:12, fontWeight:700, textDecoration:"none" }}>Editor Pro</Link>
          )}
          <button onClick={() => setEditando(true)} style={{ background:"#f3f4f6", color:"#555", border:"none", borderRadius:8, padding:"6px 12px", fontSize:12, fontWeight:700, cursor:"pointer" }}>Regenerar</button>
          <button onClick={() => handleSave(false)} disabled={saving} style={{ background: saved ? "#10b981" : "#f3f4f6", color: saved ? "#fff" : "#555", border:"none", borderRadius:8, padding:"6px 12px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
            {saving ? "Guardando..." : saved ? "Guardado" : "Guardar"}
          </button>
          <button onClick={() => handleSave(true)} style={{ background:pr, color:"#fff", border:"none", borderRadius:8, padding:"6px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>Publicar</button>
        </div>
      </div>

      <div style={{ display:"flex", flex:1, minHeight:0 }}>
        <div style={{ width:200, background:"#fff", borderRight:"1px solid #e5e7eb", display:"flex", flexDirection:"column", overflow:"auto", flexShrink:0 }}>
          <div style={{ padding:"12px 14px 8px", borderBottom:"1px solid #f0f0f0" }}>
            <p style={{ fontSize:11, fontWeight:700, color:"#888", textTransform:"uppercase" as const, letterSpacing:"0.5px", margin:0 }}>Secciones</p>
          </div>
          <nav style={{ padding:"8px", flex:1 }}>
            {sections.map(s => (
              <button key={s} onClick={() => setSelectedSection(s)} style={{ display:"block", width:"100%", textAlign:"left", padding:"8px 12px", borderRadius:8, border:"none", cursor:"pointer", marginBottom:3, fontWeight: selectedSection===s ? 700 : 500, fontSize:12, background: selectedSection===s ? `${pr}15` : "transparent", color: selectedSection===s ? pr : "#555", borderLeft: selectedSection===s ? `3px solid ${pr}` : "3px solid transparent" }}>
                {SECTION_LABELS[s]}
              </button>
            ))}
          </nav>
          <div style={{ padding:"12px 10px", borderTop:"1px solid #f0f0f0" }}>
            <p style={{ fontSize:11, fontWeight:700, color:"#888", textTransform:"uppercase" as const, marginBottom:10 }}>Global</p>
            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4 }}>Color primario</label>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} style={{ width:30, height:30, borderRadius:6, border:"1px solid #e5e7eb", cursor:"pointer" }} />
                <span style={{ fontSize:10, color:"#555" }}>{primaryColor}</span>
              </div>
            </div>
            <div style={{ marginBottom:10 }}>
              <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4 }}>Color secundario</label>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} style={{ width:30, height:30, borderRadius:6, border:"1px solid #e5e7eb", cursor:"pointer" }} />
                <span style={{ fontSize:10, color:"#555" }}>{secondaryColor}</span>
              </div>
            </div>
            <div>
              <label style={{ fontSize:11, color:"#888", display:"block", marginBottom:4 }}>Logo</label>
              <button onClick={() => logoRef.current?.click()} style={{ width:"100%", padding:"6px", borderRadius:8, border:`1px dashed ${pr}`, background:`${pr}08`, color:pr, fontSize:11, fontWeight:600, cursor:"pointer" }}>
                {uploadingLogo ? "Subiendo..." : logoUrl ? "Cambiar" : "Subir logo"}
              </button>
              {logoUrl && <img src={logoUrl} alt="logo" style={{ width:"100%", height:36, objectFit:"contain", marginTop:6, background:"#f8f8f8", borderRadius:6 }} />}
            </div>
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", alignItems:"center", padding:"16px", background:"#e0e0e0", gap:8 }}>
          <div style={{ width:previewWidth, maxWidth:"100%", background:"#fff", borderRadius:12, boxShadow:"0 4px 24px rgba(0,0,0,0.12)", transition:"width 0.3s" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 18px", background:"#fff", borderBottom:"1px solid #f0f0f0" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                {logoUrl && <img src={logoUrl} alt="logo" style={{ height:30, objectFit:"contain" }} />}
                <span style={{ fontWeight:700, fontSize:13, color:pr }}>{content?.footer?.nombre_empresa ?? miSitio?.project_name}</span>
              </div>
              <span style={{ background:pr, color:"#fff", padding:"4px 12px", borderRadius:8, fontSize:11, fontWeight:600 }}>{content?.hero?.cta_principal ?? "Contactar"}</span>
            </div>
            <div style={{ position:"relative", minHeight:240, background:`linear-gradient(135deg,${primaryColor},${secondaryColor||"#1a1a1a"})`, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
              {images.hero && <img src={images.hero} alt="hero" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />}
              <div style={{ position:"relative", zIndex:1, textAlign:"center", padding:"2rem", color:"#fff", background:"rgba(0,0,0,0.4)", width:"100%" }}>
                {logoUrl && <img src={logoUrl} alt="logo" style={{ height:44, objectFit:"contain", margin:"0 auto 12px", display:"block", filter:"brightness(0) invert(1)" }} />}
                <h1 style={{ fontSize:"1.5rem", fontWeight:800, marginBottom:"0.625rem" }}>{content?.hero?.titulo}</h1>
                <p style={{ opacity:0.9, marginBottom:"1rem", fontSize:"0.875rem" }}>{content?.hero?.subtitulo}</p>
                <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
                  <span style={{ background:"#fff", color:primaryColor, padding:"7px 16px", borderRadius:8, fontWeight:700, fontSize:12 }}>{content?.hero?.cta_principal}</span>
                  <span style={{ border:"2px solid rgba(255,255,255,0.7)", color:"#fff", padding:"7px 16px", borderRadius:8, fontWeight:700, fontSize:12 }}>{content?.hero?.cta_secundario}</span>
                </div>
              </div>
            </div>
            {content?.servicios && (
              <div style={{ padding:"1.5rem", background:"#f8f9fa" }}>
                <h2 style={{ fontSize:"1rem", fontWeight:800, textAlign:"center", marginBottom:"1rem", color:"#111" }}>Servicios</h2>
                {images.servicios && <img src={images.servicios} alt="servicios" style={{ width:"100%", height:140, objectFit:"cover", borderRadius:10, marginBottom:12 }} />}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:10 }}>
                  {content.servicios.slice(0,3).map((s: any, i: number) => (
                    <div key={i} style={{ background:"#fff", borderRadius:10, padding:"1rem", border:"1px solid #f0f0f0" }}>
                      <p style={{ fontWeight:700, fontSize:11, marginBottom:3, color:"#111" }}>{s.titulo}</p>
                      <p style={{ fontSize:10, color:"#888", lineHeight:1.5 }}>{s.descripcion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {content?.testimonios && (
              <div style={{ padding:"1.5rem" }}>
                <h2 style={{ fontSize:"1rem", fontWeight:800, textAlign:"center", marginBottom:"1rem", color:"#111" }}>Testimonios</h2>
                {images.testimonios && <img src={images.testimonios} alt="testimonios" style={{ width:"100%", height:140, objectFit:"cover", borderRadius:10, marginBottom:12 }} />}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:10 }}>
                  {content.testimonios.slice(0,2).map((t: any, i: number) => (
                    <div key={i} style={{ background:"#f8f9fa", borderRadius:10, padding:"1rem" }}>
                      <p style={{ fontSize:11, color:"#555", fontStyle:"italic", marginBottom:8 }}>"{t.texto}"</p>
                      <p style={{ fontSize:11, fontWeight:700, color:"#111" }}>{t.nombre}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {content?.contacto && (
              <div style={{ padding:"1.5rem", background:`linear-gradient(135deg,${primaryColor},${secondaryColor||"#1a1a1a"})`, color:"#fff", textAlign:"center" }}>
                <h2 style={{ fontSize:"1rem", fontWeight:800, marginBottom:6 }}>{content.contacto.titulo}</h2>
                <p style={{ opacity:0.85, fontSize:12, marginBottom:12 }}>{content.contacto.descripcion}</p>
                {content.contacto.whatsapp && <span style={{ background:"#25D366", color:"#fff", padding:"7px 18px", borderRadius:10, fontWeight:700, fontSize:12, display:"inline-block" }}>WhatsApp</span>}
              </div>
            )}
            <div style={{ padding:"1rem", background:secondaryColor||"#111", textAlign:"center" }}>
              {logoUrl && <img src={logoUrl} alt="logo" style={{ height:28, objectFit:"contain", margin:"0 auto 6px", display:"block", filter:"brightness(0) invert(1)" }} />}
              <p style={{ color:primaryColor, fontWeight:700, fontSize:12 }}>{content?.footer?.nombre_empresa}</p>
              <p style={{ color:"rgba(255,255,255,0.4)", fontSize:10, marginTop:3 }}>{content?.footer?.copyright}</p>
            </div>
          </div>
        </div>

        <div style={{ width:290, background:"#fff", borderLeft:"1px solid #e5e7eb", overflow:"auto", flexShrink:0 }}>
          <div style={{ padding:"12px 14px 8px", borderBottom:"1px solid #f0f0f0", position:"sticky", top:0, background:"#fff", zIndex:5 }}>
            <p style={{ fontSize:13, fontWeight:800, color:"#111", margin:0 }}>{SECTION_LABELS[selectedSection]}</p>
          </div>
          <div style={{ padding:"14px" }}>

            {selectedSection === "hero" && content?.hero && (<>
              <Field label="Titulo" value={content.hero.titulo} onChange={v => updateText(["hero","titulo"], v)} />
              <Field label="Subtitulo" value={content.hero.subtitulo} onChange={v => updateText(["hero","subtitulo"], v)} multiline />
              <Field label="Boton principal" value={content.hero.cta_principal} onChange={v => updateText(["hero","cta_principal"], v)} />
              <Field label="Boton secundario" value={content.hero.cta_secundario} onChange={v => updateText(["hero","cta_secundario"], v)} />
              <ImgUploader label="Imagen Banner" target="hero" pexelsQuery={`${form.website_type} professional`} />
            </>)}

            {selectedSection === "servicios" && content?.servicios && (<>
              <ImgUploader label="Imagen Servicios" target="servicios" pexelsQuery={`${form.website_type} services`} />
              {content.servicios.map((s: any, i: number) => (
                <div key={i} style={{ marginBottom:12, background:"#f8f9fa", borderRadius:10, padding:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:"#888" }}>Servicio {i+1}</span>
                    {canAddRemove && <button onClick={() => removeArrayItem("servicios", i)} style={{ background:"#fef2f2", color:"#ef4444", border:"none", borderRadius:6, padding:"3px 8px", fontSize:11, cursor:"pointer" }}>Eliminar</button>}
                  </div>
                  <Field label="Titulo" value={s.titulo} onChange={v => updateArray("servicios", i, "titulo", v)} />
                  <Field label="Descripcion" value={s.descripcion} onChange={v => updateArray("servicios", i, "descripcion", v)} multiline />
                </div>
              ))}
              {canAddRemove ? (
                <button onClick={() => addArrayItem("servicios", { titulo:"Nuevo servicio", descripcion:"Descripcion" })} style={{ width:"100%", padding:"8px", borderRadius:8, border:`1px dashed ${pr}`, background:`${pr}08`, color:pr, fontSize:12, fontWeight:600, cursor:"pointer" }}>+ Agregar servicio</button>
              ) : <UpgradeBadge plan="Profesional" />}
            </>)}

            {selectedSection === "testimonios" && content?.testimonios && (<>
              <ImgUploader label="Imagen Testimonios" target="testimonios" pexelsQuery={`${form.website_type} people happy`} />
              {content.testimonios.map((t: any, i: number) => (
                <div key={i} style={{ marginBottom:12, background:"#f8f9fa", borderRadius:10, padding:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:"#888" }}>Testimonio {i+1}</span>
                    {canAddRemove && <button onClick={() => removeArrayItem("testimonios", i)} style={{ background:"#fef2f2", color:"#ef4444", border:"none", borderRadius:6, padding:"3px 8px", fontSize:11, cursor:"pointer" }}>Eliminar</button>}
                  </div>
                  <Field label="Nombre" value={t.nombre} onChange={v => updateArray("testimonios", i, "nombre", v)} />
                  <Field label="Cargo" value={t.cargo} onChange={v => updateArray("testimonios", i, "cargo", v)} />
                  <Field label="Texto" value={t.texto} onChange={v => updateArray("testimonios", i, "texto", v)} multiline />
                </div>
              ))}
              {canAddRemove ? (
                <button onClick={() => addArrayItem("testimonios", { nombre:"Cliente", cargo:"Ciudad", texto:"Excelente servicio" })} style={{ width:"100%", padding:"8px", borderRadius:8, border:`1px dashed ${pr}`, background:`${pr}08`, color:pr, fontSize:12, fontWeight:600, cursor:"pointer" }}>+ Agregar testimonio</button>
              ) : <UpgradeBadge plan="Profesional" />}
            </>)}

            {selectedSection === "nosotros" && (<>
              {canChangeTipo ? (<>
                <Field label="Titulo" value={content?.nosotros?.titulo ?? ""} onChange={v => updateText(["nosotros","titulo"], v)} />
                <Field label="Descripcion" value={content?.nosotros?.descripcion ?? ""} onChange={v => updateText(["nosotros","descripcion"], v)} multiline />
                <Field label="Mision" value={content?.nosotros?.mision ?? ""} onChange={v => updateText(["nosotros","mision"], v)} multiline />
                <Field label="Vision" value={content?.nosotros?.vision ?? ""} onChange={v => updateText(["nosotros","vision"], v)} multiline />
              </>) : <UpgradeBadge plan="Profesional" />}
            </>)}

            {selectedSection === "beneficios" && (<>
              {canChangeTipo && content?.beneficios ? (<>
                {content.beneficios.map((b: any, i: number) => (
                  <div key={i} style={{ marginBottom:12, background:"#f8f9fa", borderRadius:10, padding:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <span style={{ fontSize:11, fontWeight:700, color:"#888" }}>Beneficio {i+1}</span>
                      {canAddRemove && <button onClick={() => removeArrayItem("beneficios", i)} style={{ background:"#fef2f2", color:"#ef4444", border:"none", borderRadius:6, padding:"3px 8px", fontSize:11, cursor:"pointer" }}>Eliminar</button>}
                    </div>
                    <Field label="Titulo" value={b.titulo} onChange={v => updateArray("beneficios", i, "titulo", v)} />
                    <Field label="Descripcion" value={b.descripcion} onChange={v => updateArray("beneficios", i, "descripcion", v)} multiline />
                  </div>
                ))}
                {canAddRemove && <button onClick={() => addArrayItem("beneficios", { titulo:"Nuevo beneficio", descripcion:"Descripcion" })} style={{ width:"100%", padding:"8px", borderRadius:8, border:`1px dashed ${pr}`, background:`${pr}08`, color:pr, fontSize:12, fontWeight:600, cursor:"pointer" }}>+ Agregar beneficio</button>}
              </>) : <UpgradeBadge plan="Profesional" />}
            </>)}

            {selectedSection === "faq" && (<>
              {canChangeTipo && content?.faq ? (<>
                {content.faq.map((f: any, i: number) => (
                  <div key={i} style={{ marginBottom:12, background:"#f8f9fa", borderRadius:10, padding:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <span style={{ fontSize:11, fontWeight:700, color:"#888" }}>Pregunta {i+1}</span>
                      {canAddRemove && <button onClick={() => removeArrayItem("faq", i)} style={{ background:"#fef2f2", color:"#ef4444", border:"none", borderRadius:6, padding:"3px 8px", fontSize:11, cursor:"pointer" }}>Eliminar</button>}
                    </div>
                    <Field label="Pregunta" value={f.pregunta} onChange={v => updateArray("faq", i, "pregunta", v)} />
                    <Field label="Respuesta" value={f.respuesta} onChange={v => updateArray("faq", i, "respuesta", v)} multiline />
                  </div>
                ))}
                {canAddRemove && <button onClick={() => addArrayItem("faq", { pregunta:"Nueva pregunta", respuesta:"Respuesta" })} style={{ width:"100%", padding:"8px", borderRadius:8, border:`1px dashed ${pr}`, background:`${pr}08`, color:pr, fontSize:12, fontWeight:600, cursor:"pointer" }}>+ Agregar pregunta</button>}
              </>) : <UpgradeBadge plan="Profesional" />}
            </>)}

            {selectedSection === "estadisticas" && (<>
              {planActivo === "empresarial" && content?.estadisticas ? (<>
                {content.estadisticas.items?.map((e: any, i: number) => (
                  <div key={i} style={{ marginBottom:12, background:"#f8f9fa", borderRadius:10, padding:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <span style={{ fontSize:11, fontWeight:700, color:"#888" }}>Estadistica {i+1}</span>
                      <button onClick={() => removeNestedItem("estadisticas", "items", i)} style={{ background:"#fef2f2", color:"#ef4444", border:"none", borderRadius:6, padding:"3px 8px", fontSize:11, cursor:"pointer" }}>Eliminar</button>
                    </div>
                    <Field label="Numero" value={e.numero} onChange={v => updateNestedArray("estadisticas", "items", i, "numero", v)} />
                    <Field label="Label" value={e.label} onChange={v => updateNestedArray("estadisticas", "items", i, "label", v)} />
                  </div>
                ))}
                <button onClick={() => addNestedItem("estadisticas", "items", { numero:"100+", label:"Clientes" })} style={{ width:"100%", padding:"8px", borderRadius:8, border:`1px dashed ${pr}`, background:`${pr}08`, color:pr, fontSize:12, fontWeight:600, cursor:"pointer" }}>+ Agregar estadistica</button>
              </>) : <UpgradeBadge plan="Empresarial" />}
            </>)}

            {selectedSection === "galeria" && (<>
              {planActivo === "empresarial" ? (<>
                <Field label="Titulo" value={content?.galeria?.titulo ?? ""} onChange={v => updateText(["galeria","titulo"], v)} />
                <button onClick={() => triggerImg("galeria_new")} style={{ width:"100%", padding:"8px", borderRadius:8, border:`1px dashed ${pr}`, background:`${pr}08`, color:pr, fontSize:12, fontWeight:600, cursor:"pointer", marginBottom:12 }}>
                  {uploadingImg === "galeria_new" ? "Subiendo..." : "Agregar imagen"}
                </button>
              </>) : <UpgradeBadge plan="Empresarial" />}
            </>)}

            {selectedSection === "equipo" && (<>
              {planActivo === "empresarial" && content?.equipo ? (<>
                <Field label="Titulo" value={content.equipo.titulo} onChange={v => updateText(["equipo","titulo"], v)} />
                {content.equipo.miembros?.map((m: any, i: number) => (
                  <div key={i} style={{ marginBottom:12, background:"#f8f9fa", borderRadius:10, padding:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <span style={{ fontSize:11, fontWeight:700, color:"#888" }}>Miembro {i+1}</span>
                      <button onClick={() => removeNestedItem("equipo", "miembros", i)} style={{ background:"#fef2f2", color:"#ef4444", border:"none", borderRadius:6, padding:"3px 8px", fontSize:11, cursor:"pointer" }}>Eliminar</button>
                    </div>
                    <Field label="Nombre" value={m.nombre} onChange={v => updateNestedArray("equipo", "miembros", i, "nombre", v)} />
                    <Field label="Cargo" value={m.cargo} onChange={v => updateNestedArray("equipo", "miembros", i, "cargo", v)} />
                  </div>
                ))}
                <button onClick={() => addNestedItem("equipo", "miembros", { nombre:"Nuevo miembro", cargo:"Cargo" })} style={{ width:"100%", padding:"8px", borderRadius:8, border:`1px dashed ${pr}`, background:`${pr}08`, color:pr, fontSize:12, fontWeight:600, cursor:"pointer" }}>+ Agregar miembro</button>
              </>) : <UpgradeBadge plan="Empresarial" />}
            </>)}

            {selectedSection === "planes" && (<>
              {planActivo === "empresarial" && content?.planes ? (<>
                <Field label="Titulo" value={content.planes.titulo ?? ""} onChange={v => updateText(["planes","titulo"], v)} />
                {content.planes.items?.map((p: any, i: number) => (
                  <div key={i} style={{ marginBottom:12, background:"#f8f9fa", borderRadius:10, padding:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                      <span style={{ fontSize:11, fontWeight:700, color:"#888" }}>Plan {i+1}</span>
                      <button onClick={() => removeNestedItem("planes", "items", i)} style={{ background:"#fef2f2", color:"#ef4444", border:"none", borderRadius:6, padding:"3px 8px", fontSize:11, cursor:"pointer" }}>Eliminar</button>
                    </div>
                    <Field label="Nombre" value={p.nombre} onChange={v => updateNestedArray("planes", "items", i, "nombre", v)} />
                    <Field label="Precio" value={p.precio} onChange={v => updateNestedArray("planes", "items", i, "precio", v)} />
                  </div>
                ))}
                <button onClick={() => addNestedItem("planes", "items", { nombre:"Plan Basico", precio:"$99.000", periodo:"mes" })} style={{ width:"100%", padding:"8px", borderRadius:8, border:`1px dashed ${pr}`, background:`${pr}08`, color:pr, fontSize:12, fontWeight:600, cursor:"pointer" }}>+ Agregar plan</button>
              </>) : <UpgradeBadge plan="Empresarial" />}
            </>)}

            {selectedSection === "contacto" && content?.contacto && (<>
              <Field label="Titulo" value={content.contacto.titulo} onChange={v => updateText(["contacto","titulo"], v)} />
              <Field label="Descripcion" value={content.contacto.descripcion} onChange={v => updateText(["contacto","descripcion"], v)} multiline />
              <Field label="Telefono" value={content.contacto.telefono} onChange={v => updateText(["contacto","telefono"], v)} />
              <Field label="WhatsApp" value={content.contacto.whatsapp} onChange={v => updateText(["contacto","whatsapp"], v)} />
              <Field label="Email" value={content.contacto.email} onChange={v => updateText(["contacto","email"], v)} />
              <Field label="Direccion" value={content.contacto.direccion} onChange={v => updateText(["contacto","direccion"], v)} />
            </>)}

            {selectedSection === "footer" && content?.footer && (<>
              <Field label="Nombre empresa" value={content.footer.nombre_empresa} onChange={v => updateText(["footer","nombre_empresa"], v)} />
              <Field label="Descripcion" value={content.footer.descripcion} onChange={v => updateText(["footer","descripcion"], v)} multiline />
              <Field label="Copyright" value={content.footer.copyright} onChange={v => updateText(["footer","copyright"], v)} />
            </>)}

          </div>
        </div>
      </div>
    </div>
  );
}
