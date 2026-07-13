"use client";
import { useState } from "react";
export default function Carrusel({ imagenes, nombre }: { imagenes: string[]; nombre: string }) {
  const [current, setCurrent] = useState(0);

  if (!imagenes || imagenes.length === 0) {
    return (
      <div style={{ background: "#f8f9fa", height: 440, display: "flex", alignItems: "center", justifyContent: "center", color: "#bbb" }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
        </svg>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8f9fa", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 440, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
        <img src={imagenes[current]} alt={nombre} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
      </div>

      {imagenes.length > 1 && (
        <div style={{ display: "flex", gap: 8, padding: "10px 12px", overflowX: "auto", background: "#fff" }}>
          {imagenes.map((img, j) => (
            <button
              key={j}
              onClick={() => setCurrent(j)}
              style={{
                flexShrink: 0,
                width: 64,
                height: 64,
                padding: 0,
                borderRadius: 8,
                border: j === current ? "2px solid #f59e0b" : "2px solid #e5e7eb",
                overflow: "hidden",
                background: "#f8f9fa",
                cursor: "pointer"
              }}
            >
              <img src={img} alt={`${nombre}-${j}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
