"use client";
import React from "react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const PLAN_ACCESO: Record<string, string[]> = {
  trial:       ["/dashboard/client", "/dashboard/client/builder", "/dashboard/client/sitio", "/dashboard/client/leads", "/dashboard/client/reservas", "/dashboard/client/crm", "/dashboard/client/agente-ia", "/dashboard/client/facturacion", "/dashboard/client/soporte", "/dashboard/client/suscripcion"],
  basico:      ["/dashboard/client", "/dashboard/client/builder", "/dashboard/client/sitio", "/dashboard/client/facturacion", "/dashboard/client/soporte", "/dashboard/client/suscripcion"],
  profesional: ["/dashboard/client", "/dashboard/client/builder", "/dashboard/client/sitio", "/dashboard/client/galeria", "/dashboard/client/leads", "/dashboard/client/reservas", "/dashboard/client/dominios", "/dashboard/client/facturacion", "/dashboard/client/soporte", "/dashboard/client/suscripcion"],
  empresarial: ["/dashboard/client", "/dashboard/client/builder", "/dashboard/client/sitio", "/dashboard/client/galeria", "/dashboard/client/leads", "/dashboard/client/reservas", "/dashboard/client/dominios", "/dashboard/client/crm", "/dashboard/client/automatizaciones", "/dashboard/client/agente-ia", "/dashboard/client/estadisticas", "/dashboard/client/facturacion", "/dashboard/client/soporte", "/dashboard/client/suscripcion"],
};

const icons: Record<string, React.ReactElement> = {
  home:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  builder:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  sitio:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  galeria:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  dominio:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  leads:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  reservas: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  crm:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  agente:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  auto:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  stats:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  factura:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  suscrip:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  ayuda:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 2-3 4"/><line x1="12" y1="17" x2="12" y2="17"/></svg>,
  soporte:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
};





const MENU_EMPRESARIAL: any[] = [
  { href: "/dashboard/client", label: "Inicio", icon: "home" },
  { section: "Mi Sitio Web" },
  { href: "/dashboard/client/builder", label: "Crear Mi Sitio", icon: "builder" },
  { href: "/dashboard/client/sitio", label: "Mi Sitio Web", icon: "sitio" },
  { href: "/dashboard/client/galeria", label: "Galeria", icon: "galeria" },
  { href: "/dashboard/client/dominios", label: "Dominios", icon: "dominio" },
  { section: "Clientes y Ventas" },
  { href: "/dashboard/client/leads", label: "Leads", icon: "leads" },
  { href: "/dashboard/client/reservas", label: "Reservas", icon: "reservas" },
  { href: "/dashboard/client/crm", label: "CRM Pipeline", icon: "crm" },
  { section: "Inteligencia Artificial" },
  { href: "/dashboard/client/agente-ia", label: "Agente IA", icon: "agente" },
  { href: "/dashboard/client/automatizaciones", label: "Automatizaciones", icon: "auto" },
  { section: "Analitica" },
  { href: "/dashboard/client/estadisticas", label: "Estadisticas", icon: "stats" },
  { section: "Cuenta" },
  { href: "/dashboard/client/facturacion", label: "Facturacion", icon: "factura" },
  { href: "/dashboard/client/suscripcion", label: "Mi Suscripcion", icon: "suscrip" },
  { href: "/dashboard/client/soporte", label: "Soporte", icon: "soporte" },
  { href: "/dashboard/client/centro-ayuda", label: "Centro de Ayuda", icon: "ayuda" },
];

