"use client";
import LandingCarrusel from "../../LandingCarrusel";

type Props = {
  c: any;
  logo: string;
  slides: string[];
};

export default function HeroCentrado({ c, logo, slides }: Props) {
  return (
    <div className="hero">
      <div className="hero-slides">
        <LandingCarrusel imagenes={slides} />
      </div>
      <div className="hero-body">
        {c?.hero?.badge && <div className="hero-badge">{c.hero.badge}</div>}
        {logo && <img src={logo} alt="logo" className="logo" />}
        <h1>{c?.hero?.titulo}</h1>
        <p>{c?.hero?.subtitulo}</p>
        <div className="btns">
          <a href="#contacto" className="btn-w">{c?.hero?.cta_principal}</a>
          <a href="#servicios" className="btn-o">{c?.hero?.cta_secundario}</a>
        </div>
      </div>
    </div>
  );
}
