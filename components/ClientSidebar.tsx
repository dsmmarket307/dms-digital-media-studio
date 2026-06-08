"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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

export default function ClientSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [rutasPermitidas, setRutasPermitidas] = useState<string[]>(["/dashboard/client", "/dashboard/client/suscripcion"]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      const { data: sub } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      setProfile(prof);
      const planActivo = sub?.status === "active" ? sub.plan : null;
      setRutasPermitidas(planActivo ? PLAN_ACCESO[planActivo] ?? [] : ["/dashboard/client", "/dashboard/client/suscripcion"]);
    }
    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  const SidebarContent = () => (
    <>
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {MENU.map(item => {
          const permitido = rutasPermitidas.includes(item.href);
          const activo = pathname === item.href;
          if (permitido) {
            return (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderRadius: 10, textDecoration: "none", fontSize: 13, fontWeight: activo ? 700 : 500, color: activo ? "#7c3aed" : "#555", background: activo ? "rgba(124,58,237,0.08)" : "transparent", borderLeft: activo ? "3px solid #7c3aed" : "3px solid transparent" }}>
                {item.label}
              </Link>
            );
          }
          return (
            <div key={item.href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderRadius: 10, color: "#ccc", fontSize: 13, fontWeight: 500, cursor: "not-allowed" }}>
              <span>{item.label}</span>
              <span style={{ fontSize: 10, background: "#f3f4f6", color: "#aaa", padding: "2px 7px", borderRadius: 6, fontWeight: 700 }}>PRO</span>
            </div>
          );
        })}
      </nav>
      <div style={{ padding: "12px 16px", borderTop: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
            {profile?.name?.[0]?.toUpperCase() ?? "C"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#111", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile?.name ?? "Cliente"}</p>
            <p style={{ fontSize: 11, color: "#999", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{ width: "100%", background: "none", border: "none", textAlign: "left", fontSize: 13, color: "#ef4444", cursor: "pointer", padding: "6px 0", fontWeight: 600 }}>Cerrar sesion</button>
      </div>
    </>
  );

  return (
    <>
      {/* DESKTOP */}
      <aside style={{ width: 240, background: "#fff", borderRight: "1px solid #e5e7eb", minHeight: "100vh", position: "sticky", top: 0, display: "flex", flexDirection: "column", flexShrink: 0 }} className="hidden md:flex">
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid #f0f0f0" }}>
          <Link href="/dashboard/client"><Image src="/logo-dms.png" alt="DMS" width={110} height={34} /></Link>
        </div>
        <SidebarContent />
      </aside>

      {/* MOBILE HEADER */}
      <header style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "12px 16px", display: "none", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 40 }} className="flex md:hidden">
        <Link href="/dashboard/client"><Image src="/logo-dms.png" alt="DMS" width={100} height={32} /></Link>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
        </button>
      </header>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", display: "flex", flexDirection: "column", zIndex: 39 }} className="flex md:hidden">
          <SidebarContent />
        </div>
      )}
    </>
  );
}