export default function ClientSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [plan, setPlan] = useState<string>("");
  const [rutasPermitidas, setRutasPermitidas] = useState<string[]>(["/dashboard/client", "/dashboard/client/suscripcion"]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");
  const fontSizeMap = { sm: 11, md: 13, lg: 15 };
  const fs = fontSizeMap[fontSize];

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      const { data: sub } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      setProfile(prof);
      const planActivo = sub?.status === "active" ? sub.plan : sub?.status === "trial" ? "trial" : null;
      setPlan(planActivo ?? "");
      setRutasPermitidas(planActivo ? PLAN_ACCESO[planActivo] ?? [] : ["/dashboard/client", "/dashboard/client/suscripcion"]);
    }
    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  const menuItems = MENU_EMPRESARIAL;

  const SidebarContent = () => (
    <>
      <nav style={{ flex: 1, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 1, overflowY: "auto" }}>
        {menuItems.map((item: any, idx: number) => {
          if (item.section) {
            return (
              <p key={idx} style={{ fontSize: 9, fontWeight: 800, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: 2, padding: "14px 12px 4px", margin: 0 }}>{item.section}</p>
            );
          }
          const permitido = rutasPermitidas.includes(item.href) || item.href === "/dashboard/client/centro-ayuda";
          const activo = pathname === item.href;
          if (permitido) {
            return (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, textDecoration: "none", fontSize: fs, fontWeight: activo ? 700 : 500, color: activo ? "#7c3aed" : "#555", background: activo ? "rgba(124,58,237,0.08)" : "transparent", borderLeft: activo ? "3px solid #7c3aed" : "3px solid transparent" }}>
                <span style={{ color: activo ? "#7c3aed" : "#888", flexShrink: 0 }}>{icons[item.icon]}</span>
                {item.label}
              </Link>
            );
          }
          return (
            <div key={item.href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: 10, color: "#ccc", fontSize: fs, fontWeight: 500, cursor: "not-allowed" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#ddd", flexShrink: 0 }}>{icons[item.icon]}</span>
                <span>{item.label}</span>
              </div>
              <span style={{ fontSize: 10, background: "#f3f4f6", color: "#aaa", padding: "2px 7px", borderRadius: 6, fontWeight: 700 }}>PRO</span>
            </div>
          );
        })}
      </nav>
      <div style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 6, borderTop: "1px solid #f0f0f0" }}>
        <span style={{ fontSize: 11, color: "#999", marginRight: 4 }}>Texto:</span>
        {(["sm","md","lg"] as const).map(s => (
          <button key={s} onClick={() => setFontSize(s)} style={{ padding: "3px 9px", borderRadius: 8, border: "1px solid", borderColor: fontSize===s ? "#7c3aed" : "rgba(124,58,237,0.2)", background: fontSize===s ? "rgba(124,58,237,0.12)" : "transparent", color: fontSize===s ? "#7c3aed" : "#888", cursor: "pointer", fontSize: s==="sm" ? 10 : s==="md" ? 13 : 16, fontWeight: fontSize===s ? 700 : 400 }}>A</button>
        ))}
      </div>
      <div style={{ padding: "12px 16px", borderTop: "1px solid #f0f0f0" }}>
        {plan && (
          <div style={{ background: "rgba(124,58,237,0.08)", borderRadius: 8, padding: "5px 10px", marginBottom: 10, textAlign: "center" }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: "#7c3aed", textTransform: "uppercase" as const, letterSpacing: 1, margin: 0 }}>Plan {plan}</p>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
            {profile?.name?.[0]?.toUpperCase() ?? "C"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#111", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{profile?.name ?? "Cliente"}</p>
            <p style={{ fontSize: 11, color: "#999", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{profile?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, textAlign: "left", fontSize: 13, color: "#ef4444", cursor: "pointer", padding: "9px 0", fontWeight: 700 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Cerrar sesion
        </button>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        .sidebar-desktop { display: flex; }
        .sidebar-mobile-header { display: none; }
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .sidebar-mobile-header { display: flex !important; }
        }
      `}</style>

      <aside className="sidebar-desktop" style={{ width: 240, background: "#fff", borderRight: "1px solid #e5e7eb", minHeight: "100vh", position: "sticky", top: 0, flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid #f0f0f0" }}>
          <Link href="/dashboard/client"><Image src="/logo-dms.png" alt="DMS" width={110} height={34} /></Link>
        </div>
        <SidebarContent />
      </aside>

      <header className="sidebar-mobile-header" style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "12px 16px", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 40, width: "100%" }}>
        <Link href="/dashboard/client"><Image src="/logo-dms.png" alt="DMS" width={100} height={32} /></Link>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
        </button>
      </header>

      {menuOpen && (
        <div style={{ background: "#fff", flexDirection: "column", zIndex: 39, position: "fixed", top: 57, left: 0, right: 0, bottom: 0, overflowY: "auto", display: "flex" }}>
          <SidebarContent />
        </div>
      )}
    </>
  );
}




