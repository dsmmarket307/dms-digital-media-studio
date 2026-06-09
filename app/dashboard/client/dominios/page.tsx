"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MENU = [
  { href: "/dashboard/client", label: "Inicio" },
  { href: "/dashboard/client/sitio", label: "Mi Sitio Web" },
  { href: "/dashboard/client/galeria", label: "Galeria" },
  { href: "/dashboard/client/reservas", label: "Reservas" },
  { href: "/dashboard/client/leads", label: "Leads" },
  { href: "/dashboard/client/dominios", label: "Dominios", active: true },
  { href: "/dashboard/client/facturacion", label: "Facturacion" },
  { href: "/dashboard/client/soporte", label: "Soporte" },
];

async function checkDomain(domain: string): Promise<"available" | "taken" | "unknown"> {
  try {
    const res = await fetch(`https://rdap.org/domain/${domain}`, { method: "GET" });
    return res.ok ? "taken" : "available";
  } catch {
    return "unknown";
  }
}

function getSugerencias(domain: string): string[] {
  const base = domain.split(".")[0];
  return [
    `${base}.co`,
    `${base}.com.co`,
    `${base}.net`,
    `${base}.org`,
    `${base}online.com`,
    `mi${base}.com`,
  ];
}

export default function Dominios() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState("");
  const [userId, setUserId] = useState("");
  const [sites, setSites] = useState<any[]>([]);
  const [dominios, setDominios] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [resultado, setResultado] = useState<"available" | "taken" | "unknown" | null>(null);
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [showConectar, setShowConectar] = useState(false);
  const [dominioAConectar, setDominioAConectar] = useState("");
  const [siteSeleccionado, setSiteSeleccionado] = useState("");
  const [conectando, setConectando] = useState(false);
  const [showInstrucciones, setShowInstrucciones] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUserId(user.id);
      const { data: sub } = await supabase.from("subscriptions").select("plan").eq("user_id", user.id).maybeSingle();
      setPlan(sub?.plan ?? "basico");
      const { data: s } = await supabase.from("generated_websites").select("id, project_name").eq("user_id", user.id);
      setSites(s ?? []);
      const { data: d } = await supabase.from("domains").select("*, generated_websites(project_name)").eq("user_id", user.id).order("created_at", { ascending: false });
      setDominios(d ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function buscarDominio() {
    if (!busqueda) return;
    setBuscando(true);
    setResultado(null);
    setSugerencias([]);
    const domain = busqueda.includes(".") ? busqueda : `${busqueda}.com`;
    const res = await checkDomain(domain);
    setResultado(res);
    if (res === "taken") setSugerencias(getSugerencias(domain));
    setBuscando(false);
  }

  async function conectarDominio() {
    if (!dominioAConectar || !siteSeleccionado) return;
    const maxDominios = plan === "empresarial" ? 3 : plan === "profesional" ? 1 : 0;
    if (dominios.length >= maxDominios) return;
    setConectando(true);
    const { data } = await supabase.from("domains").insert({
      user_id: userId,
      site_id: siteSeleccionado,
      domain: dominioAConectar,
      status: "pending",
      ssl_status: "pending",
    }).select().single();
    if (data) {
      setDominios(prev => [data, ...prev]);
      setShowInstrucciones(data);
    }
    setDominioAConectar("");
    setSiteSeleccionado("");
    setShowConectar(false);
    setConectando(false);
  }

  async function verificarDNS(id: string, domain: string) {
    try {
      const res = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
      const data = await res.json();
      const ip = data?.Answer?.[0]?.data;
      const verified = ip === "76.76.21.21";
      const newStatus = verified ? "active" : "dns_error";
      await supabase.from("domains").update({ status: newStatus, dns_verified: verified, updated_at: new Date().toISOString() }).eq("id", id);
      setDominios(prev => prev.map(d => d.id === id ? { ...d, status: newStatus, dns_verified: verified } : d));
    } catch {
      await supabase.from("domains").update({ status: "dns_error" }).eq("id", id);
      setDominios(prev => prev.map(d => d.id === id ? { ...d, status: "dns_error" } : d));
    }
  }

  async function eliminarDominio(id: string) {
    await supabase.from("domains").delete().eq("id", id);
    setDominios(prev => prev.filter(d => d.id !== id));
  }

  const STATUS_COLORS: Record<string, string> = {
    pending: "#f59e0b", connecting: "#3b82f6", active: "#10b981", dns_error: "#ef4444"
  };
  const STATUS_LABELS: Record<string, string> = {
    pending: "Pendiente", connecting: "Conectando", active: "Activo", dns_error: "Error DNS"
  };
  const maxDominios = plan === "empresarial" ? 3 : plan === "profesional" ? 1 : 0;

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <main style={{ flex: 1, padding: "2rem", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111", margin: 0 }}>Dominios</h1>
            <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Gestiona los dominios de tu sitio web.</p>
          </div>
          {plan !== "basico" && dominios.length < maxDominios && (
            <button onClick={() => setShowConectar(!showConectar)} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Conectar Dominio</button>
          )}
        </div>

        {plan === "basico" && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "1.5rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: "#111", margin: 0 }}>Tu plan no incluye dominios personalizados</p>
              <p style={{ fontSize: 13, color: "#888", margin: 0, marginTop: 4 }}>Actualiza al plan Profesional o Empresarial para conectar tu propio dominio.</p>
            </div>
            <Link href="/dashboard/client/suscripcion" style={{ marginLeft: "auto", background: "#7c3aed", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none", flexShrink: 0 }}>Actualizar plan</Link>
          </div>
        )}

        {/* BUSCADOR */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 12 }}>Buscar disponibilidad</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)} onKeyDown={e => e.key === "Enter" && buscarDominio()} placeholder="restaurantelatoscana.com" style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none" }} />
            <button onClick={buscarDominio} disabled={buscando || !busqueda} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: buscando ? 0.6 : 1 }}>{buscando ? "Buscando..." : "Buscar"}</button>
          </div>

          {resultado && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, background: resultado === "available" ? "#f0fdf4" : "#fef2f2", border: `1px solid ${resultado === "available" ? "#86efac" : "#fca5a5"}` }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: resultado === "available" ? "#10b981" : "#ef4444", flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: resultado === "available" ? "#10b981" : "#ef4444" }}>
                  {busqueda.includes(".") ? busqueda : `${busqueda}.com`} — {resultado === "available" ? "Disponible" : "No disponible"}
                </p>
                {resultado === "available" && plan !== "basico" && dominios.length < maxDominios && (
                  <button onClick={() => { setDominioAConectar(busqueda.includes(".") ? busqueda : `${busqueda}.com`); setShowConectar(true); }} style={{ marginLeft: "auto", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Conectar</button>
                )}
              </div>

              {sugerencias.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <p style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Alternativas disponibles:</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {sugerencias.map(s => (
                      <button key={s} onClick={() => setBusqueda(s)} style={{ background: "#f3f4f6", color: "#555", border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CONECTAR DOMINIO */}
        {showConectar && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 16 }}>Conectar Dominio</h2>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 6 }}>Dominio</label>
              <input value={dominioAConectar} onChange={e => setDominioAConectar(e.target.value)} placeholder="midominio.com" style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" as const }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 6 }}>Sitio a asociar</label>
              <select value={siteSeleccionado} onChange={e => setSiteSeleccionado(e.target.value)} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none" }}>
                <option value="">Seleccionar sitio</option>
                {sites.map(s => <option key={s.id} value={s.id}>{s.project_name}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={conectarDominio} disabled={conectando || !dominioAConectar || !siteSeleccionado} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: conectando ? 0.6 : 1 }}>{conectando ? "Conectando..." : "Conectar"}</button>
              <button onClick={() => setShowConectar(false)} style={{ background: "#f3f4f6", color: "#555", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
            </div>
          </div>
        )}

        {/* INSTRUCCIONES DNS */}
        {showInstrucciones && (
          <div style={{ background: "#fff", borderRadius: 12, border: "2px solid #7c3aed", padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#7c3aed", marginBottom: 4 }}>Instrucciones DNS para {showInstrucciones.domain}</h2>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>Configura estos registros en el panel de tu proveedor de dominio:</p>
            <div style={{ background: "#f8f9fa", borderRadius: 10, padding: "1rem", fontFamily: "monospace", fontSize: 13, marginBottom: 12 }}>
              <p style={{ margin: 0, marginBottom: 8, color: "#111" }}><strong>Tipo:</strong> A &nbsp;&nbsp; <strong>Host:</strong> @ &nbsp;&nbsp; <strong>Valor:</strong> 76.76.21.21</p>
              <p style={{ margin: 0, color: "#111" }}><strong>Tipo:</strong> CNAME &nbsp;&nbsp; <strong>Host:</strong> www &nbsp;&nbsp; <strong>Valor:</strong> cname.vercel-dns.com</p>
            </div>
            <p style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>Los cambios DNS pueden tardar hasta 48 horas en propagarse.</p>
            <button onClick={() => setShowInstrucciones(null)} style={{ background: "#f3f4f6", color: "#555", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cerrar</button>
          </div>
        )}

        {/* MIS DOMINIOS */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111", margin: 0 }}>Mis Dominios {plan !== "basico" && <span style={{ fontSize: 12, color: "#888", fontWeight: 400 }}>({dominios.length}/{maxDominios})</span>}</h2>
          </div>
          {dominios.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <p style={{ color: "#ccc", fontSize: 14 }}>No tienes dominios conectados aun.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #e5e7eb" }}>
                  {["Dominio", "Sitio", "Estado", "SSL", "Acciones"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dominios.map(d => (
                  <tr key={d.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#111" }}>{d.domain}</td>
                    <td style={{ padding: "12px 16px", color: "#555" }}>{d.generated_websites?.project_name ?? "---"}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: `${STATUS_COLORS[d.status]}20`, color: STATUS_COLORS[d.status], padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{STATUS_LABELS[d.status]}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: d.ssl_status === "active" ? "#f0fdf4" : "#fef9ec", color: d.ssl_status === "active" ? "#10b981" : "#f59e0b", padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{d.ssl_status === "active" ? "Activo" : "Pendiente"}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => verificarDNS(d.id, d.domain)} style={{ background: "#f0f0f0", color: "#555", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Verificar DNS</button>
                        <button onClick={() => setShowInstrucciones(d)} style={{ background: "rgba(124,58,237,0.1)", color: "#7c3aed", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>DNS</button>
                        <button onClick={() => eliminarDominio(d.id)} style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
