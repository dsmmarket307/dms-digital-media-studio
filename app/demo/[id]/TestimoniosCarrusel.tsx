"use client";
import { useState, useEffect, useRef } from "react";

type Testimonio = { texto: string; nombre?: string; cargo?: string };

export default function TestimoniosCarrusel({ testimonios, accentColor }: { testimonios: Testimonio[]; accentColor?: string }) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!testimonios || testimonios.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % testimonios.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonios?.length]);

  if (!testimonios || testimonios.length === 0) return null;

  function goTo(i: number) {
    setCurrent(((i % testimonios.length) + testimonios.length) % testimonios.length);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff > 50) goTo(current - 1);
    else if (diff < -50) goTo(current + 1);
    touchStartX.current = null;
  }

  const color = accentColor || "#7c3aed";

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", position: "relative" }}>
      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", transition: "transform 0.5s ease", transform: `translateX(-${current * 100}%)` }}>
          {testimonios.map((t, i) => (
            <div key={i} className="test" style={{ minWidth: "100%", boxSizing: "border-box" }}>
              <p>{t.texto}</p>
              <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
                <div className="av" style={{ background: color }}>{t.nombre?.charAt(0)}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: ".9rem" }}>{t.nombre}</div>
                  <div style={{ fontSize: ".8rem", color: "#999" }}>{t.cargo}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {testimonios.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
          {testimonios.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === current ? 22 : 8,
                height: 8,
                borderRadius: 999,
                border: "none",
                background: i === current ? color : "#ddd",
                cursor: "pointer",
                transition: "width 0.3s",
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}