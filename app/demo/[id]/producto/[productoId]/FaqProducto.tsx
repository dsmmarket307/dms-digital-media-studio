"use client";
import { useState } from "react";

interface FaqProductoProps {
  faq: { pregunta: string; respuesta: string }[];
  primaryColor: string;
}

export default function FaqProducto({ faq, primaryColor }: FaqProductoProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faq || faq.length === 0) return null;

  return (
    <div style={{ marginTop: "2rem" }}>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111", marginBottom: "1rem", textAlign: "center" }}>Preguntas frecuentes</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {faq.map((item, i) => (
          <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
            <button onClick={() => setOpenIndex(openIndex === i ? null : i)} style={{ width: "100%", padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", background: openIndex === i ? `${primaryColor}08` : "#fff", border: "none", cursor: "pointer", textAlign: "left" }}>
              <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#111" }}>{item.pregunta}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2" style={{ transform: openIndex === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {openIndex === i && (
              <div style={{ padding: "0 1.25rem 1rem", background: "#fff" }}>
                <p style={{ fontSize: "0.9rem", color: "#555", lineHeight: 1.7, margin: 0 }}>{item.respuesta}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}