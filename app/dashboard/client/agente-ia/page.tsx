"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AgenteIA() {
  const router = useRouter();
  const supabase = createClient();
  const [agente, setAgente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState("");
  const [sites, setSites] = useState<any[]>([]);
  const [form, setForm] = useState({
    nombre: "", descripcion: "", servicios: "", faq: "",
    horario: "", whatsapp: "", correo: "", direccion: "", site_id: "",
  });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data: sub } = await supabase.from("subscriptions").select("plan").eq("user_id", user.id).maybeSingle();
      if (sub?.plan !== "empresarial" && sub?.status !== "trial") { router.push("/dashboard/client"); return; }
      const { data: s } = await supabase.from("generated_websites").select("id, project_name").eq("user_id", user.id);
      setSites(s ?? []);
      setUserId(user.id);
      const { data: a } = await supabase.from("ai_agents").select("*").eq("user_id", user.id).maybeSingle();
      if (a) { setAgente(a); setForm({ nombre: a.nombre, descripcion: a.descripcion ?? "", servicios: a.servicios ?? "", faq: a.faq ?? "", horario: a.horario ?? "", whatsapp: a.whatsapp ?? "", correo: a.correo ?? "", direccion: a.direccion ?? "", site_id: a.site_id ?? "" }); }
      setLoading(false);
    }
    load();
  }, []);

  async function guardar() {
    setSaving(true);
    if (agente) {
      await supabase.from("ai_agents").update({ ...form }).eq("id", agente.id);
    } else {
      const { data } = await supabase.from("ai_agents").insert({ user_id: userId, ...form, activo: true }).select().single();
      setAgente(data);
    }
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  }

  function Field({ label, field, multiline = false }: { label: string; field: string; multiline?: boolean }) {
    return (
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 6 }}>{label}</label>
        {multiline ? (
          <textarea value={(form as any)[field]} onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))} rows={3} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box" as const }} />
        ) : (
          <input value={(form as any)[field]} onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
        )}
      </div>
    );
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ padding: "2rem", minWidth: 0, maxWidth: 700 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111", margin: 0 }}>Agente IA</h1>
        <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Configura tu asistente inteligente para atender clientes automaticamente.</p>
      </div>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "1.5rem" }}>
        {sites.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Sitio Web</label>
            <select value={form.site_id} onChange={e => setForm(prev => ({ ...prev, site_id: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }}>
              <option value="">Seleccionar sitio</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.project_name}</option>)}
            </select>
          </div>
        )}
        <Field label="Nombre del agente" field="nombre" />
        <Field label="Descripcion del negocio" field="descripcion" multiline />
        <Field label="Servicios que ofrece" field="servicios" multiline />
        <Field label="Preguntas frecuentes" field="faq" multiline />
        <Field label="Horario de atencion" field="horario" />
        <Field label="WhatsApp" field="whatsapp" />
        <Field label="Correo" field="correo" />
        <Field label="Direccion" field="direccion" />
        <button onClick={guardar} disabled={saving} style={{ background: saved ? "#10b981" : "#7c3aed", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", marginTop: 8 }}>
          {saving ? "Guardando..." : saved ? "Guardado" : agente ? "Actualizar Agente" : "Crear Agente"}
        </button>
      </div>
    </div>
  );
}

