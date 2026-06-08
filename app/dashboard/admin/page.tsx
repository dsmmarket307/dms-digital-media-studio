"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState<any[]>([]);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [ventas, setVentas] = useState<any[]>([]);
  const [suscripciones, setSuscripciones] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (prof?.role !== "admin") { router.push("/dashboard/client"); return; }
      const [{ data: c }, { data: p }, { data: pags }, { data: l }, { data: t }, { data: v }, s] = await Promise.all([
        supabase.from("profiles").select("*").eq("role", "client").order("created_at", { ascending: false }),
        supabase.from("proyectos").select("*, profiles(name, email)").order("created_at", { ascending: false }),
        supabase.from("pagos").select("*, profiles(name)").order("created_at", { ascending: false }),
        supabase.from("leads").select("*").order("created_at", { ascending: false }),
        supabase.from("soporte_mensajes").select("*").order("created_at", { ascending: false }),
        supabase.from("package_orders").select("*").order("created_at", { ascending: false }),
        fetch("/api/admin/suscripciones").then(r => r.json()),
      ]);
      setClientes(c ?? []);
      setProyectos(p ?? []);
      setPagos(pags ?? []);
      setLeads(l ?? []);
      setTickets(t ?? []);
      setVentas(v ?? []);
      setSuscripciones(s?.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #ede9fe", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const PRECIOS: Record<string, number> = { basico: 49000, profesional: 99000, empresarial: 199000 };

  const sActivas = suscripciones.filter(s => s.status === "active");
  const sTrial = suscripciones.filter(s => s.status === "trial");
  const sVencidas = suscripciones.filter(s => s.status === "expired" || s.status === "cancelled");
  const mrr = sActivas.reduce((sum, s) => sum + (PRECIOS[s.plan] ?? 0), 0);
  const arr = mrr * 12;
  const conversionRate = suscripciones.length > 0 ? Math.round((sActivas.length / suscripciones.length) * 100) : 0;

  const totalIngresos = pagos.filter(p => p.estado === "pagado").reduce((s, p) => s + Number(p.monto), 0) + ventas.filter(v => v.status === "approved").reduce((s, v) => s + Number(v.price), 0);
  const ticketsPendientes = tickets.filter(t => t.estado === "pendiente").length;

  const metrics = [
    { label: "Clientes", value: clientes.length, color: "#7c3aed", alert: false },
    { label: "Proyectos", value: proyectos.length, color: "#7c3aed", alert: false },
    { label: "Leads", value: leads.length, color: "#7c3aed", alert: leads.length > 0 },
    { label: "Ingresos", value: "$" + totalIngresos.toLocaleString("es-CO"), color: "#059669", alert: false },
    { label: "Soporte", value: ticketsPendientes > 0 ? ticketsPendientes : "Al dia", color: ticketsPendientes > 0 ? "#ef4444" : "#059669", alert: ticketsPendientes > 0 },
  ];

  const metricsSaas = [
    { label: "MRR", value: "$" + mrr.toLocaleString("es-CO"), color: "#059669", desc: "Ingresos mensuales recurrentes" },
    { label: "ARR", value: "$" + arr.toLocaleString("es-CO"), color: "#059669", desc: "Ingresos anuales proyectados" },
    { label: "Activas", value: sActivas.length, color: "#10b981", desc: "Suscripciones activas" },
    { label: "En prueba", value: sTrial.length, color: "#7c3aed", desc: "Clientes en trial" },
    { label: "Vencidas", value: sVencidas.length, color: "#ef4444", desc: "Canceladas o vencidas" },
    { label: "Conversion", value: conversionRate + "%", color: "#3b82f6", desc: "Trial a pago" },
  ];

  const menuItems = [
    { href: "/dashboard/admin/crm", label: "CRM", desc: "Gestion de clientes y proyectos activos", color: "#7c3aed", badge: 0, green: false },
    { href: "/dashboard/admin/ai-builder", label: "AI Builder", desc: "Generador de sitios web con inteligencia artificial", color: "#7c3aed", badge: 0, green: false },
    { href: "/dashboard/admin/prospeccion", label: "Prospeccion IA", desc: "Busca negocios potenciales con IA", color: "#7c3aed", badge: 0, green: false },
    { href: "/dashboard/admin/soporte", label: "Soporte", desc: "Responder tickets de clientes en tiempo real", color: "#059669", badge: ticketsPendientes, green: true },
    { href: "/dashboard/admin/marketing", label: "Centro Marketing IA", desc: "Campanas automaticas con IA para clientes digitales", color: "#7c3aed", badge: 0, green: false },
    { href: "/dashboard/admin/finanzas", label: "Finanzas del Negocio", desc: "Ingresos, egresos y utilidad del estudio", color: "#7c3aed", badge: 0, green: false },
    { href: "/dashboard/admin/inteligencia", label: "Centro de Inteligencia", desc: "Analitica avanzada, metas y proyecciones con IA", color: "#7c3aed", badge: 0, green: false },
    { href: "/dashboard/admin/suscripciones", label: "Suscripciones", desc: "Clientes activos, MRR y gestion de planes", color: "#059669", badge: sTrial.length, green: true },
  ];

  return (
    <div style={{ background: "#f5f5f5", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 2rem" }}>

        <div style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: "#7c3aed", marginBottom: "0.25rem", fontWeight: 600 }}>Panel de Control</p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#111111", margin: 0 }}>Administrador</h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {metrics.map((item, i) => (
            <div key={i} style={{ background: "#ffffff", border: "1px solid rgba(124,58,237,0.1)", borderRadius: 16, padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(124,58,237,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="1.5"><circle cx="12" cy="12" r="10"/></svg>
                </div>
                {item.alert && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />}
              </div>
              <p style={{ fontSize: "0.7rem", color: "#555555", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "0.5rem", fontWeight: 500 }}>{item.label}</p>
              <p style={{ fontSize: "2rem", fontWeight: 800, color: item.color, margin: 0 }}>{item.value}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: "#999999", marginBottom: "1rem", fontWeight: 600 }}>Metricas SaaS</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {metricsSaas.map((item, i) => (
            <div key={i} style={{ background: "#ffffff", border: "1px solid rgba(124,58,237,0.08)", borderRadius: 14, padding: "1.25rem" }}>
              <p style={{ fontSize: "0.65rem", color: "#888", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "0.5rem", fontWeight: 600 }}>{item.label}</p>
              <p style={{ fontSize: "1.5rem", fontWeight: 800, color: item.color, margin: "0 0 4px" }}>{item.value}</p>
              <p style={{ fontSize: "0.7rem", color: "#aaa", margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: "#999999", marginBottom: "1rem", fontWeight: 600 }}>Accesos rapidos</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          {menuItems.map((item) => (
            <a key={item.href} href={item.href} style={{ background: "#ffffff", border: `1px solid ${item.green ? "rgba(5,150,105,0.2)" : "rgba(124,58,237,0.1)"}`, borderRadius: 16, padding: "1.75rem", display: "block", textDecoration: "none" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: item.green ? "rgba(5,150,105,0.08)" : "rgba(124,58,237,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                {item.badge > 0 && (
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 999, padding: "2px 8px" }}>
                    {item.badge} pendientes
                  </span>
                )}
              </div>
              <p style={{ fontSize: "1rem", fontWeight: 700, color: "#111111", marginBottom: "0.375rem" }}>{item.label}</p>
              <p style={{ fontSize: "0.8rem", color: "#555555", lineHeight: 1.5, marginBottom: "1.25rem" }}>{item.desc}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <span style={{ fontSize: "0.78rem", color: item.color, fontWeight: 600 }}>Abrir</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </a>
          ))}
        </div>

      </div>
    </div>
  );
}
