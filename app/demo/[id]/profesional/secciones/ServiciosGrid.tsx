type Props = {
  c: any;
  pr: string;
  ci: any;
  imagenes: string[];
  ParallaxImage: any;
};

export default function ServiciosGrid({ c, pr, ci, imagenes, ParallaxImage }: Props) {
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
        <div className="g4">
          {c.servicios.map((s: any, i: number) => (
            <div key={i} className="srv-card">
              <div className="srv-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={pr} strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                </svg>
              </div>
              <h3>{s.titulo}</h3>
              <p>{s.descripcion}</p>
              {s.detalle && <div className="srv-detalle">{s.detalle}</div>}
              {s.precio_desde && <div className="srv-precio">Desde: {s.precio_desde}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
