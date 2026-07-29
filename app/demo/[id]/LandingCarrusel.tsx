"use client";
import { useState, useEffect } from "react";

export default function LandingCarrusel({ imagenes }: { imagenes: string[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (imagenes.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % imagenes.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [imagenes.length]);

  if (!imagenes || imagenes.length === 0) return null;

  return (
    <div style={{ position: "relative", width: "100%", height: 420, overflow: "hidden", background: "#f3f4f6" }}>
      {imagenes.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`slide-${i}`}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: i === current ? 1 : 0,
            transition: "opacity 0.8s ease-in-out",
          }}
        />
      ))}
      {imagenes.length > 1 && (
        <div style={{ position: "absolute", bottom: 16, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 8 }}>
          {imagenes.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? 24 : 8,
                height: 8,
                borderRadius: 999,
                border: "none",
                background: i === current ? "#fff" : "rgba(255,255,255,0.5)",
                cursor: "pointer",
                transition: "width 0.3s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}