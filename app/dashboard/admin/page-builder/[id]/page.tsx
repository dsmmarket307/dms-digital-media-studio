"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";

const FONTS = [
  { label: "Moderna", value: "'Segoe UI', sans-serif" },
  { label: "Clasica", value: "Georgia, serif" },
  { label: "Elegante", value: "'Palatino', serif" },
  { label: "Minimalista", value: "'Arial', sans-serif" },
  { label: "Tecnica", value: "'Courier New', monospace" },
];

const SECTION_LABELS: Record<string, string> = {
  barraAnuncio: "Barra de Anuncios",
  productos: "Productos",
  hero: "Hero Principal", nosotros: "Nosotros", servicios: "Servicios",
  galeria: "Galeria", equipo: "Equipo", beneficios: "Beneficios",
  estadisticas: "Estadisticas", planes: "Planes", testimonios: "Testimonios",
  faq: "Preguntas Frecuentes", contacto: "Contacto", footer: "Footer",
};

async function fetchPexels(query: string): Promise<string> {
  try {
    const res = await fetch(`/api/pexels?query=${encodeURIComponent(query)}&per_page=1`);
    const data = await res.json();
    return data?.photos?.[0]?.src?.large ?? data?.images?.[0] ?? "";
  } catch { return ""; }
}

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  const [local, setLocal] = useState(value ?? "");
  useEffect(() => { setLocal(value ?? ""); }, [value]);
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.5px" }}>{label}</label>
      {multiline ? (
        <textarea value={local} onChange={e => setLocal(e.target.value)} onBlur={() => onChange(local)} rows={3} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box" }} />      ) : (
        <input value={local} onChange={e => setLocal(e.target.value)} onBlur={() => onChange(local)} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
      )}
    </div>
  );
}

