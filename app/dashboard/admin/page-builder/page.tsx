"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PLANTILLAS = [
  { id: "restaurante", nombre: "Restaurante", color: "#ef4444", desc: "Menu, reservas y galeria de platos", website_type: "Restaurante", prompt: "Crear sitio web para un restaurante con menu destacado, opcion de reservas y galeria de platos. Tono calido y apetitoso." },
  { id: "inmobiliaria", nombre: "Inmobiliaria", color: "#3b82f6", desc: "Propiedades, contacto y avaluos", website_type: "Inmobiliaria", prompt: "Crear sitio web para una inmobiliaria con propiedades destacadas, formulario de contacto y servicio de avaluos. Tono profesional y confiable." },
  { id: "spa", nombre: "Spa y Bienestar", color: "#8b5cf6", desc: "Servicios, precios y reservas", website_type: "Spa", prompt: "Crear sitio web para un spa de bienestar con servicios, precios y sistema de reservas. Tono relajante y elegante." },
  { id: "medico", nombre: "Consultorio Medico", color: "#10b981", desc: "Servicios, equipo y citas", website_type: "Medicos", prompt: "Crear sitio web para un consultorio medico con servicios, presentacion del equipo medico y agendamiento de citas. Tono profesional y de confianza." },
  { id: "abogados", nombre: "Firma de Abogados", color: "#1e293b", desc: "Servicios legales y contacto", website_type: "Abogados", prompt: "Crear sitio web para una firma de abogados con areas de practica, servicios legales y formulario de contacto. Tono serio y profesional." },
  { id: "gimnasio", nombre: "Gimnasio", color: "#f59e0b", desc: "Planes, clases y equipo", website_type: "Gimnasio", prompt: "Crear sitio web para un gimnasio con planes de membresia, horario de clases y presentacion del equipo de entrenadores. Tono energico y motivador." },
  { id: "hotel", nombre: "Hotel", color: "#6366f1", desc: "Habitaciones, servicios y reservas", website_type: "Hotel", prompt: "Crear sitio web para un hotel con tipos de habitaciones, servicios del hotel y sistema de reservas. Tono acogedor y premium." },
  { id: "tienda", nombre: "Tienda Online", color: "#ec4899", desc: "Productos, categorias y contacto", website_type: "Tienda Online", prompt: "Crear tienda online con productos destacados, categorias claras y formulario de contacto. Tono moderno y atractivo para compras." },
  { id: "agencia", nombre: "Agencia Marketing", color: "#7c3aed", desc: "Servicios, portafolio y equipo", website_type: "Agencia", prompt: "Crear sitio web para una agencia de marketing con servicios, portafolio de trabajos y presentacion del equipo. Tono creativo y profesional." },
];

