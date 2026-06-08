"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const PLAN_ACCESO: Record<string, string[]> = {
  basico:      ["/dashboard/client", "/dashboard/client/builder", "/dashboard/client/sitio", "/dashboard/client/facturacion", "/dashboard/client/soporte", "/dashboard/client/suscripcion"],
  profesional: ["/dashboard/client", "/dashboard/client/builder", "/dashboard/client/sitio", "/dashboard/client/galeria", "/dashboard/client/leads", "/dashboard/client/reservas", "/dashboard/client/facturacion", "/dashboard/client/soporte", "/dashboard/client/suscripcion"],
  empresarial: ["/dashboard/client", "/dashboard/client/builder", "/dashboard/client/sitio", "/dashboard/client/galeria", "/dashboard/client/leads", "/dashboard/client/reservas", "/dashboard/client/crm", "/dashboard/client/automatizaciones", "/dashboard/client/agente-ia", "/dashboard/client/facturacion", "/dashboard/client/soporte", "/dashboard/client/suscripcion"],
};

const MENU = [
  { href: "/dashboard/client", label: "Inicio" },
  { href: "/dashboard/client/builder", label: "Crear Mi Sitio" },
  { href: "/dashboard/client/sitio", label: "Mi Sitio Web" },
  { href: "/dashboard/client/galeria", label: "Galeria" },
  { href: "/dashboard/client/reservas", label: "Reservas" },
  { href: "/dashboard/client/leads", label: "Leads" },
  { href: "/dashboard/client/crm", label: "CRM Pipeline" },
  { href: "/dashboard/client/automatizaciones", label: "Automatizaciones" },
  { href: "/dashboard/client/agente-ia", label: "Agente IA" },
  { href: "/dashboard/client/facturacion", label: "Facturacion" },
  { href: "/dashboard/client/soporte", label: "Soporte" },
  { href: "/dashboard/client/suscripcion", label: "Mi Suscripcion" },
];

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  trial:     { label: "Prueba gratuita", color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
  active:    { label: "Activa",          color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  past_due:  { label: "Pago pendiente",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  cancelled: { label: "Cancelada",       color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  expired:   { label: "Vencida",         color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  suspended: { label: "Suspendida",      color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
};

const PLANES_PRECIOS: Record<string, number> = { basico: 49000, profesional: 99000, empresarial: 199000 };

function MenuItem({ item, permitido }: { item: { href: string; label: string }; permitido: boolean }) {
  if (permitido) {
    return (
      <Link href={item.href} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", borderRadius:10, textDecoration:"none", color:"#555", fontSize:14, fontWeight:500, transition:"all .2s" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.06)"; (e.currentTarget as HTMLElement).style.color = "#7c3aed"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#555"; }}>
        {item.label}
      </Link>
    );
  }
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", borderRadius:10, color:"#ccc", fontSize:14, fontWeight:500, cursor:"not-allowed" }}>
      <span>{item.label}</span>
      <span style={{ fontSize:10, background:"#f3f4f6", color:"#aaa", padding:"2px 7px", borderRadius:6, fontWeight:700 }}>PRO</span>
    </div>
  );
}

export default function ClientDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [reservas, setReservas] = useState<any[]>([]);
  const [suscripcion, setSuscripcion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (prof?.role === "admin") { router.push("/dashboard/admin"); return; }
      setProfile(prof);
      const [{ data: proy }, { data: pags }, { data: l }, { data: r }, { data: sub }] = await Promise.all([
        supabase.from("proyectos").select("*").eq("client_id", user.id).order("created_at", { ascending: false }),
        supabase.from("pagos").select("*").eq("client_id", user.id).order("created_at", { ascending: false }),
        supabase.from("leads").select("*").eq("email", prof?.email).order("created_at", { ascending: false }),
        supabase.from("reservas").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      setProyectos(proy ?? []);
      setPagos(pags ?? []);
      setLeads(l ?? []);
      setReservas(r ?? []);
      let subFinal = sub ?? null;
      if (sub && sub.status === "active" && sub.current_period_end) {
        const now = new Date();
        const end = new Date(sub.current_period_end);
        if (now > end) {
          await supabase.from("subscriptions").update({ status: "expired" }).eq("id", sub.id);
          if (sub.site_id) await supabase.from("generated_websites").update({ status: "draft" }).eq("id", sub.site_id);
          subFinal = { ...sub, status: "expired" };
        }
      }
      setSuscripcion(subFinal);
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:40, height:40, border:"3px solid #e9d5ff", borderTopColor:"#7c3aed", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const totalPagado = pagos.filter(p => p.estado === "pagado").reduce((s, p) => s + Number(p.monto), 0);
  const planActivo = suscripcion?.status === "active" ? suscripcion.plan : null;
  const rutasPermitidas = planActivo ? PLAN_ACCESO[planActivo] ?? [] : ["/dashboard/client", "/dashboard/client/suscripcion"];
  const diasRestantes = suscripcion?.current_period_end
    ? Math.max(0, Math.ceil((new Date(suscripcion.current_period_end).getTime() - Date.now()) / 86400000))
    : 0;

  return (
    <div style={{ minHeight:"100vh", background:"#f8f9fa", display:"flex" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* SIDEBAR DESKTOP */}
      <aside style={{ width:240, background:"#fff", borderRight:"1px solid #e5e7eb", minHeight:"100vh", position:"sticky", top:0, display:"flex", flexDirection:"column", flexShrink:0 }} className="hidden md:flex">
        <div style={{ padding:"24px 20px 16px", borderBottom:"1px solid #f0f0f0" }}>
          <Image src="/logo-dms.png" alt="DMS" width={120} height={38} />
        </div>
        <nav style={{ flex:1, padding:"12px 10px", display:"flex", flexDirection:"column", gap:2 }}>
          {MENU.map(item => (
            <MenuItem key={item.href} item={item} permitido={rutasPermitidas.includes(item.href)} />
          ))}
        </nav>
        <div style={{ padding:"12px 16px", borderTop:"1px solid #f0f0f0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"rgba(124,58,237,0.1)", display:"flex", alignItems:"center", justifyContent:"center", color:"#7c3aed", fontWeight:800, fontSize:14 }}>
              {profile?.name?.[0]?.toUpperCase() ?? "C"}
            </div>
            <div style={{ overflow:"hidden" }}>
              <p style={{ fontSize:13, fontWeight:700, color:"#111", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{profile?.name ?? "Cliente"}</p>
              <p style={{ fontSize:11, color:"#999", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{profile?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width:"100%", background:"none", border:"none", textAlign:"left", fontSize:13, color:"#888", cursor:"pointer", padding:"6px 0" }}>Cerrar sesion</button>
        </div>
      </aside>

      <div style={{ flex:1, display:"flex", flexDirection:"column" }}>
        {/* HEADER MOBILE */}
        <header style={{ background:"#fff", borderBottom:"1px solid #e5e7eb", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }} className="md:hidden">
          <Image src="/logo-dms.png" alt="DMS" width={100} height={32} />
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background:"none", border:"none", cursor:"pointer" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </header>

        {/* MENU MOBILE */}
        {menuOpen && (
          <div style={{ background:"#fff", borderBottom:"1px solid #e5e7eb", padding:"8px 12px", display:"flex", flexDirection:"column", gap:2 }} className="md:hidden">
            {MENU.map(item => (
              <MenuItem key={item.href} item={item} permitido={rutasPermitidas.includes(item.href)} />
            ))}
            <button onClick={handleLogout} style={{ background:"none", border:"none", textAlign:"left", fontSize:13, color:"#ef4444", cursor:"pointer", padding:"10px 16px" }}>Cerrar sesion</button>
          </div>
        )}

        <main style={{ flex:1, padding:"24px 16px", maxWidth:900, width:"100%", margin:"0 auto" }}>
          <div style={{ marginBottom:24 }}>
            <h1 style={{ fontSize:"1.5rem", fontWeight:800, color:"#111", margin:0 }}>Bienvenido, {profile?.name ?? "Cliente"}</h1>
            <p style={{ color:"#888", fontSize:13, margin:"4px 0 0" }}>Aqui puedes administrar todo tu sitio web y servicios.</p>
          </div>

          {/* STATS */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))", gap:12, marginBottom:24 }}>
            {[
              { label: "Proyectos",    value: proyectos.length,                                    color: "#7c3aed" },
              { label: "Reservas",     value: reservas.length,                                     color: "#3B82F6" },
              { label: "Leads",        value: leads.length,                                        color: "#F59E0B" },
              { label: "Total pagado", value: `$${totalPagado.toLocaleString("es-CO")}`,           color: "#10B981" },
            ].map(s => (
              <div key={s.label} style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", padding:"16px", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                <p style={{ fontSize:"1.4rem", fontWeight:800, color:s.color, margin:0 }}>{s.value}</p>
                <p style={{ fontSize:11, color:"#888", margin:"4px 0 0" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* SUSCRIPCION */}
          <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e5e7eb", padding:20, marginBottom:24, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:8 }}>
              <h2 style={{ fontSize:15, fontWeight:800, color:"#111", margin:0 }}>Mi Suscripcion</h2>
              <Link href="/dashboard/client/suscripcion" style={{ fontSize:12, color:"#7c3aed", fontWeight:700, textDecoration:"none" }}>Ver detalles</Link>
            </div>
            {!suscripcion ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
                <div>
                  <p style={{ fontSize:14, color:"#555", marginBottom:4 }}>No tienes una suscripcion activa.</p>
                  <p style={{ fontSize:12, color:"#999" }}>Elige un plan para comenzar.</p>
                </div>
                <Link href="/dashboard/client/suscripcion" style={{ background:"#7c3aed", color:"#fff", padding:"8px 18px", borderRadius:10, fontSize:13, fontWeight:700, textDecoration:"none" }}>Ver planes</Link>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:12 }}>
                <div>
                  <p style={{ fontSize:11, color:"#888", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Plan</p>
                  <p style={{ fontSize:15, fontWeight:800, color:"#111", textTransform:"capitalize" }}>{suscripcion.plan}</p>
                  <p style={{ fontSize:12, color:"#888" }}>${(PLANES_PRECIOS[suscripcion.plan] ?? 0).toLocaleString("es-CO")}/mes</p>
                </div>
                <div>
                  <p style={{ fontSize:11, color:"#888", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Estado</p>
                  <span style={{ fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:999, background:STATUS_LABELS[suscripcion.status]?.bg, color:STATUS_LABELS[suscripcion.status]?.color }}>
                    {STATUS_LABELS[suscripcion.status]?.label ?? suscripcion.status}
                  </span>
                </div>
                {suscripcion.status === "active" && suscripcion.current_period_end && (
                  <div>
                    <p style={{ fontSize:11, color:"#888", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Vence el</p>
                    <p style={{ fontSize:14, fontWeight:700, color: diasRestantes <= 5 ? "#ef4444" : "#111" }}>{new Date(suscripcion.current_period_end).toLocaleDateString("es-CO")}</p>
                    <p style={{ fontSize:11, color:"#888" }}>{diasRestantes} dias restantes</p>
                  </div>
                )}
                {(suscripcion.status === "expired" || suscripcion.status === "cancelled") && (
                  <div style={{ display:"flex", alignItems:"center" }}>
                    <Link href="/dashboard/client/suscripcion" style={{ background:"#7c3aed", color:"#fff", padding:"8px 16px", borderRadius:10, fontSize:12, fontWeight:700, textDecoration:"none" }}>Renovar plan</Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACCESOS RAPIDOS */}
          <h2 style={{ fontSize:15, fontWeight:800, color:"#111", marginBottom:14 }}>Accesos rapidos</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))", gap:10, marginBottom:24 }}>
            {MENU.slice(1).map(item => {
              const permitido = rutasPermitidas.includes(item.href);
              if (permitido) {
                return (
                  <Link key={item.href} href={item.href} style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:"16px", display:"flex", alignItems:"center", justifyContent:"space-between", textDecoration:"none", color:"#111", fontSize:13, fontWeight:600, transition:"all .2s" }}>
                    {item.label}
                  </Link>
                );
              }
              return (
                <div key={item.href} style={{ background:"#f8f9fa", border:"1px solid #e5e7eb", borderRadius:12, padding:"16px", display:"flex", alignItems:"center", justifyContent:"space-between", color:"#ccc", fontSize:13, fontWeight:600, cursor:"not-allowed" }}>
                  <span>{item.label}</span>
                  <span style={{ fontSize:10, background:"#ececec", color:"#aaa", padding:"2px 7px", borderRadius:6, fontWeight:700 }}>PRO</span>
                </div>
              );
            })}
          </div>

          {proyectos.length > 0 && (
            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #e5e7eb", padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
              <h2 style={{ fontSize:15, fontWeight:800, color:"#111", marginBottom:14 }}>Mis proyectos</h2>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {proyectos.slice(0, 3).map(p => (
                  <div key={p.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #f5f5f5" }}>
                    <div>
                      <p style={{ fontSize:13, fontWeight:700, color:"#111", margin:0 }}>{p.nombre}</p>
                      <p style={{ fontSize:11, color:"#999", margin:"2px 0 0" }}>Plan {p.plan}</p>
                    </div>
                    <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:999, background:"rgba(124,58,237,0.08)", color:"#7c3aed" }}>{p.progreso ?? 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
