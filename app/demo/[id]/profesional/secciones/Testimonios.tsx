type Props = {
  c: any;
  pr: string;
  ci: any;
  imagenes: string[];
  ParallaxImage: any;
};

export default function Testimonios({ c, ci, imagenes, ParallaxImage }: Props) {
  if (!c?.testimonios) return null;
  return (
    <section id="testimonios" className="bg-l">
      <div className="wrap">
        <p className="label">Testimonios</p>
        <h2 className="st">Lo que dicen nuestros clientes</h2>
        <p className="st-sub">La satisfaccion de nuestros clientes es nuestra mayor recompensa</p>
        {(ci.testimonios || imagenes[4]) && (
          <ParallaxImage
            src={ci.testimonios || imagenes[4]}
            alt="testimonios"
            style={{ width: "100%", height: 320, borderRadius: 20, marginBottom: "2rem", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}
          />
        )}
        <div className="test-grid">
          {c.testimonios.map((t: any, i: number) => (
            <div key={i} className="test-card">
              <div className="stars">
                {Array(t.estrellas ?? 5).fill(0).map((_, s) => (
                  <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <p>{t.texto}</p>
              <div className="test-author">
                <div className="av">{t.nombre?.charAt(0)}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{t.nombre}</div>
                  <div style={{ fontSize: "0.8rem", color: "#999" }}>{t.cargo}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
