"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const MENU = [
  { href: "/dashboard/client", label: "Inicio" },
  { href: "/dashboard/client/sitio", label: "Mi Sitio Web" },
  { href: "/dashboard/client/galeria", label: "Galeria" },
  { href: "/dashboard/client/reservas", label: "Reservas" },
  { href: "/dashboard/client/leads", label: "Leads" },
  { href: "/dashboard/client/crm", label: "CRM Pipeline" },
  { href: "/dashboard/client/automatizaciones", label: "Automatizaciones", active: true },
  { href: "/dashboard/client/agente-ia", label: "Agente IA" },
  { href: "/dashboard/client/facturacion", label: "Facturacion" },
  { href: "/dashboard/client/soporte", label: "Soporte" },
];

const TRIGGERS: Record<string, string> = {
  lead_nuevo: "Llega un nuevo lead",
  reserva_nueva: "Se recibe una reserva",
  lead_sin_respuesta: "Lead sin respuesta 48h",
  lead_ganado: "Lead marcado como ganado",
};

const ACCIONES: Record<string, string> = {
  enviar_correo: "Enviar correo",
  enviar_whatsapp: "Enviar WhatsApp",
  notificar_propietario: "Notificar al propietario",
  mover_pipeline: "Mover en pipeline",
};

export default function Automatizaciones() {
  const router = useRouter();
  const supabase = createClient();
  const [automatizaciones, setAutomatizaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [trigger, setTrigger] = useState("lead_nuevo");
  const [accion, setAccion] = useState("enviar_correo");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      const { data: sub } = await supabase.from("subscriptions").select("plan").eq("user_id", user.id).maybeSingle();
      if (sub?.plan !== "empresarial") { router.push("/dashboard/client"); return; }
      const { data } = await supabase.from("automatizaciones").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setAutomatizaciones(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function guardar() {
    if (!nombre) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("automatizaciones").insert({ user_id: user.id, nombre, trigger, accion, activa: true }).select().single();
    if (data) setAutomatizaciones(prev => [data, ...prev]);
    setNombre("");
    setTrigger("lead_nuevo");
    setAccion("enviar_correo");
    setShowForm(false);
    setSaving(false);
  }

  async function toggleActiva(id: string, activa: boolean) {
    await supabase.from("automatizaciones").update({ activa: !activa }).eq("id", id);
    setAutomatizaciones(prev => prev.map(a => a.id === id ? { ...a, activa: !activa } : a));
  }

  async function eliminar(id: string) {
    await supabase.from("automatizaciones").delete().eq("id", id);
    setAutomatizaciones(prev => prev.filter(a => a.id !== id));
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <main style={{ flex: 1, padding: "2rem", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111", margin: 0 }}>Automatizaciones</h1>
            <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Configura acciones automaticas cuando ocurran eventos.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Nueva</button>
        </div>

        {showForm && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 16 }}>Nueva Automatizacion</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Nombre</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Notificar nuevo lead" style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", display: "block", marginBottom: 6 }}>SI ocurre</label>
                <select value={trigger} onChange={e => setTrigger(e.target.value)} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }}>
                  {Object.entries(TRIGGERS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", display: "block", marginBottom: 6 }}>ENTONCES</label>
                <select value={accion} onChange={e => setAccion(e.target.value)} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }}>
                  {Object.entries(ACCIONES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={guardar} disabled={saving} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{saving ? "Guardando..." : "Guardar"}</button>
              <button onClick={() => setShowForm(false)} style={{ background: "#f3f4f6", color: "#555", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {automatizaciones.map(a => (
            <div key={a.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#111", margin: 0 }}>{a.nombre}</p>
                <p style={{ fontSize: 12, color: "#888", margin: 0, marginTop: 4 }}>
                  <span style={{ background: "#f0f0f0", borderRadius: 6, padding: "2px 8px", marginRight: 6 }}>SI: {TRIGGERS[a.trigger]}</span>
                  <span style={{ background: "#f0f0f0", borderRadius: 6, padding: "2px 8px" }}>ENTONCES: {ACCIONES[a.accion]}</span>
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => toggleActiva(a.id, a.activa)} style={{ background: a.activa ? "#10b981" : "#f3f4f6", color: a.activa ? "#fff" : "#888", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{a.activa ? "Activa" : "Inactiva"}</button>
                <button onClick={() => eliminar(a.id)} style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>Eliminar</button>
              </div>
            </div>
          ))}
          {automatizaciones.length === 0 && (
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "3rem", textAlign: "center" }}>
              <p style={{ color: "#ccc", fontSize: 14 }}>No hay automatizaciones aun. Crea la primera.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
