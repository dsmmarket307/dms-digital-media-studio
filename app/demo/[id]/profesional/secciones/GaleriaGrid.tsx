type Props = {
  c: any;
  ci: any;
  imagenes: string[];
};

export default function GaleriaGrid({ c, ci, imagenes }: Props) {
  const imgs = ci.galeria_imgs?.length > 0 ? ci.galeria_imgs : imagenes.slice(0, 5);
  return (
    <section id="galeria">
      <div className="wrap">
        <p className="label">Galeria</p>
        <h2 className="st">{c?.galeria?.titulo ?? "Nuestro trabajo"}</h2>
        <p className="st-sub">{c?.galeria?.subtitulo ?? "Conoce algunos de nuestros proyectos"}</p>
        <div className="galeria-grid">
          {imgs.map((img: string, i: number) => (
            <img key={i} src={img} alt={`galeria ${i}`} className="gal-img" />
          ))}
        </div>
      </div>
    </section>
  );
}
