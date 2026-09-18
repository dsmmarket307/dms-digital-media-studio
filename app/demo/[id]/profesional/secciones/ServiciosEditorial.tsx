type Props = {
  c: any;
  pr: string;
  ci: any;
  imagenes: string[];
  ParallaxImage: any;
};

export default function ServiciosEditorial({ c, pr, ci, imagenes, ParallaxImage }: Props) {
  if (!c?.servicios) return null;
  const imagenServicio = ci.servicios || imagenes[2] || "";
  return (
    <section id="servicios" style={{ padding: "5rem 2rem", background: "#faf7f2" }}>
      <div className="wrap">
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", fontWeight: 400, marginBottom: "0.75rem", color: "#1a1a1a" }}>
          Nuestros servicios
        </h2>
        <p style={{ fontSize: "1rem", color: "#666", maxWidth: 560, marginBottom: "3rem", lineHeight: 1.6 }}>
          {c?.servicios_intro ?? "Cada servicio esta pensado para acompanarte desde la asesoria hasta el resultado final."}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
          {c.servicios.map((s: any, i: number) => (
            <div key={i} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ position: "relative", marginBottom: "1.25rem" }}>
                {imagenServicio ? (
                  <img
                    src={imagenServicio}
                    alt={s.titulo}
                    style={{ width: "100%", height: 260, objectFit: "cover", borderRadius: 4 }}
                  />
                ) : (
                  <div style={{ width: "100%", height: 260, background: "#e8dfd0", borderRadius: 4 }} />
                )}
                <span
                  style={{
                    position: "absolute",
                    bottom: 14,
                    left: 14,
                    background: "rgba(255,255,255,0.9)",
                    color: "#333",
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "5px 12px",
                    borderRadius: 999,
                  }}
                >
                  Servicio
                </span>
              </div>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.25rem", fontWeight: 400, marginBottom: 8, color: "#1a1a1a" }}>
                {s.titulo}
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#666", lineHeight: 1.6, marginBottom: 14 }}>
                {s.descripcion}
              </p>
              {s.detalle && <div className="srv-detalle">{s.detalle}</div>}
              <a
                href="#contacto"
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#1a1a1a",
                  textDecoration: "none",
                  borderBottom: `1.5px solid ${pr}`,
                  paddingBottom: 2,
                  alignSelf: "flex-start",
                }}
              >
                Consultar servicio &rarr;
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

