"use client";
export default function Carrusel({ imagenes, nombre }: { imagenes: string[]; nombre: string }) {
  if (!imagenes || imagenes.length === 0) {
    return (
      <div style={{ background: "#f8f9fa", height: 440, display: "flex", alignItems: "center", justifyContent: "center", color: "#bbb" }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
        </svg>
      </div>
    );
  }

  if (imagenes.length === 1) {
    return (
      <div style={{ background: "#f8f9fa" }}>
        <img src={imagenes[0]} alt={nombre} style={{ width: "100%", height: 440, objectFit: "contain", background: "#f8f9fa", display: "block" }} />
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, background: "#f8f9fa", padding: 4 }}>
      {imagenes.map((img, j) => (
        <img
          key={j}
          src={img}
          alt={`${nombre}-${j}`}
          style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", background: "#f8f9fa", borderRadius: 8, display: "block" }}
        />
      ))}
    </div>
  );
}