export default function PageBuilderHome() {
  const router = useRouter();
  const supabase = createClient();
  const [sitios, setSitios] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [asignando, setAsignando] = useState<any>(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"sitios" | "plantillas">("sitios");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (prof?.role !== "admin") { router.push("/dashboard/client"); return; }
      const { data } = await supabase.from("generated_websites").select("*").order("created_at", { ascending: false });
      setSitios(data ?? []);
        const { data: cl } = await supabase.from("profiles").select("id, name, email").eq("role", "client").order("name");
        setClientes(cl ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Eliminar este sitio?")) return;
    await supabase.from("generated_websites").delete().eq("id", id);
    setSitios(prev => prev.filter(s => s.id !== id));
  }

  async function handleBloquear(sitio: any) {
    const nuevoEstado = !sitio.bloqueado;
    await supabase.from("generated_websites").update({ bloqueado: nuevoEstado }).eq("id", sitio.id);
    setSitios(prev => prev.map(s => s.id === sitio.id ? { ...s, bloqueado: nuevoEstado } : s));
  }

  async function handleAsignar() {
    if (!asignando) return;
    await supabase.from("generated_websites").update({ user_id: clienteSeleccionado || null }).eq("id", asignando.id);
    setSitios(prev => prev.map(s => s.id === asignando.id ? { ...s, user_id: clienteSeleccionado || null } : s));
    setAsignando(null);
    setClienteSeleccionado("");
  }

  async function handleDuplicar(sitio: any) {
    const { data } = await supabase.from("generated_websites").insert({
      project_name: sitio.project_name + " (copia)",
      prompt: sitio.prompt,
      website_type: sitio.website_type,
      template_version: sitio.template_version ?? "v1",
      theme: sitio.theme,
      primary_color: sitio.primary_color,
      secondary_color: sitio.secondary_color,
      generated_content: sitio.generated_content,
      logo_url: sitio.logo_url,
      status: "draft",
    }).select().single();
    if (data) setSitios(prev => [data, ...prev]);
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f0f0f0" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <header style={{ background: "#fff", borderBottom: "1px solid rgba(124,58,237,0.1)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111", margin: 0 }}>Page Builder</h1>
          <p style={{ color: "#888", fontSize: 12, margin: "4px 0 0" }}>Crea y edita sitios web profesionales</p>
        </div>
        <Link href="/dashboard/admin/ai-builder" style={{ background: "#7c3aed", color: "#fff", padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
          + Generar con IA
        </Link>
      </header>

      <div style={{ padding: "24px 16px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["sitios", "plantillas"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: tab === t ? "#7c3aed" : "#fff", color: tab === t ? "#fff" : "#666", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              {t === "sitios" ? "Mis Sitios" : "Plantillas"}
            </button>
          ))}
        </div>

        {tab === "sitios" && (
          <div>
            {sitios.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 16, padding: 48, textAlign: "center", color: "#888" }}>
                <p style={{ fontSize: 15, marginBottom: 16 }}>No tienes sitios creados aun</p>
                <Link href="/dashboard/admin/ai-builder" style={{ background: "#7c3aed", color: "#fff", padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                  Generar con IA
                </Link>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                {sitios.map(s => (
                  <div key={s.id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #e8e8e8" }}>
                    <div style={{ height: 100, background: `linear-gradient(135deg, ${s.primary_color ?? "#7c3aed"}, ${s.secondary_color ?? "#1a1a1a"})`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      {s.logo_url ? (
                        <img src={s.logo_url} alt="logo" style={{ height: 48, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
                      ) : (
                        <p style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{s.project_name}</p>
                      )}
                      <span style={{ position: "absolute", top: 10, right: 10, background: s.status === "published" ? "#10b981" : "rgba(255,255,255,0.2)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 999 }}>
                        {s.status === "published" ? "Publicado" : "Borrador"}
                      </span>
                    </div>
                    <div style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <p style={{ fontWeight: 800, fontSize: 14, color: "#111", margin: 0 }}>{s.project_name}</p>
                        <span style={{ fontSize: 10, fontWeight: 700, background: "rgba(124,58,237,0.1)", color: "#7c3aed", padding: "2px 8px", borderRadius: 999 }}>{s.website_type}</span>
                      </div>
                      <p style={{ fontSize: 11, color: "#999", margin: "0 0 14px" }}>{new Date(s.created_at).toLocaleDateString("es-CO")}</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <Link href={`/dashboard/admin/page-builder/${s.id}`} style={{ background: "#7c3aed", color: "#fff", padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
                          Editar
                        </Link>
                        <a href={`/demo/${s.id}`} target="_blank" style={{ background: "#f3f4f6", color: "#555", padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
                          Ver demo
                        </a>
                        <button onClick={() => handleBloquear(s)} style={{ background: s.bloqueado ? "#fef2f2" : "#f0fdf4", color: s.bloqueado ? "#ef4444" : "#10b981", padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>
                            {s.bloqueado ? "Desbloquear" : "Bloquear"}
                          </button>
                          <button onClick={() => { setAsignando(s); setClienteSeleccionado(s.user_id ?? ""); }} style={{ background: "#eff6ff", color: "#3b82f6", padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>
                            Cliente
                          </button>
                          <button onClick={() => handleDuplicar(s)} style={{ background: "#f3f4f6", color: "#555", padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>
                          Duplicar
                        </button>
                        <button onClick={() => handleDelete(s.id)} style={{ background: "#fef2f2", color: "#ef4444", padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "plantillas" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {PLANTILLAS.map(p => (
              <div key={p.id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #e8e8e8" }}>
                <div style={{ height: 80, background: p.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <p style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{p.nombre}</p>
                </div>
                <div style={{ padding: 16 }}>
                  <p style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>{p.desc}</p>
                  <button onClick={() => router.push(`/dashboard/admin/ai-builder?website_type=${encodeURIComponent(p.website_type)}&prompt=${encodeURIComponent(p.prompt)}&primary_color=${encodeURIComponent(p.color)}`)} style={{ width: "100%", background: p.color, color: "#fff", border: "none", borderRadius: 8, padding: "8px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    Usar plantilla
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {asignando && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 420, boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111", marginBottom: 4 }}>Asignar cliente</h2>
            <p style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>Sitio: {asignando.project_name}</p>
            <select value={clienteSeleccionado} onChange={e => setClienteSeleccionado(e.target.value)} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", marginBottom: 16 }}>
              <option value="">Sin asignar (demo)</option>
              {clientes.map((c: any) => <option key={c.id} value={c.id}>{c.name ?? c.email}</option>)}
            </select>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setAsignando(null); setClienteSeleccionado(""); }} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
              <button onClick={handleAsignar} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}