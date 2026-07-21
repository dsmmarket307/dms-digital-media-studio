"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

function Icon({ type }: { type: string }) {
  const s = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none" as const, stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
  const icons: any = {
    home:        <svg {...s}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    crm:         <svg {...s}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    ai:          <svg {...s}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
    marketing:   <svg {...s}><path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"/></svg>,
    finanzas:    <svg {...s}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    soporte:     <svg {...s}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 0 2 2z"/></svg>,
    prospeccion: <svg {...s}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    inteligencia:<svg {...s}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    aibuilder:   <svg {...s}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>,
    logout:      <svg {...s}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    pedidos:     <svg {...s}><path d="M5 8h14M5 8a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v0a2 2 0 01-2 2M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8"/></svg>,
    ayuda:       <svg {...s}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    metapixel:   <svg {...s}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  }
  return icons[type] ?? icons.home
}

const navItems = [
  { href: "/dashboard/admin",              label: "Inicio",              icon: "home"         },
  { href: "/dashboard/admin/crm",          label: "CRM",                 icon: "crm"          },
  { href: "/dashboard/admin/ai-builder",   label: "AI Builder",          icon: "aibuilder"    },
  { href: "/dashboard/admin/prospeccion",  label: "Prospeccion IA",      icon: "prospeccion"  },
  { href: "/dashboard/admin/dominios", label: "Dominios", icon: "soporte" },
  { href: "/dashboard/admin/soporte",      label: "Soporte",             icon: "soporte"      },
  { href: "/dashboard/admin/marketing",    label: "Marketing IA",        icon: "marketing"    },
  { href: "/dashboard/admin/finanzas",     label: "Finanzas",            icon: "finanzas"     },
  { href: "/dashboard/admin/inteligencia", label: "Centro Inteligencia", icon: "inteligencia" },
  { href: "/dashboard/admin/page-builder", label: "Page Builder", icon: "aibuilder" },
  { href: "/dashboard/admin/pedidos", label: "Pedidos", icon: "pedidos" },
  { href: "/dashboard/admin/meta", label: "Meta Pixel", icon: "metapixel" },
]

