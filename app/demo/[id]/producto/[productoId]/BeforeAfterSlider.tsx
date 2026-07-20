"use client";
import { useState, useRef, useCallback } from "react";

interface BeforeAfterSliderProps {
  antesUrl: string;
  despuesUrl: string;
  antesLabel?: string;
  despuesLabel?: string;
  primaryColor?: string;
}

export default function BeforeAfterSlider({
  antesUrl,
  despuesUrl,
  antesLabel = "ANTES",
  despuesLabel = "DESPUES",
  primaryColor = "#7c3aed",
}: BeforeAfterSliderProps) {
  const [posicion, setPosicion] = useState(50);
  const [arrastrando, setArrastrando] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const actualizarPosicion = useCallback((clientX: number) => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;
    const rect = contenedor.getBoundingClientRect();
    let porcentaje = ((clientX - rect.left) / rect.width) * 100;
    porcentaje = Math.max(0, Math.min(100, porcentaje));
    setPosicion(porcentaje);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setArrastrando(true);
    actualizarPosicion(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!arrastrando) return;
    actualizarPosicion(e.clientX);
  };
  const handlePointerUp = () => setArrastrando(false);

  return (
    <div
      ref={contenedorRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "4 / 3",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
        cursor: "ew-resize",
        userSelect: "none",
        touchAction: "none",
        background: "#eee",
      }}
    >
      <img
        src={despuesUrl}
        alt={despuesLabel}
        draggable={false}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
      />
      <span style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, letterSpacing: 0.5 }}>
        {despuesLabel}
      </span>

      <img
        src={antesUrl}
        alt={antesLabel}
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          clipPath: `inset(0 ${100 - posicion}% 0 0)`,
          transition: arrastrando ? "none" : "clip-path 0.15s ease-out",
          pointerEvents: "none",
        }}
      />
      <span style={{ position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, letterSpacing: 0.5 }}>
        {antesLabel}
      </span>

      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${posicion}%`, width: 3, background: "#fff", transform: "translateX(-50%)", boxShadow: "0 0 8px rgba(0,0,0,0.4)", pointerEvents: "none" }} />

      <div style={{ position: "absolute", top: "50%", left: `${posicion}%`, transform: "translate(-50%, -50%)", width: 44, height: 44, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.3)", pointerEvents: "none" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2.5">
          <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
        </svg>
      </div>
    </div>
  );
}