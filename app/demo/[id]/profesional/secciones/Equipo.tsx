import React from "react";

export default function Equipo({ c, pr }: { c: any; pr: string }) {
  const miembros: any[] = c?.equipo?.miembros ?? [];
  if (miembros.length === 0) return null;
  const iniciales = (n: string) =>
    (n || "").trim().split(/\s+/).slice(0, 2).map((p) => (p[0] ? p[0].toUpperCase() : "")).join("");
  return (
    <section id="equipo">
      <div className="wrap">
        <p className="label">Equipo</p>
        <h2 className="st">{c?.equipo?.titulo ?? "Nuestro Equipo"}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 260px))", justifyContent: "center", gap: "2rem", marginTop: "2rem" }}>
          {miembros.map((m: any, i: number) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ width: "100%", aspectRatio: "4 / 5", borderRadius: 20, overflow: "hidden", background: `${pr}18`, boxShadow: "0 10px 30px rgba(0,0,0,0.10)" }}>
                {m.foto ? (
                  <img src={m.foto} alt={m.nombre} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", fontWeight: 800, color: pr }}>{iniciales(m.nombre)}</div>
                )}
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111", marginTop: "1rem" }}>{m.nombre}</h3>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: pr, marginTop: 4 }}>{m.cargo}</p>
              {m.descripcion ? <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.6, marginTop: 8 }}>{m.descripcion}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}