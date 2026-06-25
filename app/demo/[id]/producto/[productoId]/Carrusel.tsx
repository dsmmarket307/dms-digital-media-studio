"use client";
import { useState, useRef } from "react";

export default function Carrusel({ imagenes, nombre }: { imagenes: string[]; nombre: string }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const goTo = (index: number) => {
    setCurrent(index);
    ref.current?.children[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  const prev = () => goTo(Math.max(0, current - 1));
  const next = () => goTo(Math.min(imagenes.length - 1, current + 1));

  return (
    <div style={{ position: "relative", background: "#f8f9fa" }}>
      <div ref={ref} style={{ display: "flex", overflowX: "hidden", scrollSnapType: "x mandatory", height: 440 }}>
        {imagenes.map((img, j) => (
          <img key={j} src={img} alt={`${nombre}-${j}`} style={{ minWidth: "100%", flexShrink: 0, height: 440, objectFit: "contain", background: "#f8f9fa", scrollSnapAlign: "start" }} />
        ))}
      </div>

      {imagenes.length > 1 && (
        <>
          <button onClick={prev} disabled={current === 0} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", opacity: current === 0 ? 0.4 : 1 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button onClick={next} disabled={current === imagenes.length - 1} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", opacity: current === imagenes.length - 1 ? 0.4 : 1 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <div style={{ position: "absolute", bottom: 12, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6 }}>
            {imagenes.map((_, j) => (
              <button key={j} onClick={() => goTo(j)} style={{ width: j === current ? 20 : 8, height: 8, borderRadius: 4, background: j === current ? "#111" : "rgba(0,0,0,0.3)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.2s" }} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}