export default function PageBuilderEditor() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const supabase = createClient();

  const [site, setSite] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>("hero");
  const [view, setView] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [font, setFont] = useState(FONTS[0].value);
  const [fontSize, setFontSize] = useState("16px");
  const [primaryColor, setPrimaryColor] = useState("#7c3aed");
  const [secondaryColor, setSecondaryColor] = useState("#000000");
  const [logoUrl, setLogoUrl] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingImg, setUploadingImg] = useState<string | null>(null);
  const [images, setImages] = useState<Record<string, any>>({});
  const logoRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const [imgTarget, setImgTarget] = useState<string>("");
  const [publishedVersion, setPublishedVersion] = useState<"basica" | "profesional">("basica");
  const [navHidden, setNavHidden] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (prof?.role !== "admin") { router.push("/dashboard/client"); return; }
      const { data } = await supabase.from("generated_websites").select("*").eq("id", id).single();
      if (!data) { router.push("/dashboard/admin/page-builder"); return; }
      setSite(data);
      const c = data.generated_content ?? {};
      if (!c.nosotros) c.nosotros = { titulo: "Quienes somos", descripcion: "Descripcion de la empresa", mision: "Nuestra mision", vision: "Nuestra vision" };
      if (!c.galeria) c.galeria = { titulo: "Galeria", items: [] };
      if (!c.equipo) c.equipo = { titulo: "Nuestro Equipo", miembros: [] };
      if (!c.estadisticas) c.estadisticas = { items: [{ numero: "100+", label: "Clientes" }, { numero: "5", label: "Anos de experiencia" }, { numero: "500+", label: "Proyectos" }] };
      if (!c.planes) c.planes = { titulo: "Nuestros Planes", items: [] };
      if (!c.barraAnuncio) c.barraAnuncio = { activo: false, colorFondo: "#111111", colorTexto: "#f5c542", items: ["+5000 clientes satisfechos", "Garantia 30 dias", "Material de alta calidad", "Entrega en 3-5 dias habiles", "Envio gratis a todo Colombia", "Contra-entrega disponible"] };
      setContent(c);
      setPrimaryColor(data.primary_color ?? "#7c3aed");
      setSecondaryColor(data.secondary_color ?? "#000000");
      setLogoUrl(data.logo_url ?? "");
      setFont(data.font_family ?? FONTS[0].value);
      setFontSize(data.font_size ?? "16px");
      const categoria = data.website_type ?? "negocio";
      const existingImages = data.custom_images ?? {};
      const newImages = { ...existingImages };
      const queries: Record<string, string> = {
        hero: `${categoria} professional`,
        servicios: `${categoria} services`,
        testimonios: `${categoria} people happy`,
      };
      await Promise.all(["hero", "servicios", "testimonios"].map(async (key) => {
        if (!newImages[key]) {
          const url = await fetchPexels(queries[key]);
          if (url) newImages[key] = url;
        }
      }));
      setImages(newImages);
      setNavHidden(data.navbar_hidden ?? []);
      if (data.status === "published") setPublishedUrl(`${window.location.origin}/demo/${id}`);
      setPublishedVersion(data.published_version ?? "basica");
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSave(publish = false) {
    setSaving(true);
    await supabase.from("generated_websites").update({
      generated_content: { ...content, footer: { ...(content.footer ?? {}), navbar_hidden: navHidden } },
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      logo_url: logoUrl,
      font_family: font,
      font_size: fontSize,
      custom_images: images,
      navbar_hidden: navHidden,
      status: publish ? "published" : "draft",
      published_version: publishedVersion,
    }).eq("id", id);
    setSaving(false);
    setSaved(true);
    if (publish) setPublishedUrl(`${window.location.origin}/demo/${id}`);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const ext = file.name.split(".").pop();
    const fileName = `logo-${Date.now()}.${ext}`;
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
    if (imgTarget.startsWith("producto_")) {
      const idx = parseInt(imgTarget.split("_")[1]);
      setContent((prev: any) => {
        const next = JSON.parse(JSON.stringify(prev));
        if (!next.productos[idx].imagenes) next.productos[idx].imagenes = [];
        next.productos[idx].imagenes.push(data.publicUrl);
        return next;
      });
    } else if (imgTarget === "galeria_new") {
      setImages(prev => ({
        ...prev,
        galeria_imgs: [...((prev.galeria_imgs as string[]) ?? []), data.publicUrl],
      }));
    } else {
      setImages(prev => ({ ...prev, [imgTarget]: data.publicUrl }));
    }
    setUploadingImg(null);
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

  function updateBarraItem(index: number, value: string) {
    setContent((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      next.barraAnuncio.items[index] = value;
      return next;
    });
  }

  function addBarraItem() {
    setContent((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      if (!next.barraAnuncio.items) next.barraAnuncio.items = [];
      next.barraAnuncio.items.push("Nuevo mensaje");
      return next;
    });
  }

  function removeBarraItem(index: number) {
    setContent((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      next.barraAnuncio.items.splice(index, 1);
      return next;
    });
  }

  function setBarraField(field: string, value: any) {
    setContent((prev: any) => {
      const next = JSON.parse(JSON.stringify(prev));
      next.barraAnuncio[field] = value;
      return next;
    });
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

  function ImgUploader({ label, target, pexelsQuery }: { label: string; target: string; pexelsQuery?: string }) {
    return (
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, marginBottom: 6 }}>{label}</label>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => triggerImg(target)} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px dashed ${primaryColor}`, background: `${primaryColor}08`, color: primaryColor, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            {uploadingImg === target ? "Subiendo..." : "Cambiar imagen"}
          </button>
          {pexelsQuery && (
            <button onClick={() => refreshPexels(target, pexelsQuery)} style={{ padding: "8px 10px", borderRadius: 8, border: `1px dashed ${primaryColor}`, background: `${primaryColor}08`, color: primaryColor, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Nueva imagen">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            </button>
          )}
        </div>
        {images[target] && <img src={images[target]} alt="preview" style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 8, marginTop: 8 }} />}
      </div>
    );
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!site || !content) return <div style={{ padding: 40, textAlign: "center" }}>Sitio no encontrado</div>;

  const pr = primaryColor;
  const sc = secondaryColor;
  const previewWidth = view === "desktop" ? "100%" : view === "tablet" ? "768px" : "375px";
  const sections = Object.keys(SECTION_LABELS);
  const categoria = site.website_type ?? "negocio";

  return (
    <div style={{ height: "100vh", background: "#f0f0f0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } * { box-sizing: border-box; }`}</style>
      <input ref={logoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoUpload} />
      <input ref={imgRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />

      {/* TOPBAR */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexShrink: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.push("/dashboard/admin/page-builder")} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#555", display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Volver
          </button>
          <span style={{ fontWeight: 800, fontSize: 15, color: "#111" }}>{site.project_name}</span>
          <span style={{ fontSize: 11, background: "rgba(124,58,237,0.1)", color: "#7c3aed", padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>{site.website_type}</span>
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
          {publishedUrl && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "6px 12px" }}>
              <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>Publicado</span>
              <a href={publishedUrl} target="_blank" style={{ fontSize: 11, color: "#16a34a", fontWeight: 700, textDecoration: "underline", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{publishedUrl}</a>
              <button onClick={() => navigator.clipboard.writeText(publishedUrl)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }} title="Copiar">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#f3f4f6", borderRadius: 8, padding: 3 }}>
            {(["basica", "profesional"] as const).map(v => (
              <button key={v} onClick={() => setPublishedVersion(v)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: publishedVersion === v ? "#fff" : "transparent", color: publishedVersion === v ? "#111" : "#888", boxShadow: publishedVersion === v ? "0 1px 4px rgba(0,0,0,0.1)" : "none", textTransform: "capitalize" }}>
                {v === "basica" ? "Basica" : "Profesional"}
              </button>
            ))}
          </div>
          <a href={`/demo/${id}`} target="_blank" style={{ background: "#f3f4f6", color: "#555", padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Ver demo
          </a>
          <button onClick={() => handleSave(false)} disabled={saving} style={{ background: saved ? "#10b981" : "#f3f4f6", color: saved ? "#fff" : "#555", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            {saving ? "Guardando..." : saved ? "Guardado" : "Guardar"}
          </button>
          <button onClick={() => handleSave(true)} style={{ background: pr, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            Publicar
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* PANEL IZQUIERDO */}
        <div style={{ width: 200, background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", overflow: "auto", flexShrink: 0 }}>
          <div style={{ padding: "12px 14px 8px", borderBottom: "1px solid #f0f0f0" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>Secciones</p>
          </div>
          <nav style={{ padding: "8px 8px", flex: 1 }}>
            {sections.map(s => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                <button onClick={() => setSelectedSection(s)} style={{ flex: 1, textAlign: "left", padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: selectedSection === s ? 700 : 500, fontSize: 12, background: selectedSection === s ? `${pr}15` : "transparent", color: selectedSection === s ? pr : "#555", borderLeft: selectedSection === s ? `3px solid ${pr}` : "3px solid transparent" }}>
                  {SECTION_LABELS[s]}
                </button>
                {s !== "hero" && s !== "footer" && s !== "barraAnuncio" && (
                  <button onClick={() => setNavHidden(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} style={{ padding: "4px 6px", borderRadius: 6, border: "1px solid #e5e7eb", background: navHidden.includes(s) ? "#f3f4f6" : `${pr}15`, color: navHidden.includes(s) ? "#aaa" : pr, fontSize: 10, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
                    {navHidden.includes(s) ? "OFF" : "ON"}
                  </button>
                )}
              </div>
            ))}</nav>
          <div style={{ padding: "12px 10px", borderTop: "1px solid #f0f0f0" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 10 }}>Global</p>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>Color primario</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #e5e7eb", cursor: "pointer" }} />
                <span style={{ fontSize: 10, color: "#555" }}>{primaryColor}</span>
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>Color secundario</label>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #e5e7eb", cursor: "pointer" }} />
                <span style={{ fontSize: 10, color: "#555" }}>{secondaryColor}</span>
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>Logo</label>
              <button onClick={() => logoRef.current?.click()} style={{ width: "100%", padding: "6px", borderRadius: 8, border: `1px dashed ${pr}`, background: `${pr}08`, color: pr, fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                {uploadingLogo ? "Subiendo..." : logoUrl ? "Cambiar" : "Subir logo"}
              </button>
              {logoUrl && <img src={logoUrl} alt="logo" style={{ width: "100%", height: 40, objectFit: "contain", marginTop: 6, background: "#f8f8f8", borderRadius: 6 }} />}
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>Fuente</label>
              <select value={font} onChange={e => setFont(e.target.value)} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 6px", fontSize: 11 }}>
                {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 6 }}>Tamano de letra</label>
              <div style={{ display: "flex", gap: 4 }}>
                {[{ label: "S", size: "14px", title: "Pequeno" }, { label: "M", size: "16px", title: "Mediano" }, { label: "L", size: "20px", title: "Grande" }].map(({ label, size, title }) => (
                  <button key={size} onClick={() => setFontSize(size)} title={title} style={{ flex: 1, padding: "6px 4px", borderRadius: 6, border: `1px solid ${fontSize === size ? pr : "#e5e7eb"}`, background: fontSize === size ? `${pr}15` : "#fff", color: fontSize === size ? pr : "#777", fontSize: label === "S" ? 10 : label === "M" ? 13 : 16, fontWeight: 700, cursor: "pointer" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PANEL CENTRAL - PREVIEW CON SCROLL */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px", background: "#e0e0e0", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 8, padding: "6px 12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", flexShrink: 0, alignSelf: "flex-start" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span style={{ fontSize: 11, color: "#888", fontWeight: 600 }}>Vista previa</span>
            <span style={{ fontSize: 11, color: "#aaa" }}>|</span>
            <span style={{ fontSize: 11, color: "#555", fontWeight: 600 }}>{view === "desktop" ? "Escritorio" : view === "tablet" ? "Tableta" : "Movil"}</span>
          </div>
          <div style={{ width: previewWidth, maxWidth: "100%", background: "#fff", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.12)", transition: "width 0.3s", fontFamily: font, fontSize, overflow: "hidden" }}>

            {content?.barraAnuncio?.activo && content?.barraAnuncio?.items?.length > 0 && (
              <div style={{ background: content.barraAnuncio.colorFondo || "#111111", overflow: "hidden", padding: "8px 0" }}>
                <div style={{ display: "flex", width: "max-content", animation: "marquee 20s linear infinite" }}>
                  {[...content.barraAnuncio.items, ...content.barraAnuncio.items].map((txt: string, i: number) => (
                    <span key={i} style={{ color: content.barraAnuncio.colorTexto || "#f5c542", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", padding: "0 20px", display: "flex", alignItems: "center", gap: 20 }}>
                      {txt}
                      <span style={{ opacity: 0.6 }}>•</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "#fff", borderBottom: "1px solid #f0f0f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {logoUrl && <img src={logoUrl} alt="logo" style={{ height: 36, objectFit: "contain" }} />}
                <span style={{ fontWeight: 700, fontSize: 14, color: pr }}>{content?.footer?.nombre_empresa ?? site.project_name}</span>
              </div>
              <span style={{ background: pr, color: "#fff", padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{content?.hero?.cta_principal ?? "Contactar"}</span>
            </div>

            <div style={{ position: "relative", minHeight: 280, background: `linear-gradient(135deg,${pr},${sc || "#1a1a1a"})`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {images.hero && <img src={images.hero} alt="hero" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
              <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "2rem", color: "#fff", background: "rgba(0,0,0,0.45)", width: "100%" }}>
                {logoUrl && <img src={logoUrl} alt="logo" style={{ height: 50, objectFit: "contain", margin: "0 auto 1rem", display: "block", filter: "brightness(0) invert(1)" }} />}
                <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "0.75rem" }}>{content?.hero?.titulo}</h1>
                <p style={{ opacity: 0.9, marginBottom: "1.25rem", fontSize: "0.9rem" }}>{content?.hero?.subtitulo}</p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <span style={{ background: "#fff", color: pr, padding: "8px 18px", borderRadius: 8, fontWeight: 700, fontSize: 13 }}>{content?.hero?.cta_principal}</span>
                  <span style={{ border: "2px solid rgba(255,255,255,0.7)", color: "#fff", padding: "8px 18px", borderRadius: 8, fontWeight: 700, fontSize: 13 }}>{content?.hero?.cta_secundario}</span>
                </div>
              </div>
            </div>

            {content?.nosotros && (
              <div style={{ padding: "2rem", background: "#fff" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, textAlign: "center", marginBottom: "1rem", color: "#111" }}>{content.nosotros.titulo}</h2>
                {images.nosotros && <img src={images.nosotros} alt="nosotros" style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 12, marginBottom: 12 }} />}
                <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7, textAlign: "center" }}>{content.nosotros.descripcion}</p>
              </div>
            )}

            {content?.servicios && (
              <div style={{ padding: "2rem", background: "#f8f9fa" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, textAlign: "center", marginBottom: "1rem", color: "#111" }}>Lo que ofrecemos</h2>
                {images.servicios && <img src={images.servicios} alt="servicios" style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 12, marginBottom: 12 }} />}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                  {content.servicios.slice(0, 3).map((s: any, i: number) => (
                    <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "1rem", border: "1px solid #f0f0f0" }}>
                      <p style={{ fontWeight: 700, fontSize: 11, marginBottom: 4, color: "#111" }}>{s.titulo}</p>
                      <p style={{ fontSize: 10, color: "#888", lineHeight: 1.5 }}>{s.descripcion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {content?.productos?.length > 0 && (
              <div style={{ padding: "2rem", background: "#f8f9fa" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, textAlign: "center", marginBottom: "1rem", color: "#111" }}>Nuestros Productos</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                  {content.productos.slice(0, 6).map((p: any, i: number) => (
                    <div key={i} style={{ background: "#fff", borderRadius: 10, overflow: "hidden", border: "1px solid #f0f0f0", textAlign: "center" }}>
                      {p.imagenes && p.imagenes.length > 0 ? <img src={p.imagenes[0]} alt={p.nombre} style={{ width: "100%", height: 80, objectFit: "cover" }} /> : <div style={{ width: "100%", height: 80, background: `${pr}18`, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={pr} strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></div>}
                      <div style={{ padding: "0.75rem" }}>
                        <p style={{ fontWeight: 700, fontSize: 11, color: "#111", marginBottom: 4 }}>{p.nombre}</p>
                        <p style={{ fontSize: 12, fontWeight: 800, color: pr, marginBottom: 4 }}>{p.precio}</p>
                        {p.tallas && <p style={{ fontSize: 9, color: "#888" }}>Tallas: {p.tallas}</p>}
                        {p.colores && <p style={{ fontSize: 9, color: "#888" }}>Colores: {p.colores}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {content?.estadisticas?.items?.length > 0 && (
              <div style={{ padding: "2rem", background: pr, display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
                {content.estadisticas.items.map((e: any, i: number) => (
                  <div key={i} style={{ textAlign: "center", color: "#fff" }}>
                    <p style={{ fontSize: "2rem", fontWeight: 800 }}>{e.numero}</p>
                    <p style={{ fontSize: 12, opacity: 0.8 }}>{e.label}</p>
                  </div>
                ))}
              </div>
            )}

            {content?.testimonios && (
              <div style={{ padding: "2rem" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, textAlign: "center", marginBottom: "1rem", color: "#111" }}>Clientes satisfechos</h2>
                {images.testimonios && <img src={images.testimonios} alt="testimonios" style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 12, marginBottom: 12 }} />}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
                  {content.testimonios.slice(0, 2).map((t: any, i: number) => (
                    <div key={i} style={{ background: "#f8f9fa", borderRadius: 10, padding: "1rem" }}>
                      <p style={{ fontSize: 11, color: "#555", fontStyle: "italic", marginBottom: 8 }}>"{t.texto}"</p>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#111" }}>{t.nombre}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {content?.contacto && (
              <div style={{ padding: "2rem", background: `linear-gradient(135deg,${pr},${sc || "#1a1a1a"})`, color: "#fff", textAlign: "center" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: 8 }}>{content.contacto.titulo}</h2>
                <p style={{ opacity: 0.85, fontSize: 12, marginBottom: 12 }}>{content.contacto.descripcion}</p>
                {content.contacto.whatsapp && <span style={{ background: "#25D366", color: "#fff", padding: "8px 20px", borderRadius: 10, fontWeight: 700, fontSize: 13, display: "inline-block" }}>WhatsApp</span>}
              </div>
            )}

            <div style={{ padding: "1.5rem", background: sc || "#111", textAlign: "center" }}>
              {logoUrl && <img src={logoUrl} alt="logo" style={{ height: 36, objectFit: "contain", margin: "0 auto 8px", display: "block", filter: "brightness(0) invert(1)" }} />}
              <p style={{ color: pr, fontWeight: 700, fontSize: 13 }}>{content?.footer?.nombre_empresa}</p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 4 }}>{content?.footer?.copyright}</p>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div style={{ width: 290, background: "#fff", borderLeft: "1px solid #e5e7eb", overflow: "auto", flexShrink: 0 }}>
          <div style={{ padding: "14px 16px 8px", borderBottom: "1px solid #f0f0f0", position: "sticky", top: 0, background: "#fff", zIndex: 5 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#111", margin: 0 }}>{SECTION_LABELS[selectedSection]}</p>
          </div>
          <div style={{ padding: "14px" }}>
            {selectedSection === "barraAnuncio" && (<>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, background: "#f8f9fa", borderRadius: 10, padding: "10px 12px" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>Mostrar barra</span>
                <button onClick={() => setBarraField("activo", !content.barraAnuncio.activo)} style={{ width: 40, height: 22, borderRadius: 999, border: "none", cursor: "pointer", background: content.barraAnuncio.activo ? pr : "#d1d5db", position: "relative", transition: "background 0.2s" }}>
                  <span style={{ position: "absolute", top: 2, left: content.barraAnuncio.activo ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
                </button>
              </div>

              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>Color de fondo</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input type="color" value={content.barraAnuncio.colorFondo} onChange={e => setBarraField("colorFondo", e.target.value)} style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #e5e7eb", cursor: "pointer" }} />
                    <span style={{ fontSize: 10, color: "#555" }}>{content.barraAnuncio.colorFondo}</span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>Color de texto</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input type="color" value={content.barraAnuncio.colorTexto} onChange={e => setBarraField("colorTexto", e.target.value)} style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #e5e7eb", cursor: "pointer" }} />
                    <span style={{ fontSize: 10, color: "#555" }}>{content.barraAnuncio.colorTexto}</span>
                  </div>
                </div>
              </div>

              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.5px" }}>Mensajes</label>
              {(content.barraAnuncio.items ?? []).map((txt: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  <input value={txt} onChange={e => updateBarraItem(i, e.target.value)} style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 12, outline: "none" }} />
                  <button onClick={() => removeBarraItem(i)} style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 6, padding: "0 10px", fontSize: 11, cursor: "pointer" }}>Eliminar</button>
                </div>
              ))}
              <button onClick={addBarraItem} style={{ width: "100%", padding: "8px", borderRadius: 8, border: `1px dashed ${pr}`, background: `${pr}08`, color: pr, fontSize: 12, fontWeight: 600, cursor: "pointer", marginTop: 4 }}>+ Agregar mensaje</button>
            </>)}
            {selectedSection === "hero" && (<>
              <Field label="Titulo" value={content?.hero?.titulo} onChange={(v) => updateText(["hero", "titulo"], v)} />
              <Field label="Subtitulo" value={content?.hero?.subtitulo} onChange={(v) => updateText(["hero", "subtitulo"], v)} multiline />
              <Field label="Boton principal" value={content?.hero?.cta_principal} onChange={(v) => updateText(["hero", "cta_principal"], v)} />
              <Field label="Boton secundario" value={content?.hero?.cta_secundario} onChange={(v) => updateText(["hero", "cta_secundario"], v)} />
              <ImgUploader label="Imagen Hero Principal" target="hero" pexelsQuery={`${categoria} professional`} />
              <ImgUploader label="Imagen Servicios" target="servicios" pexelsQuery={`${categoria} services`} />
              <ImgUploader label="Imagen Testimonios" target="testimonios" pexelsQuery={`${categoria} people happy`} />
            </>)}
            {selectedSection === "productos" && (<>
              {content?.productos?.map((p: any, i: number) => (
                <div key={i} style={{ marginBottom: 14, background: "#f8f9fa", borderRadius: 10, padding: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#888" }}>Producto {i + 1}</span>
                    <button onClick={() => removeArrayItem("productos", i)} style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>Eliminar</button>
                  </div>
                  <Field label="Nombre" value={p.nombre} onChange={(v) => updateArray("productos", i, "nombre", v)} />
                  <Field label="Precio" value={p.precio} onChange={(v) => updateArray("productos", i, "precio", v)} />
                  <Field label="Precio anterior (tachado, opcional)" value={p.precio_anterior ?? ""} onChange={(v) => updateArray("productos", i, "precio_anterior", v)} />
                  <Field label="Descripcion" value={p.descripcion} onChange={(v) => updateArray("productos", i, "descripcion", v)} multiline />
                  <Field label="Categoria" value={p.categoria} onChange={(v) => updateArray("productos", i, "categoria", v)} />
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 6 }}>Tallas</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
                      {(p.tallas ?? "").split(",").filter(Boolean).map((t: string, j: number) => (
                        <span key={j} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", background: "#f3f4f6", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                          {t.trim()}
                          <button onClick={() => { const arr = (p.tallas ?? "").split(",").filter(Boolean).map((x: string) => x.trim()).filter((_: string, k: number) => k !== j); updateArray("productos", i, "tallas", arr.join(", ")); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontWeight: 800, fontSize: 12, padding: 0 }}>x</button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <input id={`talla-input-${i}`} placeholder="Ej: 2-4, S, XL..." style={{ flex: 1, padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 11, outline: "none" }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); const val = (e.target as HTMLInputElement).value.trim(); if (val) { const arr = (p.tallas ?? "").split(",").filter(Boolean).map((x: string) => x.trim()); arr.push(val); updateArray("productos", i, "tallas", arr.join(", ")); (e.target as HTMLInputElement).value = ""; } } }} />                      <button onClick={() => { const input = document.getElementById(`talla-input-${i}`) as HTMLInputElement; const val = input?.value.trim(); if (val) { const arr = (p.tallas ?? "").split(",").filter(Boolean).map((x: string) => x.trim()); arr.push(val); updateArray("productos", i, "tallas", arr.join(", ")); input.value = ""; } }} style={{ padding: "6px 10px", background: "#111", color: "#fff", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 700 }}>+</button>
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 6 }}>Colores</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
                      {(p.colores ?? "").split(",").filter(Boolean).map((c: string, j: number) => (
                        <span key={j} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", background: "#f3f4f6", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                          {c.trim()}
                          <button onClick={() => { const arr = (p.colores ?? "").split(",").filter(Boolean).map((x: string) => x.trim()).filter((_: string, k: number) => k !== j); updateArray("productos", i, "colores", arr.join(", ")); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontWeight: 800, fontSize: 12, padding: 0 }}>x</button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <input id={`color-input-${i}`} placeholder="Ej: Rojo, Azul..." style={{ flex: 1, padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 11, outline: "none" }} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); const val = (e.target as HTMLInputElement).value.trim(); if (val) { const arr = (p.colores ?? "").split(",").filter(Boolean).map((x: string) => x.trim()); arr.push(val); updateArray("productos", i, "colores", arr.join(", ")); (e.target as HTMLInputElement).value = ""; } } }} />
                      <button onClick={() => { const input = document.getElementById(`color-input-${i}`) as HTMLInputElement; const val = input?.value.trim(); if (val) { const arr = (p.colores ?? "").split(",").filter(Boolean).map((x: string) => x.trim()); arr.push(val); updateArray("productos", i, "colores", arr.join(", ")); input.value = ""; } }} style={{ padding: "6px 10px", background: "#111", color: "#fff", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 700 }}>+</button>
                    </div>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 6 }}>Imagenes del producto (max 5)</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 6 }}>
                      {(p.imagenes ?? []).map((img: string, j: number) => (
                        <div key={j} style={{ position: "relative" }}>
                          <img src={img} alt={`prod-${i}-${j}`} style={{ width: "100%", height: 60, objectFit: "cover", borderRadius: 6 }} />
                          <button onClick={() => {
                            setContent((prev: any) => {
                              const next = JSON.parse(JSON.stringify(prev));
                              next.productos[i].imagenes.splice(j, 1);
                              return next;
                            });
                          }} style={{ position: "absolute", top: 2, right: 2, background: "#ef4444", color: "#fff", border: "none", borderRadius: 4, width: 16, height: 16, fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>x</button>
                        </div>
                      ))}
                    </div>
                    {(!p.imagenes || p.imagenes.length < 5) && (
                      <button onClick={() => { setImgTarget(`producto_${i}`); setTimeout(() => imgRef.current?.click(), 100); }} style={{ width: "100%", padding: "6px", borderRadius: 8, border: `1px dashed ${pr}`, background: `${pr}08`, color: pr, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                        {uploadingImg === `producto_${i}` ? "Subiendo..." : `Subir imagen (${(p.imagenes ?? []).length}/5)`}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button onClick={() => addArrayItem("productos", { nombre: "Nuevo producto", precio: "$0", descripcion: "Descripcion", categoria: "General", tallas: "", colores: "", imagenes: [], destacado: false })} style={{ width: "100%", padding: "8px", borderRadius: 8, border: `1px dashed ${pr}`, background: `${pr}08`, color: pr, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Agregar producto</button>
            </>)}
            {selectedSection === "nosotros" && (<>
              <Field label="Titulo" value={content?.nosotros?.titulo} onChange={(v) => updateText(["nosotros", "titulo"], v)} />
              <Field label="Descripcion" value={content?.nosotros?.descripcion} onChange={(v) => updateText(["nosotros", "descripcion"], v)} multiline />
              <Field label="Mision" value={content?.nosotros?.mision} onChange={(v) => updateText(["nosotros", "mision"], v)} multiline />
              <Field label="Vision" value={content?.nosotros?.vision} onChange={(v) => updateText(["nosotros", "vision"], v)} multiline />
              <ImgUploader label="Imagen Nosotros" target="nosotros" pexelsQuery={`${categoria} team`} />
            </>)}
            {selectedSection === "servicios" && content?.servicios && (<>
              <ImgUploader label="Imagen Servicios" target="servicios" pexelsQuery={`${categoria} services`} />
              {content.servicios.map((s: any, i: number) => (
                <div key={i} style={{ marginBottom: 14, background: "#f8f9fa", borderRadius: 10, padding: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#888" }}>Servicio {i + 1}</span>
                    <button onClick={() => removeArrayItem("servicios", i)} style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>Eliminar</button>
                  </div>
                  <Field label="Titulo" value={s.titulo} onChange={(v) => updateArray("servicios", i, "titulo", v)} />
                  <Field label="Descripcion" value={s.descripcion} onChange={(v) => updateArray("servicios", i, "descripcion", v)} multiline />
                </div>
              ))}
              <button onClick={() => addArrayItem("servicios", { titulo: "Nuevo servicio", descripcion: "Descripcion" })} style={{ width: "100%", padding: "8px", borderRadius: 8, border: `1px dashed ${pr}`, background: `${pr}08`, color: pr, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Agregar servicio</button>
            </>)}
            {selectedSection === "galeria" && (<>
              <Field label="Titulo" value={content?.galeria?.titulo} onChange={(v) => updateText(["galeria", "titulo"], v)} />
              <button onClick={() => triggerImg("galeria_new")} style={{ width: "100%", padding: "8px", borderRadius: 8, border: `1px dashed ${pr}`, background: `${pr}08`, color: pr, fontSize: 12, fontWeight: 600, cursor: "pointer", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                {uploadingImg === "galeria_new" ? "Subiendo..." : "Agregar imagen"}
              </button>
              {content?.galeria?.items?.map((img: string, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <img src={img} alt={`g${i}`} style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 6 }} />
                  <button onClick={() => removeNestedItem("galeria", "items", i)} style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 11, cursor: "pointer" }}>Eliminar</button>
                </div>
              ))}
            </>)}
            {selectedSection === "equipo" && (<>
              <Field label="Titulo" value={content?.equipo?.titulo} onChange={(v) => updateText(["equipo", "titulo"], v)} />
              {content?.equipo?.miembros?.map((m: any, i: number) => (
                <div key={i} style={{ marginBottom: 14, background: "#f8f9fa", borderRadius: 10, padding: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#888" }}>Miembro {i + 1}</span>
                    <button onClick={() => removeNestedItem("equipo", "miembros", i)} style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>Eliminar</button>
                  </div>
                  <Field label="Nombre" value={m.nombre} onChange={(v) => updateNestedArray("equipo", "miembros", i, "nombre", v)} />
                  <Field label="Cargo" value={m.cargo} onChange={(v) => updateNestedArray("equipo", "miembros", i, "cargo", v)} />
                  <Field label="Descripcion" value={m.descripcion} onChange={(v) => updateNestedArray("equipo", "miembros", i, "descripcion", v)} multiline />
                </div>
              ))}
              <button onClick={() => addNestedItem("equipo", "miembros", { nombre: "Nuevo miembro", cargo: "Cargo", descripcion: "" })} style={{ width: "100%", padding: "8px", borderRadius: 8, border: `1px dashed ${pr}`, background: `${pr}08`, color: pr, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Agregar miembro</button>
            </>)}
            {selectedSection === "estadisticas" && (<>
              {content?.estadisticas?.items?.map((e: any, i: number) => (
                <div key={i} style={{ marginBottom: 14, background: "#f8f9fa", borderRadius: 10, padding: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#888" }}>Estadistica {i + 1}</span>
                    <button onClick={() => removeNestedItem("estadisticas", "items", i)} style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>Eliminar</button>
                  </div>
                  <Field label="Numero" value={e.numero} onChange={(v) => updateNestedArray("estadisticas", "items", i, "numero", v)} />
                  <Field label="Label" value={e.label} onChange={(v) => updateNestedArray("estadisticas", "items", i, "label", v)} />
                </div>
              ))}
              <button onClick={() => addNestedItem("estadisticas", "items", { numero: "100+", label: "Clientes" })} style={{ width: "100%", padding: "8px", borderRadius: 8, border: `1px dashed ${pr}`, background: `${pr}08`, color: pr, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Agregar estadistica</button>
            </>)}
            {selectedSection === "planes" && (<>
              <Field label="Titulo" value={content?.planes?.titulo} onChange={(v) => updateText(["planes", "titulo"], v)} />
              {content?.planes?.items?.map((p: any, i: number) => (
                <div key={i} style={{ marginBottom: 14, background: "#f8f9fa", borderRadius: 10, padding: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#888" }}>Plan {i + 1}</span>
                    <button onClick={() => removeNestedItem("planes", "items", i)} style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>Eliminar</button>
                  </div>
                  <Field label="Nombre" value={p.nombre} onChange={(v) => updateNestedArray("planes", "items", i, "nombre", v)} />
                  <Field label="Precio" value={p.precio} onChange={(v) => updateNestedArray("planes", "items", i, "precio", v)} />
                  <Field label="Periodo" value={p.periodo} onChange={(v) => updateNestedArray("planes", "items", i, "periodo", v)} />
                </div>
              ))}
              <button onClick={() => addNestedItem("planes", "items", { nombre: "Plan Basico", precio: "$99.000", periodo: "mes", popular: false })} style={{ width: "100%", padding: "8px", borderRadius: 8, border: `1px dashed ${pr}`, background: `${pr}08`, color: pr, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Agregar plan</button>
            </>)}
            {selectedSection === "beneficios" && content?.beneficios && (<>
              {content.beneficios.map((b: any, i: number) => (
                <div key={i} style={{ marginBottom: 14, background: "#f8f9fa", borderRadius: 10, padding: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#888" }}>Beneficio {i + 1}</span>
                    <button onClick={() => removeArrayItem("beneficios", i)} style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>Eliminar</button>
                  </div>
                  <Field label="Titulo" value={b.titulo} onChange={(v) => updateArray("beneficios", i, "titulo", v)} />
                  <Field label="Descripcion" value={b.descripcion} onChange={(v) => updateArray("beneficios", i, "descripcion", v)} multiline />
                </div>
              ))}
              <button onClick={() => addArrayItem("beneficios", { titulo: "Nuevo beneficio", descripcion: "Descripcion" })} style={{ width: "100%", padding: "8px", borderRadius: 8, border: `1px dashed ${pr}`, background: `${pr}08`, color: pr, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Agregar beneficio</button>
            </>)}
            {selectedSection === "testimonios" && content?.testimonios && (<>
              <ImgUploader label="Imagen Testimonios" target="testimonios" pexelsQuery={`${categoria} people happy`} />
              {content.testimonios.map((t: any, i: number) => (
                <div key={i} style={{ marginBottom: 14, background: "#f8f9fa", borderRadius: 10, padding: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#888" }}>Testimonio {i + 1}</span>
                    <button onClick={() => removeArrayItem("testimonios", i)} style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>Eliminar</button>
                  </div>
                  <Field label="Nombre" value={t.nombre} onChange={(v) => updateArray("testimonios", i, "nombre", v)} />
                  <Field label="Cargo" value={t.cargo} onChange={(v) => updateArray("testimonios", i, "cargo", v)} />
                  <Field label="Texto" value={t.texto} onChange={(v) => updateArray("testimonios", i, "texto", v)} multiline />
                </div>
              ))}
              <button onClick={() => addArrayItem("testimonios", { nombre: "Nuevo cliente", cargo: "Cargo", texto: "Excelente servicio" })} style={{ width: "100%", padding: "8px", borderRadius: 8, border: `1px dashed ${pr}`, background: `${pr}08`, color: pr, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Agregar testimonio</button>
            </>)}
            {selectedSection === "faq" && content?.faq && (<>
              {content.faq.map((f: any, i: number) => (
                <div key={i} style={{ marginBottom: 14, background: "#f8f9fa", borderRadius: 10, padding: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#888" }}>Pregunta {i + 1}</span>
                    <button onClick={() => removeArrayItem("faq", i)} style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 6, padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>Eliminar</button>
                  </div>
                  <Field label="Pregunta" value={f.pregunta} onChange={(v) => updateArray("faq", i, "pregunta", v)} />
                  <Field label="Respuesta" value={f.respuesta} onChange={(v) => updateArray("faq", i, "respuesta", v)} multiline />
                </div>
              ))}
              <button onClick={() => addArrayItem("faq", { pregunta: "Nueva pregunta", respuesta: "Respuesta" })} style={{ width: "100%", padding: "8px", borderRadius: 8, border: `1px dashed ${pr}`, background: `${pr}08`, color: pr, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Agregar pregunta</button>
            </>)}
            {selectedSection === "contacto" && (<>
              <Field label="Titulo" value={content?.contacto?.titulo} onChange={(v) => updateText(["contacto", "titulo"], v)} />
              <Field label="Descripcion" value={content?.contacto?.descripcion} onChange={(v) => updateText(["contacto", "descripcion"], v)} multiline />
              <Field label="Telefono" value={content?.contacto?.telefono} onChange={(v) => updateText(["contacto", "telefono"], v)} />
              <Field label="WhatsApp" value={content?.contacto?.whatsapp} onChange={(v) => updateText(["contacto", "whatsapp"], v)} />
              <Field label="Email" value={content?.contacto?.email} onChange={(v) => updateText(["contacto", "email"], v)} />
              <Field label="Direccion" value={content?.contacto?.direccion} onChange={(v) => updateText(["contacto", "direccion"], v)} />
            </>)}
            {selectedSection === "footer" && (<>
              <Field label="Nombre empresa" value={content?.footer?.nombre_empresa} onChange={(v) => updateText(["footer", "nombre_empresa"], v)} />
              <Field label="Descripcion" value={content?.footer?.descripcion} onChange={(v) => updateText(["footer", "descripcion"], v)} multiline />
              <Field label="Copyright" value={content?.footer?.copyright} onChange={(v) => updateText(["footer", "copyright"], v)} />
            </>)}
          </div>
        </div>
      </div>
    </div>
  );
}
