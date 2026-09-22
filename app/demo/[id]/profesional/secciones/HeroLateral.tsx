type Props = {
  c: any;
  logo: string;
  slides: string[];
  pr: string;
};

export default function HeroLateral({ c, logo, slides, pr }: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", minHeight: "90vh", padding: "4rem 3rem", gap: "3rem" }}>
      <div>
        {logo && <img src={logo} alt="logo" style={{ height: 64, objectFit: "contain", marginBottom: "1.5rem" }} />}
        {c?.hero?.badge && (
          <div style={{ display: "inline-block", color: pr, border: `1px solid ${pr}`, padding: "0.4rem 1rem", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: "1.5rem" }}>
            {c.hero.badge}
          </div>
        )}
        <h1 style={{ fontSize: "clamp(2rem,4vw,3.25rem)", fontWeight: 700, lineHeight: 1.15, marginBottom: "1.5rem", color: "#111" }}>
          {c?.hero?.titulo}
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#555", lineHeight: 1.7, marginBottom: "2.5rem", maxWidth: 480 }}>
          {c?.hero?.subtitulo}
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <a href="#contacto" style={{ background: pr, color: "#fff", padding: "1rem 2rem", borderRadius: 8, textDecoration: "none", fontWeight: 700 }}>
            {c?.hero?.cta_principal}
          </a>
          <a href="#servicios" style={{ border: "1.5px solid #ddd", color: "#111", padding: "1rem 2rem", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}>
            {c?.hero?.cta_secundario}
          </a>
        </div>
      </div>
      <div>
        {slides?.[0] && (
          <img src={slides[0]} alt="hero" style={{ width: "100%", height: 480, objectFit: "cover", borderRadius: 12 }} />
        )}
      </div>
    </div>
  );
}