export default function DashboardNav({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false)
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md")
  const pathname = usePathname()
  if (pathname.includes("page-builder")) return null
  const router = useRouter()
  const supabase = createClient()

  const fontSizeMap = { sm: 12, md: 13.5, lg: 15.5 }
  const fs = fontSizeMap[fontSize]
  const initials = name?.charAt(0)?.toUpperCase() ?? "U"

  const UserBlock = () => (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 16px", background:"rgba(124,58,237,0.08)", borderRadius:12, border:"1px solid rgba(124,58,237,0.15)" }}>
      <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:16, color:"#fff", flexShrink:0 }}>{initials}</div>
      <div style={{ overflow:"hidden" }}>
        <p style={{ color:"#111", fontWeight:600, fontSize:13, margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontFamily:"Poppins,sans-serif" }}>{name || email}</p>
        <span style={{ fontSize:11, color:"#7c3aed", background:"rgba(124,58,237,0.12)", padding:"1px 8px", borderRadius:999, display:"inline-block", marginTop:2, fontFamily:"Poppins,sans-serif" }}>Administrador</span>
      </div>
    </div>
  )

  const FontSizeControl = () => (
    <div style={{ padding:"8px 14px", display:"flex", alignItems:"center", gap:6 }}>
      <span style={{ fontSize:11, color:"#999", fontFamily:"Poppins,sans-serif", marginRight:4 }}>Texto:</span>
      {(["sm","md","lg"] as const).map(s => (
        <button key={s} onClick={() => setFontSize(s)} style={{ padding:"3px 9px", borderRadius:8, border:"1px solid", borderColor: fontSize===s ? "#7c3aed" : "rgba(124,58,237,0.2)", background: fontSize===s ? "rgba(124,58,237,0.12)" : "transparent", color: fontSize===s ? "#7c3aed" : "#888", cursor:"pointer", fontFamily:"Poppins,sans-serif", fontSize: s==="sm" ? 10 : s==="md" ? 13 : 16, fontWeight: fontSize===s ? 700 : 400 }}>
          A
        </button>
      ))}
    </div>
  )

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {navItems.map(item => {
        const active = pathname === item.href
        return (
          <Link key={item.href} href={item.href} onClick={onClick} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:10, textDecoration:"none", color: active ? "#7c3aed" : "#777", fontSize:fs, fontWeight: active ? 600 : 400, fontFamily:"Poppins,sans-serif", transition:"all .2s", position:"relative", background: active ? "rgba(124,58,237,0.1)" : "transparent", borderLeft: active ? "3px solid #7c3aed" : "3px solid transparent" }}>
            <Icon type={item.icon} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </>
  )

  const LogoutBtn = () => (
    <button onClick={async () => { await supabase.auth.signOut(); router.push("/auth/login") }} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:10, background:"transparent", border:"1px solid rgba(124,58,237,0.2)", color:"#666", fontSize:fs, cursor:"pointer", width:"100%", fontFamily:"Poppins,sans-serif", transition:"all .2s" }}>
      <Icon type="logout" />
      Cerrar sesion
    </button>
  )

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" />

      <style>{`
        .admin-sidebar { display: flex; flex-direction: column; }
        .admin-mobile-header { display: none; }
        @media (max-width: 768px) {
          .admin-sidebar { display: none !important; }
          .admin-mobile-header { display: flex !important; }
        }
      `}</style>
      <aside style={{ width:240, background:"#ffffff", borderRight:"1px solid rgba(124,58,237,0.1)", display:"flex", flexDirection:"column", minHeight:"100vh", position:"sticky", top:0, flexShrink:0 }} className="admin-sidebar">
        <div style={{ padding:"24px 20px 16px", borderBottom:"1px solid rgba(124,58,237,0.08)" }}>
          <img src="/logo-dms.png" alt="DMS Digital Studio" style={{ width:110, objectFit:"contain" }} />
        </div>
        <div style={{ padding:12 }}>
          <UserBlock />
        </div>
        <div style={{ height:1, background:"rgba(124,58,237,0.08)", margin:"6px 14px" }} />
        <nav style={{ flex:1, padding:"6px 10px", display:"flex", flexDirection:"column", gap:2 }}>
          <NavLinks />
        </nav>
        <div style={{ height:1, background:"rgba(124,58,237,0.08)", margin:"6px 14px" }} />
        <FontSizeControl />
        <div style={{ padding:10 }}>
          <LogoutBtn />
        </div>
      </aside>

      <div style={{ position:"fixed", top:0, left:0, right:0, height:56, background:"#ffffff", borderBottom:"1px solid rgba(124,58,237,0.1)", zIndex:100, alignItems:"center", justifyContent:"space-between", padding:"0 16px" }} className="admin-mobile-header">
        <img src="/logo-dms.png" alt="DMS Digital Studio" style={{ height:32, objectFit:"contain" }} />
        <button onClick={() => setOpen(!open)} style={{ background:"rgba(124,58,237,0.1)", border:"1px solid rgba(124,58,237,0.2)", cursor:"pointer", color:"#7c3aed", padding:"6px 14px", borderRadius:8, fontSize:13, fontWeight:600, fontFamily:"Poppins,sans-serif" }}>
          {open ? "X" : "Menu"}
        </button>
      </div>

      {open && (
        <div style={{ position:"fixed", top:56, left:0, right:0, bottom:0, background:"#ffffff", zIndex:99, overflowY:"auto" }} className="flex md:hidden flex-col">
          <div style={{ padding:12, borderBottom:"1px solid rgba(124,58,237,0.08)" }}>
            <UserBlock />
          </div>
          <nav style={{ padding:"6px 10px", display:"flex", flexDirection:"column", gap:4 }}>
            <NavLinks onClick={() => setOpen(false)} />
          </nav>
          <div style={{ padding:10, borderTop:"1px solid rgba(124,58,237,0.08)" }}>
            <LogoutBtn />
          </div>
        </div>
      )}
    </>
  )
}




