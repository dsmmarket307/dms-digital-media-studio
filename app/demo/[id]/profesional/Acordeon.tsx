"use client";
import { useState } from "react";

interface AcordeonItem {
  pregunta: string;
  respuesta: string;
}

interface AcordeonProps {
  items: AcordeonItem[];
  titulo?: string;
}

export default function Acordeon({ items, titulo }: AcordeonProps) {
  const [abierto, setAbierto] = useState<number | null>(null);

  function toggle(i: number) {
    setAbierto(abierto === i ? null : i);
  }

  return (
    <div style={{ maxWidth: 700, margin: "32px auto", padding: "0 16px" }}>
      {titulo && (
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, textAlign: "center" }}>
          {titulo}
        </h2>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((item, i) => {
          const abiertoAhora = abierto === i;
          return (
            <div
              key={i}
              style={{
                background: "#ffffff",
                border: "1px solid #ececec",
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: abiertoAhora ? "0 4px 16px rgba(0,0,0,0.06)" : "0 1px 2px rgba(0,0,0,0.02)",
                transition: "box-shadow 300ms ease",
              }}
              onMouseEnter={(e) => { if (!abiertoAhora) e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.05)"; }}
              onMouseLeave={(e) => { if (!abiertoAhora) e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.02)"; }}
            >
              <button
                onClick={() => toggle(i)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "18px 20px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111111",
                }}
              >
                <span>{item.pregunta}</span>
                <span
                  style={{
                    flexShrink: 0,
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 400,
                    color: "#666666",
                  }}
                >
                  {abiertoAhora ? "\u2212" : "+"}
                </span>
              </button>
              <div
                style={{
                  display: "grid",
                  gridTemplateRows: abiertoAhora ? "1fr" : "0fr",
                  transition: "grid-template-rows 300ms ease",
                }}
              >
                <div style={{ overflow: "hidden" }}>
                  <div
                    style={{
                      padding: "0 20px 18px 20px",
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: "#555555",
                    }}
                  >
                    {item.respuesta}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
