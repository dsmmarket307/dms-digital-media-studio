"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClient();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  const MENU = [
    { href: "/dashboard/admin", label: "Inicio" },
    { href: "/dashboard/admin/suscripciones", label: "Suscripciones" },
    { href: "/dashboard/admin/dominios", label: "Dominios" },
    { href: "/dashboard/admin/leads", label: "Leads" },
    { href: "/dashboard/admin/crm", label: "CRM" },
    { href: "/dashboard/admin/soporte", label: "Soporte" },
    { href: "/dashboard/admin/finanzas", label: "Finanzas" },
    { href: "/dashboard/admin/marketing", label: "Marketing" },
    { href: "/dashboard/admin/inteligencia", label: "Inteligencia" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <style>{`
        .admin-header { display: none; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fff; border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; z-index: 50; }
        .admin-mobile-menu { position: fixed; top: 57px; left: 0; right: 0; bottom: 0; background: #fff; z-index: 49; overflow-y: auto; display: none; flex-direction: column; padding: 12px; }
        @media (max-width: 768px) {
          .admin-header { display: flex !important; }
          .admin-mobile-menu-open { display: flex !important; }
        }
      `}</style>

      <header className="admin-header">
        <Link href="/dashboard/admin">
          <Image src="/logo-dms.png" alt="DMS" width={90} height={28} />
        </Link>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          {menuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
        </button>
      </header>

      <div className={`admin-mobile-menu ${menuOpen ? "admin-mobile-menu-open" : ""}`}>
        {MENU.map(item => (
          <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{ padding: "12px 16px", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 600, color: "#111", borderBottom: "1px solid #f0f0f0", display: "block" }}>
            {item.label}
          </Link>
        ))}
        <button onClick={handleLogout} style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: "#ef4444", background: "none", border: "none", textAlign: "left", cursor: "pointer", marginTop: 8 }}>Cerrar sesion</button>
      </div>

      {children}
    </div>
  );
}
