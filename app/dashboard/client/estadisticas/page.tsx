"use client";
import { useState, useEffect, useCallback } from "react";
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
  { href: "/dashboard/client/automatizaciones", label: "Automatizaciones" },
  { href: "/dashboard/client/agente-ia", label: "Agente IA" },
  { href: "/dashboard/client/dominios", label: "Dominios" },
  { href: "/dashboard/client/estadisticas", label: "Estadisticas", active: true },
  { href: "/dashboard/client/facturacion", label: "Facturacion" },
  { href: "/dashboard/client/soporte", label: "Soporte" },
  { href: "/dashboard/client/suscripcion", label: "Mi Suscripcion" },
];

function Card({ label, value, color, sub }: { label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "1.25rem", border: "1px solid #f0f0f0", borderTop: `4px solid ${color}` }}>
      <p style={{ fontSize: 28, fontWeight: 800, color, margin: 0 }}>{value}</p>
      <p style={{ fontSize: 13, color: "#555", margin: 0, marginTop: 4, fontWeight: 600 }}>{label}</p>
      {sub && <p style={{ fontSize: 11, color: "#aaa", margin: 0, marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "#555", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, color, fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ background: "#f0f0f0", borderRadius: 999, height: 8 }}>
        <div style={{ width: `${pct}%`, background: color, borderRadius: 999, height: 8, transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

export default function Estadisticas() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [stats, setStats] = useState({
    leads: { total: 0, nuevos: 0, contactados: 0, ganados: 0, perdidos: 0, negociacion: 0 },
    reservas: { total: 0, pendientes: 0, confirmadas: 0, completadas: 0, canceladas: 0 },
    dominios: { total: 0, activos: 0, pendientes: 0, error: 0 },
    conversaciones: { total: 0, leads_generados: 0 },
    automatizaciones: { total: 0, activas: 0 },
  });

  const loadStats = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }
    const { data: sub } = await supabase.from("subscriptions").select("plan").eq("user_id", user.id).maybeSingle();
    if (sub?.plan !== "empresarial") { router.push("/dashboard/client"); return; }

    const [
      { data: leads },
      { data: pipeline },
      { data: reservas },
      { data: dominios },
      { data: conversaciones },
      { data: automatizaciones },
    ] = await Promise.all([
      supabase.from("leads").select("*").eq("email", (await supabase.auth.getUser()).data.user?.email ?? ""),
      supabase.from("crm_pipeline").select("*").eq("user_id", user.id),
      supabase.from("reservas").select("*").eq("user_id", user.id),
      supabase.from("domains").select("*").eq("user_id", user.id),
      supabase.from("ai_conversations").select("*"),
      supabase.from("automations").select("*").eq("user_id", user.id),
    ]);

    const pipelineMap: Record<number, string> = {};
    (pipeline ?? []).forEach((p: any) => { pipelineMap[p.lead_id] = p.columna; });

    const leadsConEstado = (leads ?? []).map((l: any) => ({ ...l, columna: pipelineMap[l.id] ?? "nuevo" }));

    setStats({
      leads: {
        total: leadsConEstado.length,
        nuevos: leadsConEstado.filter(l => l.columna === "nuevo").length,
        contactados: leadsConEstado.filter(l => l.columna === "contactado").length,
        ganados: leadsConEstado.filter(l => l.columna === "ganado").length,
        perdidos: leadsConEstado.filter(l => l.columna === "perdido").length,
        negociacion: leadsConEstado.filter(l => l.columna === "negociacion").length,
      },
      reservas: {
        total: (reservas ?? []).length,
        pendientes: (reservas ?? []).filter((r: any) => r.estado === "pendiente").length,
        confirmadas: (reservas ?? []).filter((r: any) => r.estado === "confirmada").length,
        completadas: (reservas ?? []).filter((r: any) => r.estado === "completada").length,
        canceladas: (reservas ?? []).filter((r: any) => r.estado === "cancelada").length,
      },
      dominios: {
        total: (dominios ?? []).length,
        activos: (dominios ?? []).filter((d: any) => d.status === "active").length,
        pendientes: (dominios ?? []).filter((d: any) => d.status === "pending").length,
        error: (dominios ?? []).filter((d: any) => d.status === "dns_error").length,
      },
      conversaciones: {
        total: (conversaciones ?? []).length,
        leads_generados: (conversaciones ?? []).filter((c: any) => c.lead_capturado).length,
      },
      automatizaciones: {
        total: (automatizaciones ?? []).length,
        activas: (automatizaciones ?? []).filter((a: any) => a.activa).length,
      },
    });

    setLastUpdate(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [loadStats]);

  const conversion = stats.leads.total > 0 ? ((stats.leads.ganados / stats.leads.total) * 100).toFixed(1) : "0.0";

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111", margin: 0 }}>Estadisticas</h1>
            <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Metricas en tiempo real de tu negocio.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, color: "#aaa" }}>Actualizado: {lastUpdate.toLocaleTimeString("es-CO")}</span>
            <button onClick={loadStats} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Actualizar</button>
          </div>
        </div>

        {/* TARJETAS PRINCIPALES */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: "1.5rem" }}>
          <Card label="Leads Totales" value={stats.leads.total} color="#7c3aed" sub="Todos los contactos" />
          <Card label="Clientes Ganados" value={stats.leads.ganados} color="#10b981" sub="Pipeline ganado" />
          <Card label="Tasa Conversion" value={`${conversion}%`} color="#3b82f6" sub="Leads a clientes" />
          <Card label="Reservas Totales" value={stats.reservas.total} color="#f59e0b" sub="Todas las reservas" />
          <Card label="Dominios Activos" value={stats.dominios.activos} color="#6366f1" sub="Dominios conectados" />
          <Card label="Conversaciones IA" value={stats.conversaciones.total} color="#ec4899" sub="Agente IA" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>

          {/* LEADS */}
          <div style={{ background: "#fff", borderRadius: 14, padding: "1.25rem", border: "1px solid #f0f0f0" }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "#111", marginBottom: 16 }}>Pipeline de Leads</h2>
            <MiniBar label="Nuevos" value={stats.leads.nuevos} max={stats.leads.total} color="#6366f1" />
            <MiniBar label="Contactados" value={stats.leads.contactados} max={stats.leads.total} color="#3b82f6" />
            <MiniBar label="Negociacion" value={stats.leads.negociacion} max={stats.leads.total} color="#f97316" />
            <MiniBar label="Ganados" value={stats.leads.ganados} max={stats.leads.total} color="#10b981" />
            <MiniBar label="Perdidos" value={stats.leads.perdidos} max={stats.leads.total} color="#ef4444" />
          </div>

          {/* RESERVAS */}
          <div style={{ background: "#fff", borderRadius: 14, padding: "1.25rem", border: "1px solid #f0f0f0" }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "#111", marginBottom: 16 }}>Estado Reservas</h2>
            <MiniBar label="Pendientes" value={stats.reservas.pendientes} max={stats.reservas.total} color="#f59e0b" />
            <MiniBar label="Confirmadas" value={stats.reservas.confirmadas} max={stats.reservas.total} color="#3b82f6" />
            <MiniBar label="Completadas" value={stats.reservas.completadas} max={stats.reservas.total} color="#10b981" />
            <MiniBar label="Canceladas" value={stats.reservas.canceladas} max={stats.reservas.total} color="#ef4444" />
          </div>

          {/* DOMINIOS */}
          <div style={{ background: "#fff", borderRadius: 14, padding: "1.25rem", border: "1px solid #f0f0f0" }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "#111", marginBottom: 16 }}>Dominios</h2>
            <MiniBar label="Activos" value={stats.dominios.activos} max={stats.dominios.total || 1} color="#10b981" />
            <MiniBar label="Pendientes" value={stats.dominios.pendientes} max={stats.dominios.total || 1} color="#f59e0b" />
            <MiniBar label="Error DNS" value={stats.dominios.error} max={stats.dominios.total || 1} color="#ef4444" />
            <div style={{ marginTop: 12, padding: "10px", background: "#f8f9fa", borderRadius: 8 }}>
              <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Total dominios: <strong style={{ color: "#111" }}>{stats.dominios.total} / 3</strong></p>
            </div>
          </div>

          {/* AGENTE IA */}
          <div style={{ background: "#fff", borderRadius: 14, padding: "1.25rem", border: "1px solid #f0f0f0" }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "#111", marginBottom: 16 }}>Agente IA</h2>
            <MiniBar label="Conversaciones" value={stats.conversaciones.total} max={stats.conversaciones.total || 1} color="#ec4899" />
            <MiniBar label="Leads generados" value={stats.conversaciones.leads_generados} max={stats.conversaciones.total || 1} color="#7c3aed" />
            <div style={{ marginTop: 12, padding: "10px", background: "#f8f9fa", borderRadius: 8 }}>
              <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Tasa captura IA: <strong style={{ color: "#7c3aed" }}>{stats.conversaciones.total > 0 ? ((stats.conversaciones.leads_generados / stats.conversaciones.total) * 100).toFixed(1) : 0}%</strong></p>
            </div>
          </div>

          {/* AUTOMATIZACIONES */}
          <div style={{ background: "#fff", borderRadius: 14, padding: "1.25rem", border: "1px solid #f0f0f0" }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "#111", marginBottom: 16 }}>Automatizaciones</h2>
            <MiniBar label="Activas" value={stats.automatizaciones.activas} max={stats.automatizaciones.total || 1} color="#10b981" />
            <MiniBar label="Total configuradas" value={stats.automatizaciones.total} max={stats.automatizaciones.total || 1} color="#6366f1" />
            <div style={{ marginTop: 12, padding: "10px", background: "#f8f9fa", borderRadius: 8 }}>
              <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Automatizaciones activas: <strong style={{ color: "#10b981" }}>{stats.automatizaciones.activas}</strong></p>
            </div>
          </div>

          {/* RESUMEN EJECUTIVO */}
          <div style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", borderRadius: 14, padding: "1.25rem" }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 16 }}>Resumen Ejecutivo</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Leads", value: stats.leads.total, color: "#a78bfa" },
                { label: "Ganados", value: stats.leads.ganados, color: "#34d399" },
                { label: "Reservas", value: stats.reservas.total, color: "#fbbf24" },
                { label: "Conversion", value: `${conversion}%`, color: "#60a5fa" },
              ].map(item => (
                <div key={item.label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 12px" }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: item.color, margin: 0 }}>{item.value}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: 0, marginTop: 2 }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
