"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TIPOS = ["Landing Page", "Sitio Corporativo", "Tienda Online", "Restaurante", "Inmobiliaria", "Consultorio", "Salon de Belleza", "Spa", "Abogados", "Gimnasio", "Hotel", "Barberia", "Odontologia", "Fotografia", "Tecnologia", "Turismo", "Otro"];
const TEMAS = ["Moderno", "Corporativo", "Premium", "Minimalista"];

export default function ClientBuilder() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<any>(null);
  const [userId, setUserId] = useState<string>("");
  const [suscripcion, setSuscripcion] = useState<any>(null);
  const [form, setForm] = useState({
    project_name: "",
    prompt: "",
    website_type: "Landing Page",
    theme: "Moderno",
    primary_color: "#7c3aed",
    secondary_color: "#000000",
  });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (prof?.role === "admin") { router.push("/dashboard/admin"); return; }
      setUserId(user.id);
      const { data: sub } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      setSuscripcion(sub ?? null);
      setLoading(false);
    }
    load();
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
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
    } catch (e: any) {
      alert("Error generando sitio: " + e.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!content) return;
    setSaving(true);
    const { data, error } = await supabase.from("generated_websites").insert({
      user_id: userId,
      project_name: form.project_name,
      prompt: form.prompt,
      website_type: form.website_type,
      theme: form.theme,
      primary_color: form.primary_color,
      secondary_color: form.secondary_color,
      generated_content: content,
      status: "draft",
    }).select().single();
    setSaving(false);
    if (error) { alert("Error guardando: " + error.message); return; }
    router.push("/dashboard/client/sitio");
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const puedeCrear = !suscripcion || suscripcion.status === "trial" || suscripcion.status === "active";

  return (
    <div style={{ minHeight: "100vh", background: "#f0f0f0" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <header style={{ background: "#fff", borderBottom: "1px solid rgba(124,58,237,0.1)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111", margin: 0 }}>Crear Mi Sitio Web</h1>
          <p style={{ color: "#888", fontSize: 12, margin: "4px 0 0" }}>Genera tu sitio profesional con inteligencia artificial</p>
        </div>
        <Link href="/dashboard/client" style={{ fontSize: 13, color: "#7c3aed", fontWeight: 700, textDecoration: "none" }}>Volver</Link>
      </header>

      {!puedeCrear && (
        <div style={{ margin: "20px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "16px 20px" }}>
          <p style={{ fontWeight: 700, color: "#991b1b", fontSize: 14, margin: "0 0 4px" }}>Suscripcion requerida</p>
          <p style={{ color: "#b91c1c", fontSize: 13, margin: 0 }}>Tu periodo de prueba ha vencido. Activa un plan para crear tu sitio.</p>
          <Link href="/planes" style={{ display: "inline-block", marginTop: 12, background: "#7c3aed", color: "#fff", padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Ver planes</Link>
        </div>
      )}

      {puedeCrear && (
        <div style={{ padding: "24px 16px", maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: content ? "1fr 1fr" : "1fr", gap: 20 }}>
          <div>
            <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8e8e8", padding: 20 }}>
                <h2 style={{ fontSize: 14, fontWeight: 800, color: "#111", marginBottom: 16 }}>Configuracion</h2>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 6 }}>Nombre del proyecto</label>
                  <input type="text" required value={form.project_name} onChange={e => setForm({ ...form, project_name: e.target.value })} placeholder="Ej: Restaurante El Buen Sabor" style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 6 }}>Tipo de sitio</label>
                  <select value={form.website_type} onChange={e => setForm({ ...form, website_type: e.target.value })} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }}>
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 6 }}>Tema</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                    {TEMAS.map(t => (
                      <button key={t} type="button" onClick={() => setForm({ ...form, theme: t })} style={{ padding: "8px", borderRadius: 8, border: `1px solid ${form.theme === t ? "#7c3aed" : "#e5e7eb"}`, background: form.theme === t ? "rgba(124,58,237,0.08)" : "#fff", color: form.theme === t ? "#7c3aed" : "#555", fontSize: 12, fontWeight: form.theme === t ? 700 : 400, cursor: "pointer" }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 6 }}>Color primario</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input type="color" value={form.primary_color} onChange={e => setForm({ ...form, primary_color: e.target.value })} style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #e5e7eb", cursor: "pointer" }} />
                      <span style={{ fontSize: 12, color: "#555" }}>{form.primary_color}</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 6 }}>Color secundario</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input type="color" value={form.secondary_color} onChange={e => setForm({ ...form, secondary_color: e.target.value })} style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #e5e7eb", cursor: "pointer" }} />
                      <span style={{ fontSize: 12, color: "#555" }}>{form.secondary_color}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8e8e8", padding: 20 }}>
                <h2 style={{ fontSize: 14, fontWeight: 800, color: "#111", marginBottom: 8 }}>Describe tu negocio</h2>
                <p style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>Cuanto mas detalle des, mejor sera el resultado.</p>
                <textarea required value={form.prompt} onChange={e => setForm({ ...form, prompt: e.target.value })} rows={5} placeholder="Ej: Soy dueno de un restaurante en Pereira llamado El Buen Sabor. Ofrecemos comida tipica colombiana, bandeja paisa, ajiaco y fritanga. Tono familiar y acogedor." style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 12px", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box" as const }} />
                <button type="submit" disabled={generating} style={{ marginTop: 12, width: "100%", background: generating ? "#9ca3af" : "#7c3aed", color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: generating ? "not-allowed" : "pointer" }}>
                  {generating ? "Generando con IA..." : "Generar mi sitio"}
                </button>
              </div>
            </form>
          </div>

          {content && (
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8e8e8", padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontSize: 14, fontWeight: 800, color: "#111", margin: 0 }}>Vista previa</h2>
                <button onClick={handleSave} disabled={saving} style={{ background: saving ? "#9ca3af" : "#10b981", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? "Guardando..." : "Guardar sitio"}
                </button>
              </div>
              <div style={{ background: `linear-gradient(135deg, ${form.primary_color}, ${form.secondary_color})`, borderRadius: 12, padding: "2rem", color: "#fff", marginBottom: 12, textAlign: "center" }}>
                <h1 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 8 }}>{content?.hero?.titulo}</h1>
                <p style={{ opacity: 0.9, fontSize: 13 }}>{content?.hero?.subtitulo}</p>
              </div>
              {content?.servicios && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 8 }}>Servicios generados</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {content.servicios.slice(0, 3).map((s: any, i: number) => (
                      <div key={i} style={{ background: "#f8f9fa", borderRadius: 8, padding: "8px 12px" }}>
                        <p style={{ fontWeight: 700, fontSize: 12, color: "#111", margin: 0 }}>{s.titulo}</p>
                        <p style={{ fontSize: 11, color: "#888", margin: "2px 0 0" }}>{s.descripcion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {content?.contacto && (
                <div style={{ background: "#f8f9fa", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#555" }}>
                  <p style={{ fontWeight: 700, margin: "0 0 4px", color: "#111" }}>Contacto generado</p>
                  {content.contacto.telefono && <p style={{ margin: 0 }}>Tel: {content.contacto.telefono}</p>}
                  {content.contacto.email && <p style={{ margin: 0 }}>{content.contacto.email}</p>}
                </div>
              )}
              <p style={{ fontSize: 11, color: "#aaa", textAlign: "center", marginTop: 12 }}>Guarda y edita todos los detalles desde Mi Sitio Web</p>
            </div>
          )}

          {generating && (
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e8e8e8", padding: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 48, height: 48, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 16 }} />
              <p style={{ fontSize: 14, color: "#555", fontWeight: 600 }}>La IA esta generando tu sitio...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}