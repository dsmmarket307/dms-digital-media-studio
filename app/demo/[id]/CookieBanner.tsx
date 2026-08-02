"use client";
import { useState, useEffect } from "react";

export default function CookieBanner({ texto, linkPolitica, primaryColor }: { texto: string; linkPolitica?: string; primaryColor: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const aceptado = localStorage.getItem("cookies_aceptadas");
    if (!aceptado) setVisible(true);
  }, []);

  function aceptar() {
    localStorage.setItem("cookies_aceptadas", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000, background: "#111", color: "#fff", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap", fontSize: 13 }}>
      <p style={{ margin: 0, maxWidth: 700, lineHeight: 1.5 }}>
        {texto}
        {linkPolitica && (
          <>
            {" "}
            <a href={linkPolitica} target="_blank" rel="noopener noreferrer" style={{ color: "#fff", textDecoration: "underline" }}>
              Ver politica de cookies
            </a>
          </>
        )}
      </p>
      <button onClick={aceptar} style={{ background: primaryColor, color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
        Acepto
      </button>
    </div>
  );
}