type Props = {
  c: any;
  pr: string;
  ci: any;
  imagenes: string[];
  ParallaxImage: any;
};

export default function ServiciosCards({ c, pr, ci, imagenes, ParallaxImage }: Props) {
  if (!c?.servicios) return null;
  return (
    <section id="servicios" className="bg-l">
      <div className="wrap">
        <p className="label">Servicios</p>
        <h2 className="st">Lo que ofrecemos</h2>
        {(ci.servicios || imagenes[2]) && (
          <ParallaxImage
            src={ci.servicios || imagenes[2]}
            alt="servicios"
            style={{ width: "100%", height: 320, borderRadius: 20, marginBottom: "2rem", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}
          />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {c.servicios.map((s: any, i: number) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                background: "#fff",
                borderRadius: 16,
                padding: "1.5rem 2rem",
                border: "1px solid #f0f0f0",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: `${pr}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={pr} strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: 4 }}>{s.titulo}</h3>
                <p style={{ margin: 0 }}>{s.descripcion}</p>
                {s.detalle && <div className="srv-detalle">{s.detalle}</div>}
              </div>
              {s.precio_desde && (
                <div style={{ flexShrink: 0, fontWeight: 700, color: pr, whiteSpace: "nowrap" }}>
                  Desde: {s.precio_desde}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
