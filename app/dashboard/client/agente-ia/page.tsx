"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AgenteIA() {
  const router = useRouter();
  const supabase = createClient();
  const [agente, setAgente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState("");
  const [sites, setSites] = useState<any[]>([]);
  const [waSettings, setWaSettings] = useState<any>(null);
  const [waForm, setWaForm] = useState({ phone_number_id: "", access_token: "" });
  const [savingWa, setSavingWa] = useState(false);
  const [savedWa, setSavedWa] = useState(false);
  const [form, setForm] = useState({
    nombre: "", descripcion: "", servicios: "", faq: "",
    horario: "", whatsapp: "", correo: "", direccion: "", site_id: "",
  });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data: sub } = await supabase.from("subscriptions").select("plan, status").eq("user_id", user.id).maybeSingle();
      if (sub?.plan !== "empresarial" && sub?.status !== "trial") { router.push("/dashboard/client"); return; }
      const { data: s } = await supabase.from("generated_websites").select("id, project_name").eq("user_id", user.id);
      setSites(s ?? []);
      setUserId(user.id);
      const { data: a } = await supabase.from("ai_agents").select("*").eq("user_id", user.id).maybeSingle();
      if (a) { setAgente(a); setForm({ nombre: a.nombre, descripcion: a.descripcion ?? "", servicios: a.servicios ?? "", faq: a.faq ?? "", horario: a.horario ?? "", whatsapp: a.whatsapp ?? "", correo: a.correo ?? "", direccion: a.direccion ?? "", site_id: a.site_id ?? "" }); }
      const { data: wa } = await supabase.from("whatsapp_settings").select("*").eq("user_id", user.id).maybeSingle();
      if (wa) { setWaSettings(wa); setWaForm({ phone_number_id: wa.phone_number_id ?? "", access_token: wa.access_token ?? "" }); }
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

  async function guardarWhatsapp() {
    if (!waForm.phone_number_id || !waForm.access_token) return;
    setSavingWa(true);
    const businessInfo = `Negocio: ${form.nombre || "Sin nombre"}. ${form.descripcion || ""} Servicios: ${form.servicios || "No especificado"}. Preguntas frecuentes: ${form.faq || "Ninguna"}. Horario: ${form.horario || "No especificado"}. Direccion: ${form.direccion || "No especificada"}.`;
    await supabase.from("whatsapp_settings").upsert({
      user_id: userId,
      phone_number_id: waForm.phone_number_id,
      access_token: waForm.access_token,
      agent_name: form.nombre || "Asistente",
      business_info: businessInfo,
      active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    setSavedWa(true);
    setSavingWa(false);
    setTimeout(() => setSavedWa(false), 3000);
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
      <img src="/favicon-32.png" alt="Cargando" style={{ width: 44, height: 44, animation: "spin 1s linear infinite", borderRadius: 10 }} />
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

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "1.5rem", marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: "#111", margin: 0 }}>Conectar WhatsApp</h2>
          {waSettings?.active && (
            <span style={{ fontSize: 11, fontWeight: 700, color: "#10b981", background: "rgba(16,185,129,0.1)", padding: "3px 10px", borderRadius: 999 }}>Conectado</span>
          )}
        </div>
        <p style={{ color: "#888", fontSize: 12, marginBottom: 16 }}>Conecta el numero de WhatsApp Business de tu negocio para que tu agente responda solo.</p>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 6 }}>Phone Number ID</label>
          <input value={waForm.phone_number_id} onChange={e => setWaForm(prev => ({ ...prev, phone_number_id: e.target.value }))} placeholder="Ej: 123456789012345" style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 6 }}>Access Token</label>
          <input type="password" value={waForm.access_token} onChange={e => setWaForm(prev => ({ ...prev, access_token: e.target.value }))} placeholder="Token permanente de tu app de Meta" style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
        </div>
        <p style={{ fontSize: 11, color: "#aaa", marginBottom: 14 }}>Estos datos los obtienes en tu app de Meta for Developers, seccion WhatsApp {'>'}  API Setup.</p>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" as const }}>
          <button onClick={guardarWhatsapp} disabled={savingWa} style={{ background: savedWa ? "#10b981" : "#7c3aed", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {savingWa ? "Guardando..." : savedWa ? "Conectado" : "Guardar conexion"}
          </button>
          {waSettings?.active && (
            <a href="/dashboard/client/agente-ia/conversaciones" style={{ fontSize: 13, color: "#7c3aed", fontWeight: 700, textDecoration: "none" }}>Ver conversaciones →</a>
          )}
        </div>
      </div>
    </div>
  );
}


