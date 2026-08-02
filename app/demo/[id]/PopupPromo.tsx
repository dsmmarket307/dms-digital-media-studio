"use client";
import { useState, useEffect } from "react";

export default function PopupPromo({ imagen, link }: { imagen?: string; link?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const visto = sessionStorage.getItem("popup_promo_visto");
    if (!visto && imagen) setVisible(true);
  }, [imagen]);

  function cerrar() {
    sessionStorage.setItem("popup_promo_visto", "1");
    setVisible(false);
  }

  if (!visible || !imagen) return null;

  const contenido = (
    <img src={imagen} alt="Promocion" style={{ maxWidth: "100%", maxHeight: "80vh", display: "block", borderRadius: 12 }} />
  );

  return (
    <div onClick={cerrar} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", maxWidth: 480, width: "100%" }}>
        <button onClick={cerrar} style={{ position: "absolute", top: -16, right: -16, width: 36, height: 36, borderRadius: "50%", background: "#111", color: "#fff", border: "none", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
          ✕
        </button>
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer">
            {contenido}
          </a>
        ) : (
          contenido
        )}
      </div>
    </div>
  );
}