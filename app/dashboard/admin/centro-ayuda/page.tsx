"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIAS = [
  "Primeros Pasos","Crear Mi Sitio","Editar Mi Sitio","Conectar Dominio","Leads","Reservas","CRM Pipeline","Automatizaciones","Agente IA","Facturacion","Suscripciones","Preguntas Frecuentes"
];

type Paso = { texto: string };
type Faq = { pregunta: string; respuesta: string };

const VACIO = {
  categoria: CATEGORIAS[0],
  titulo: "",
  descripcion: "",
  video_url: "",
  pasos: [] as Paso[],
  faqs: [] as Faq[],
  destacado: false,
};

export default function AdminCentroAyuda() {
  const router = useRouter();
  const supabase = createClient();
  const [tutoriales, setTutoriales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [form, setForm] = useState<typeof VACIO>(VACIO);
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (prof?.role !== "admin") { router.push("/dashboard/client"); return; }
      const { data } = await supabase.from("tutoriales").select("*").order("categoria").order("created_at", { ascending: false });
      setTutoriales(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  function abrirNuevo() {
    setEditando(null);
    setForm(VACIO);
    setShowModal(true);
  }

  function abrirEditar(t: any) {
    setEditando(t);
    setForm({
      categoria: t.categoria ?? CATEGORIAS[0],
      titulo: t.titulo ?? "",
      descripcion: t.descripcion ?? "",
      video_url: t.video_url ?? "",
      pasos: t.pasos ?? [],
      faqs: t.faqs ?? [],
      destacado: t.destacado ?? false,
    });
    setShowModal(true);
  }

  async function guardar() {
    if (!form.titulo || !form.categoria) return;
    setSaving(true);
    const payload = { ...form, updated_at: new Date().toISOString() };
    if (editando) {
      const { data } = await supabase.from("tutoriales").update(payload).eq("id", editando.id).select().single();
      if (data) setTutoriales(prev => prev.map(t => t.id === editando.id ? data : t));
    } else {
      const { data } = await supabase.from("tutoriales").insert({ ...payload, vistas: 0 }).select().single();
      if (data) setTutoriales(prev => [data, ...prev]);
    }
    setSaving(false);
    setShowModal(false);
  }

  async function eliminar(id: string) {
    if (!confirm("Eliminar este tutorial?")) return;
    await supabase.from("tutoriales").delete().eq("id", id);
    setTutoriales(prev => prev.filter(t => t.id !== id));
  }

  async function toggleDestacado(t: any) {
    const nuevo = !t.destacado;
    await supabase.from("tutoriales").update({ destacado: nuevo }).eq("id", t.id);
    setTutoriales(prev => prev.map(x => x.id === t.id ? { ...x, destacado: nuevo } : x));
  }

  function addPaso() {
    setForm(f => ({ ...f, pasos: [...f.pasos, { texto: "" }] }));
  }
  function updatePaso(i: number, texto: string) {
    setForm(f => ({ ...f, pasos: f.pasos.map((p, idx) => idx === i ? { texto } : p) }));
  }
  function removePaso(i: number) {
    setForm(f => ({ ...f, pasos: f.pasos.filter((_, idx) => idx !== i) }));
  }

  function addFaq() {
    setForm(f => ({ ...f, faqs: [...f.faqs, { pregunta: "", respuesta: "" }] }));
  }
  function updateFaq(i: number, field: "pregunta" | "respuesta", value: string) {
    setForm(f => ({ ...f, faqs: f.faqs.map((x, idx) => idx === i ? { ...x, [field]: value } : x) }));
  }
  function removeFaq(i: number) {
    setForm(f => ({ ...f, faqs: f.faqs.filter((_, idx) => idx !== i) }));
  }

  const filtrados = filtroCategoria ? tutoriales.filter(t => t.categoria === filtroCategoria) : tutoriales;
  const faltantes = CATEGORIAS.filter(c => !tutoriales.some(t => t.categoria === c));

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img src="/favicon-32.png" alt="Cargando" style={{ width: 44, height: 44, animation: "spin 1s linear infinite", borderRadius: 10 }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "2.5rem 2rem", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div style={{ marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(124,58,237,0.15)", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <Link href="/dashboard/admin" style={{ fontSize: "0.75rem", color: "#999", textDecoration: "none" }}>← Dashboard</Link>
            <p style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase" as const, color: "#7c3aed", margin: "0.75rem 0 0.25rem", fontWeight: 600 }}>Administrador</p>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#111", margin: 0 }}>Centro de Ayuda</h1>
            <p style={{ color: "#555", fontSize: 13, margin: "6px 0 0" }}>Gestiona los tutoriales y videos que ven tus clientes</p>
          </div>
          <button onClick={abrirNuevo} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Nuevo Tutorial</button>
        </div>

        {faltantes.length > 0 && (
          <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#d97706", margin: "0 0 6px" }}>Categorias sin ningun tutorial todavia:</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {faltantes.map(c => (
                <span key={c} style={{ fontSize: 11, fontWeight: 600, color: "#d97706", background: "#fff", padding: "3px 10px", borderRadius: 999, border: "1px solid rgba(245,158,11,0.3)" }}>{c}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 20 }}>
          <button onClick={() => setFiltroCategoria(null)} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 999, border: "1px solid", borderColor: !filtroCategoria ? "#7c3aed" : "#e5e7eb", background: !filtroCategoria ? "rgba(124,58,237,0.08)" : "#fff", color: !filtroCategoria ? "#7c3aed" : "#555", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" as const }}>Todas ({tutoriales.length})</button>
          {CATEGORIAS.map(c => {
            const count = tutoriales.filter(t => t.categoria === c).length;
            return (
              <button key={c} onClick={() => setFiltroCategoria(c)} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 999, border: "1px solid", borderColor: filtroCategoria === c ? "#7c3aed" : count === 0 ? "#fecaca" : "#e5e7eb", background: filtroCategoria === c ? "rgba(124,58,237,0.08)" : "#fff", color: filtroCategoria === c ? "#7c3aed" : count === 0 ? "#ef4444" : "#555", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" as const }}>{c} ({count})</button>
            );
          })}
        </div>

        {filtrados.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "3rem", textAlign: "center", color: "#aaa", fontSize: 13 }}>
            No hay tutoriales {filtroCategoria ? `en "${filtroCategoria}"` : "todavia"}.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {filtrados.map(t => (
              <div key={t.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 16, position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", background: "rgba(124,58,237,0.08)", padding: "2px 8px", borderRadius: 999 }}>{t.categoria}</span>
                  <button onClick={() => toggleDestacado(t)} title="Destacar" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={t.destacado ? "#f59e0b" : "none"} stroke={t.destacado ? "#f59e0b" : "#ccc"} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </button>
                </div>
                <p style={{ fontWeight: 700, color: "#111", fontSize: 14, margin: "0 0 4px" }}>{t.titulo}</p>
                <p style={{ fontSize: 12, color: "#888", margin: "0 0 10px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{t.descripcion}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, fontSize: 11, color: "#aaa" }}>
                  <span>{t.video_url ? "Con video" : "Sin video"}</span>
                  <span>·</span>
                  <span>{t.vistas ?? 0} vistas</span>
                  {t.pasos?.length > 0 && <><span>·</span><span>{t.pasos.length} pasos</span></>}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => abrirEditar(t)} style={{ flex: 1, background: "rgba(124,58,237,0.08)", color: "#7c3aed", border: "none", borderRadius: 8, padding: "7px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Editar</button>
                  <button onClick={() => eliminar(t.id)} style={{ flex: 1, background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 8, padding: "7px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "3vh 16px", overflowY: "auto" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 560, boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111", marginBottom: 16 }}>{editando ? "Editar Tutorial" : "Nuevo Tutorial"}</h2>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Categoria *</label>
              <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }}>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Titulo *</label>
              <input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Ej: Como conectar tu dominio" style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Descripcion</label>
              <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} rows={2} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box" as const }} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>URL del video (YouTube)</label>
              <input value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })} placeholder="https://youtube.com/watch?v=..." style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#555", marginBottom: 16 }}>
              <input type="checkbox" checked={form.destacado} onChange={e => setForm({ ...form, destacado: e.target.checked })} style={{ width: 14, height: 14, accentColor: "#7c3aed" }} />
              Destacar en "Videos Recomendados"
            </label>

            <div style={{ marginBottom: 16, borderTop: "1px solid #f0f0f0", paddingTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, margin: 0 }}>Pasos</p>
                <button onClick={addPaso} style={{ fontSize: 11, color: "#7c3aed", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>+ Agregar paso</button>
              </div>
              {form.pasos.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                  <input value={p.texto} onChange={e => updatePaso(i, e.target.value)} placeholder={`Paso ${i + 1}`} style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", fontSize: 12, outline: "none" }} />
                  <button onClick={() => removePaso(i)} style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 6, padding: "0 10px", fontSize: 11, cursor: "pointer" }}>x</button>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16, borderTop: "1px solid #f0f0f0", paddingTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, margin: 0 }}>Preguntas frecuentes</p>
                <button onClick={addFaq} style={{ fontSize: 11, color: "#7c3aed", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>+ Agregar FAQ</button>
              </div>
              {form.faqs.map((f, i) => (
                <div key={i} style={{ background: "#f8f9fa", borderRadius: 8, padding: 10, marginBottom: 8 }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                    <input value={f.pregunta} onChange={e => updateFaq(i, "pregunta", e.target.value)} placeholder="Pregunta" style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 10px", fontSize: 12, outline: "none" }} />
                    <button onClick={() => removeFaq(i)} style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 6, padding: "0 10px", fontSize: 11, cursor: "pointer" }}>x</button>
                  </div>
                  <textarea value={f.respuesta} onChange={e => updateFaq(i, "respuesta", e.target.value)} placeholder="Respuesta" rows={2} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 10px", fontSize: 12, outline: "none", resize: "none", boxSizing: "border-box" as const }} />
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
              <button onClick={guardar} disabled={saving || !form.titulo} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: saving || !form.titulo ? 0.6 : 1 }}>{saving ? "Guardando..." : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
