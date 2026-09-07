"use client";
import { useRef, useEffect } from "react";

type Props = {
  id: string;
  productos: any[];
  primaryColor: string;
  isCustomDomain?: boolean;
};

export default function CarruselDestacados({ id, productos, primaryColor, isCustomDomain }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const interval = setInterval(() => {
      if (pausedRef.current) return;
      const cardWidth = track.querySelector("a")?.clientWidth ?? 260;
      const gap = 16;
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft >= maxScroll - 5) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        track.scrollBy({ left: cardWidth + gap, behavior: "smooth" });
      }
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  function scrollByCard(dir: number) {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.querySelector("a")?.clientWidth ?? 260;
    track.scrollBy({ left: dir * (cardWidth + 16), behavior: "smooth" });
  }

  if (!productos.length) return null;

  return (
    <section style={{ padding: "3rem 2rem", background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
        <p style={{ fontSize: "0.8rem", fontWeight: 700, color: primaryColor, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>Destacados</p>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#111", marginBottom: "1.5rem" }}>Lo mas vendido</h2>

        <button
          onClick={() => scrollByCard(-1)}
          aria-label="Anterior"
          style={{ position: "absolute", left: -8, top: "60%", transform: "translateY(-50%)", zIndex: 5, width: 38, height: 38, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >&#8249;</button>
        <button
          onClick={() => scrollByCard(1)}
          aria-label="Siguiente"
          style={{ position: "absolute", right: -8, top: "60%", transform: "translateY(-50%)", zIndex: 5, width: 38, height: 38, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >&#8250;</button>

        <div
          ref={trackRef}
          onMouseEnter={() => (pausedRef.current = true)}
          onMouseLeave={() => (pausedRef.current = false)}
          onTouchStart={() => (pausedRef.current = true)}
          onTouchEnd={() => (pausedRef.current = false)}
          style={{ display: "flex", gap: 16, overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none", paddingBottom: 4 }}
        >
          {productos.map((p: any, i: number) => {
            const href = isCustomDomain ? `/producto/${p.indiceOriginal}` : `/demo/${id}/producto/${p.indiceOriginal}`;
            return (
              <a
                key={i}
                href={href}
                style={{ flex: "0 0 240px", scrollSnapAlign: "start", textDecoration: "none", color: "inherit", display: "block", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0" }}
              >
                {p.imagenes?.length > 0 ? (
                  <img src={p.imagenes[0]} alt={p.nombre} style={{ width: "100%", height: 220, objectFit: "contain", background: "#fff" }} />
                ) : (
                  <div style={{ width: "100%", height: 220, background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  </div>
                )}
                <div style={{ padding: "1rem" }}>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#111", marginBottom: "0.4rem" }}>{p.nombre}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <p style={{ fontSize: "1.05rem", fontWeight: 800, color: "#111" }}>{p.precio}</p>
                    {p.precio_anterior && <p style={{ fontSize: "0.8rem", color: "#aaa", textDecoration: "line-through" }}>{p.precio_anterior}</p>}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}