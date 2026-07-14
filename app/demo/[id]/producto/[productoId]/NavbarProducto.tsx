"use client";
import { useState } from "react";

interface NavbarProductoProps {
  id: string;
  logoUrl?: string;
  primaryColor: string;
}

export default function NavbarProducto({ id, logoUrl, primaryColor }: NavbarProductoProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pr = primaryColor;

  return (
    <>
      <style>{`
        @media(max-width:768px){
          .nav-links-producto { display: none; }
          .nav-links-producto.open { display: flex; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.95); z-index: 999; flex-direction: column; align-items: center; justify-content: center; gap: 2rem; }
          .nav-links-producto.open a { font-size: 1.5rem; color: #fff !important; }
          .hamburger-btn-producto { display: flex !important; }
        }
        @media(min-width:769px){ .hamburger-btn-producto { display: none !important; } .nav-links-producto { display: flex !important; } }
      `}</style>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", padding: "0.75rem 0", borderBottom: "1px solid #f0f0f0", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href={`/demo/${id}`} style={{ display: "flex", color: "#111" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </a>
          <a href={`/demo/${id}`} style={{ display: "flex", color: "#111" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </a>
        </div>
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
          {logoUrl && <img src={logoUrl} alt="logo" style={{ height: 40, objectFit: "contain" }} />}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div className={`nav-links-producto${menuOpen ? " open" : ""}`} style={{ display: "flex", gap: 20, fontSize: "0.875rem", alignItems: "center" }}>
            {menuOpen && (
              <button onClick={() => setMenuOpen(false)} style={{ position: "fixed", top: 20, right: 20, background: "none", border: "none", cursor: "pointer", zIndex: 1000 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
            <a href={`/demo/${id}`} style={{ color: "#111", textDecoration: "none", fontWeight: 700 }}>INICIO</a>
            <a href={`/demo/${id}#productos`} style={{ color: "#555", textDecoration: "none", fontWeight: 500 }}>CATALOGO</a>
            <a href={`/demo/${id}#contacto`} style={{ color: "#555", textDecoration: "none", fontWeight: 500 }}>CONTACTO</a>
          </div>
          <button className="hamburger-btn-producto" onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "none" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </nav>
    </>
  );
}