"use client";
import { useState } from "react";

interface NavbarProductoProps {
  id: string;
  logoUrl?: string;
  primaryColor: string;
}

export default function NavbarProducto({ id, logoUrl, primaryColor }: NavbarProductoProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        .nav-producto { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; margin-bottom: 1.5rem; border-bottom: 1px solid #f0f0f0; position: relative; }
        .nav-producto-logo { position: absolute; left: 50%; transform: translateX(-50%); }
        .nav-producto-links { display: flex; gap: 2rem; align-items: center; }
        .nav-producto-overlay { display: none; }
        @media(max-width:768px){
          .nav-producto-links { display: none; }
          .nav-producto-overlay.open { display: flex; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.96); z-index: 999; flex-direction: column; align-items: center; justify-content: center; gap: 2.5rem; }
          .nav-producto-overlay.open a { font-size: 1.5rem; color: #fff; text-decoration: none; font-weight: 700; }
        }
        @media(min-width:769px){
          .hamburger-nav { display: none !important; }
        }
      `}</style>

      <div className="nav-producto">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button className="hamburger-nav" onClick={() => setMenuOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="nav-producto-links">
            <a href={`/demo/${id}`} style={{ color: "#111", textDecoration: "none", fontWeight: 700, fontSize: "0.875rem" }}>INICIO</a>
            <a href={`/demo/${id}#productos`} style={{ color: "#555", textDecoration: "none", fontWeight: 500, fontSize: "0.875rem" }}>CATALOGO</a>
            <a href={`/demo/${id}#contacto`} style={{ color: "#555", textDecoration: "none", fontWeight: 500, fontSize: "0.875rem" }}>CONTACTO</a>
          </div>
        </div>

        <div className="nav-producto-logo">
          {logoUrl && <img src={logoUrl} alt="logo" style={{ height: 75, objectFit: "contain" }} />}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href={`/demo/${id}#productos`} style={{ display: "flex", color: "#111" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </a>
          <a href={`/demo/${id}`} style={{ display: "flex", color: "#111" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </a>
        </div>
      </div>

      <div className={`nav-producto-overlay${menuOpen ? " open" : ""}`}>
        <button onClick={() => setMenuOpen(false)} style={{ position: "fixed", top: 20, right: 20, background: "none", border: "none", cursor: "pointer" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <a href={`/demo/${id}`} onClick={() => setMenuOpen(false)}>INICIO</a>
        <a href={`/demo/${id}#productos`} onClick={() => setMenuOpen(false)}>CATALOGO</a>
        <a href={`/demo/${id}#contacto`} onClick={() => setMenuOpen(false)}>CONTACTO</a>
      </div>
    </>
  );
}