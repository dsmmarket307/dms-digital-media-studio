import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

const CATEGORY_KEYWORDS: Record<string, string> = {
  "Landing Page": "business marketing professional office",
  "Sitio Corporativo": "corporate office business team meeting",
  "Tienda Online": "ecommerce shopping store products retail",
  "Agencia": "creative agency team design studio",
  "Restaurante": "restaurant food cuisine dining gourmet",
  "Inmobiliaria": "real estate house luxury property architecture",
  "Consultorio": "medical clinic doctor health care professional",
  "Portafolio": "portfolio design creative art studio",
  "Salon de Belleza": "beauty salon hair makeup glamour style",
  "Spa": "spa wellness relaxation massage zen luxury",
  "Abogados": "law office legal justice attorney professional",
  "Contaduria": "accounting finance office professional business",
  "Medicos": "medical hospital doctor clinic health",
  "Gimnasio": "gym fitness workout bodybuilding training",
  "Fotografia": "photography camera portrait studio professional",
  "Tecnologia": "technology software developer startup innovation",
  "Turismo": "travel tourism hotel vacation landscape adventure",
  "Veterinaria": "veterinary pet animal clinic care",
  "Eventos": "events wedding party celebration decoration",
  "Consultoria": "consulting business strategy professional meeting",
  "Barberia": "barbershop haircut men grooming style",
  "Odontologia": "dentist dental clinic teeth smile health",
  "Farmacia": "pharmacy medicine health drugstore wellness",
  "Mecanica": "mechanic car repair garage automotive workshop",
  "Construccion": "construction building architecture real estate",
  "Educacion": "education school learning classroom students",
  "Hotel": "hotel luxury room accommodation travel resort",
  "Panaderia": "bakery bread fresh pastry cake artisan",
  "Joyeria": "jewelry luxury gold rings diamonds elegant",
  "Peluqueria": "hairdresser hair salon style beauty cut",
  "Floristeria": "florist flowers bouquet colorful nature garden",
  "Optica": "optical glasses eyewear vision eye care",
  "Arquitectura": "architecture building design modern interior",
  "Decoracion": "interior design decoration home elegant modern",
  "Catering": "catering food service banquet gourmet event",
  "Transporte": "transport logistics truck fleet professional",
  "Seguridad": "security guard professional protection service",
  "Limpieza": "cleaning service professional home office",
  "Jardineria": "gardening landscape garden green nature",
  "Plomeria": "plumbing pipe repair water professional",
  "Electricidad": "electrician electrical service professional",
  "Pintura": "painting wall color home renovation professional",
  "Mudanzas": "moving boxes truck transportation relocation",
  "Lavanderia": "laundry clean fresh clothes service",
  "Sastreria": "tailor suit fashion elegant clothing custom",
  "Zapateria": "shoes footwear leather craftsmanship store",
  "Libreria": "bookstore library books reading knowledge",
  "Papeleria": "stationery office supplies paper school",
  "Ferreteria": "hardware tools store construction supplies",
  "Supermercado": "supermarket grocery food market fresh",
  "Carniceria": "butcher meat fresh quality food",
  "Pescaderia": "fish seafood fresh market ocean",
  "Fruteria": "fruit vegetables fresh market colorful healthy",
  "Heladeria": "ice cream dessert sweet colorful gelato",
  "Cafeteria": "coffee cafe espresso cozy morning",
  "Bar": "bar drinks cocktail night social atmosphere",
  "Discoteca": "nightclub party music dance entertainment",
  "Teatro": "theater performance art stage entertainment",
  "Cine": "cinema movie film entertainment screen",
  "Museo": "museum art culture history exhibition",
  "Galeria Arte": "art gallery painting exhibition contemporary",
  "ONG": "nonprofit charity volunteer community help",
  "Iglesia": "church religion community faith spiritual",
  "Partido Politico": "politics government leadership community",
  "Otro": "business professional service modern office",
};

async function getPexelsImages(websiteType: string, count: number = 6, customKeywords?: string): Promise<string[]> {
  // Si hay keywords personalizadas de la IA, usarlas. Si no, usar las del catÃ¡logo
  const query = customKeywords || CATEGORY_KEYWORDS[websiteType] || "business professional modern";
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=landscape`,
      { headers: { Authorization: process.env.PEXELS_API_KEY! }, next: { revalidate: 3600 } }
    );
    const data = await res.json();
    return data.photos?.map((p: any) => p.src.large) ?? [];
  } catch {
    return Array(count).fill("https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg");
  }
}

type Props = { params: Promise<{ id: string }> };

export default async function DemoProfesional({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: site } = await supabase.from("generated_websites").select("*").eq("id", id).single();
  if (!site) notFound();

  const c = site.professional_content ?? site.generated_content;
  const pr = site.primary_color ?? "#7c3aed";
  const sc = site.secondary_color ?? "#0f172a";
  const logo = site.logo_url ?? "";

  // Usar keywords de la IA si existen (para "Otro" o cualquier tipo)
  const customKeywords = c?.meta?.pexels_keywords;
  const imagenes = await getPexelsImages(site.website_type, 6, customKeywords);
  const slides = imagenes.slice(0, 4);

  const css = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',system-ui,sans-serif;color:#111;scroll-behavior:smooth}
    .demo-bar{background:linear-gradient(90deg,${pr},${sc});color:#fff;text-align:center;padding:0.6rem;font-size:0.8rem;font-weight:600}
    .demo-bar a{color:#fff;text-decoration:underline;margin-left:8px;font-weight:700}
    nav{display:flex;align-items:center;justify-content:space-between;padding:1rem 3rem;background:#fff;border-bottom:1px solid #f0f0f0;position:sticky;top:0;z-index:100;box-shadow:0 2px 20px rgba(0,0,0,0.08)}
    .brand{display:flex;align-items:center;gap:12px}
    .brand h1{font-size:1.1rem;font-weight:800;color:${pr}}
    .brand img{height:70px;object-fit:contain}
    .nav-links{display:flex;gap:2rem;list-style:none}
    .nav-links a{text-decoration:none;color:#555;font-size:0.875rem;font-weight:500;transition:color 0.2s}
    .nav-links a:hover{color:${pr}}
    .nav-cta{background:${pr};color:#fff;padding:0.625rem 1.5rem;border-radius:8px;text-decoration:none;font-size:0.875rem;font-weight:700;transition:opacity 0.2s}
    .nav-cta:hover{opacity:0.9}
    .hero{position:relative;height:100vh;display:flex;align-items:center;overflow:hidden}
    .hero-slides{position:absolute;inset:0}
    .hero-slide{position:absolute;inset:0;opacity:0;transition:opacity 1.5s ease}
    .hero-slide.active{opacity:1}
    .hero-slide img{width:100%;height:100%;object-fit:cover}
    .hero-body{position:relative;z-index:1;max-width:750px;margin:0 auto;padding:2rem;text-align:center;color:#fff}
    .hero-badge{display:inline-block;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.4);padding:0.4rem 1rem;border-radius:999px;font-size:0.75rem;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-bottom:1.5rem}
    .hero-body img.logo{height:120px;object-fit:contain;margin:0 auto 1.5rem;display:block;filter:brightness(0) invert(1) drop-shadow(0 2px 8px rgba(0,0,0,0.5))}
    .hero-body h1{font-size:clamp(2.5rem,6vw,4rem);font-weight:900;line-height:1.05;margin-bottom:1.5rem;text-shadow:0 2px 16px rgba(0,0,0,0.6)}
    .hero-body p{font-size:1.2rem;opacity:.95;margin-bottom:2.5rem;line-height:1.7;text-shadow:0 1px 8px rgba(0,0,0,0.5)}
    .btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}
    .btn-w{background:#fff;color:${pr};padding:1rem 2.5rem;border-radius:12px;text-decoration:none;font-weight:800;font-size:1rem;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 4px 16px rgba(0,0,0,0.3)}
    .btn-w:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.4)}
    .btn-o{background:rgba(0,0,0,0.4);color:#fff;padding:1rem 2.5rem;border-radius:12px;text-decoration:none;font-weight:700;font-size:1rem;border:2px solid rgba(255,255,255,0.8);transition:background 0.2s;backdrop-filter:blur(4px)}
    .btn-o:hover{background:rgba(0,0,0,0.6)}
    .dots{position:absolute;bottom:2rem;left:50%;transform:translateX(-50%);display:flex;gap:8px;z-index:2}
    .dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.5);cursor:pointer;transition:all 0.3s}
    .dot.active{width:24px;border-radius:4px;background:#fff}
    section{padding:6rem 3rem}
    .wrap{max-width:1200px;margin:0 auto}
    .label{font-size:0.7rem;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${pr};margin-bottom:0.75rem;text-align:center}
    h2.st{font-size:clamp(1.75rem,3vw,2.5rem);font-weight:800;text-align:center;margin-bottom:1rem;color:#111}
    .st-sub{text-align:center;color:#666;margin-bottom:4rem;font-size:1rem;line-height:1.6;max-width:600px;margin-left:auto;margin-right:auto}
    .bg-l{background:#f8f9fa}
    .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;margin-bottom:4rem;text-align:center}
    .stat-num{font-size:3rem;font-weight:900;color:${pr}}
    .stat-label{font-size:0.875rem;color:#666;margin-top:0.25rem}
    .nosotros-grid{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}
    .nosotros-img{width:100%;height:500px;object-fit:cover;border-radius:24px;box-shadow:0 20px 60px rgba(0,0,0,0.15)}
    .nosotros-content h2{font-size:2.25rem;font-weight:800;margin-bottom:1.5rem;color:#111}
    .nosotros-content p{color:#555;line-height:1.8;margin-bottom:1.5rem}
    .mv-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:2rem}
    .mv-card{background:#f8f9fa;border-radius:16px;padding:1.5rem;border-left:4px solid ${pr}}
    .mv-card h4{font-weight:700;color:#111;margin-bottom:0.5rem}
    .mv-card p{font-size:0.875rem;color:#666}
    .g4{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.5rem}
    .srv-card{background:#fff;border-radius:20px;padding:2.5rem;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #f0f0f0;transition:transform 0.3s,box-shadow 0.3s;position:relative;overflow:hidden}
    .srv-card::before{content:"";position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,${pr},${sc})}
    .srv-card:hover{transform:translateY(-8px);box-shadow:0 20px 40px rgba(0,0,0,0.12)}
    .srv-icon{width:56px;height:56px;border-radius:16px;background:${pr}18;display:flex;align-items:center;justify-content:center;margin-bottom:1.5rem}
    .srv-card h3{font-size:1.1rem;font-weight:700;margin-bottom:0.75rem;color:#111}
    .srv-card p{font-size:0.875rem;color:#666;line-height:1.6;margin-bottom:1rem}
    .srv-detalle{font-size:0.8rem;color:${pr};font-weight:600}
    .srv-precio{font-size:0.8rem;color:#999;margin-top:0.5rem}
    .galeria-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
    .gal-img{width:100%;height:220px;object-fit:cover;border-radius:16px;transition:transform 0.3s}
    .gal-img:hover{transform:scale(1.03)}
    .gal-img.tall{grid-row:span 2;height:100%}
    .test-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1.5rem}
    .test-card{background:#fff;border-radius:20px;padding:2rem;box-shadow:0 4px 20px rgba(0,0,0,0.06);position:relative}
    .test-card::before{content:'"';position:absolute;top:1rem;right:1.5rem;font-size:5rem;color:${pr}22;font-family:Georgia,serif;line-height:1}
    .stars{display:flex;gap:4px;margin-bottom:1rem}
    .test-card p{font-size:0.9rem;color:#555;line-height:1.7;font-style:italic;margin-bottom:1.5rem}
    .test-author{display:flex;align-items:center;gap:0.75rem}
    .av{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:1rem;background:linear-gradient(135deg,${pr},${sc})}
    .faq-item{border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;margin-bottom:0.75rem}
    .faq-q{display:flex;justify-content:space-between;align-items:center;padding:1.5rem;cursor:pointer;font-weight:700;color:#111;font-size:0.95rem;transition:background 0.2s}
    .faq-q:hover{background:#f8f9fa}
    .faq-a{padding:0 1.5rem 1.5rem;font-size:0.875rem;color:#666;line-height:1.7;display:none}
    .faq-a.open{display:block}
    .contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:start}
    .contact-info h2{font-size:2.25rem;font-weight:800;margin-bottom:1rem;color:#fff}
    .contact-info p{color:rgba(255,255,255,0.8);line-height:1.7;margin-bottom:2rem}
    .contact-item{display:flex;align-items:center;gap:1rem;margin-bottom:1rem;color:rgba(255,255,255,0.9);font-size:0.9rem}
    .contact-icon{width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .form{background:#fff;border-radius:24px;padding:2.5rem}
    .form-group{margin-bottom:1.25rem}
    .form-group label{display:block;font-size:0.8rem;font-weight:600;color:#374151;margin-bottom:0.5rem}
    .form-group input,.form-group textarea{width:100%;border:1.5px solid #e5e7eb;border-radius:12px;padding:0.875rem 1rem;font-size:0.9rem;transition:border-color 0.2s;outline:none;font-family:inherit}
    .form-group input:focus,.form-group textarea:focus{border-color:${pr}}
    .form-btn{width:100%;background:${pr};color:#fff;padding:1rem;border-radius:12px;border:none;font-size:1rem;font-weight:700;cursor:pointer;transition:opacity 0.2s}
    .form-btn:hover{opacity:0.9}
    .wa-btn{display:flex;align-items:center;justify-content:center;gap:0.75rem;background:#25D366;color:#fff;padding:1rem 2rem;border-radius:12px;text-decoration:none;font-weight:700;font-size:1rem;margin-top:1rem;transition:opacity 0.2s}
    .wa-btn:hover{opacity:0.9}
    footer{background:#0f172a;color:#fff;padding:4rem 3rem 2rem}
    .footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:3rem;margin-bottom:3rem}
    .footer-brand img{height:60px;object-fit:contain;margin-bottom:1rem;filter:brightness(0) invert(1)}
    .footer-brand h3{font-size:1.1rem;font-weight:700;color:${pr};margin-bottom:0.75rem}
    .footer-brand p{font-size:0.875rem;color:rgba(255,255,255,0.5);line-height:1.6;margin-bottom:1.25rem}
    .social-icons{display:flex;gap:0.75rem;margin-top:0.5rem;flex-wrap:wrap}
    .social-icon{width:40px;height:40px;border-radius:10px;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;transition:background 0.2s;text-decoration:none;border:1px solid rgba(255,255,255,0.1)}
    .social-icon:hover{background:${pr};border-color:${pr}}
    .footer-col h4{font-size:0.9rem;font-weight:700;margin-bottom:1rem;color:#fff}
    .footer-col ul{list-style:none}
    .footer-col ul li{margin-bottom:0.5rem}
    .footer-col ul li a{color:rgba(255,255,255,0.5);text-decoration:none;font-size:0.875rem;transition:color 0.2s}
    .footer-col ul li a:hover{color:${pr}}
    .footer-bottom{border-top:1px solid rgba(255,255,255,0.1);padding-top:2rem;display:flex;justify-content:space-between;align-items:center}
    .footer-bottom p{font-size:0.8rem;color:rgba(255,255,255,0.3)}
    .comparador{background:linear-gradient(135deg,${pr},${sc});padding:5rem 3rem;text-align:center;color:#fff}
    .comparador h2{font-size:2.5rem;font-weight:900;margin-bottom:1rem}
    .comparador p{font-size:1.1rem;opacity:0.9;margin-bottom:3rem}
    .compare-cards{display:grid;grid-template-columns:1fr 1fr;gap:2rem;max-width:900px;margin:0 auto}
    .compare-card{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:24px;padding:2.5rem;text-align:left}
    .compare-card.featured{background:#fff;color:#111;border:none;box-shadow:0 20px 60px rgba(0,0,0,0.3)}
    .compare-card h3{font-size:1.25rem;font-weight:800;margin-bottom:0.5rem}
    .compare-price{font-size:2.5rem;font-weight:900;margin:1rem 0;color:${pr}}
    .compare-list{list-style:none;margin:1.5rem 0}
    .compare-list li{display:flex;align-items:center;gap:0.75rem;font-size:0.875rem;margin-bottom:0.75rem;opacity:0.9}
    .compare-card.featured .compare-list li{opacity:1;color:#374151}
    .compare-btn{display:block;text-align:center;padding:1rem;border-radius:12px;font-weight:700;text-decoration:none;margin-top:1.5rem;transition:opacity 0.2s}
    .compare-btn:hover{opacity:0.9}
    @media(max-width:768px){nav{padding:1rem}.nav-links{display:none}.hero-body h1{font-size:2.25rem}section{padding:4rem 1.5rem}.nosotros-grid,.contact-grid,.compare-cards,.footer-grid{grid-template-columns:1fr}.galeria-grid{grid-template-columns:1fr 1fr}.stats{grid-template-columns:1fr}}
  `;

  const script = `
    document.addEventListener('DOMContentLoaded', function() {
      var slides = document.querySelectorAll('.hero-slide');
      var dots = document.querySelectorAll('.dot');
      var current = 0;
      if (slides.length === 0) return;
      function goTo(n) {
        slides[current].classList.remove('active');
        dots[current].classList.remove('active');
        current = n;
        slides[current].classList.add('active');
        dots[current].classList.add('active');
      }
      setInterval(function(){ goTo((current + 1) % slides.length); }, 4000);
      dots.forEach(function(d, i){ d.addEventListener('click', function(){ goTo(i); }); });
      document.querySelectorAll('.faq-q').forEach(function(q){
        q.addEventListener('click', function(){
          var a = q.nextElementSibling;
          a.classList.toggle('open');
          q.querySelector('.faq-arrow').textContent = a.classList.contains('open') ? '-' : '+';
        });
      });
    });
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="demo-bar">
        Version Profesional â€” DMS Digital Media Studio
        <a href="https://dms-digital-media-studio.vercel.app/planes/negocio">Quiero este sitio â€” $999.000</a>
      </div>

      <nav>
        <div className="brand">
          {logo && <img src={logo} alt="logo" />}{!logo && <h1>{c?.footer?.nombre_empresa ?? site.project_name}</h1>}
        </div>
        <ul className="nav-links">
          <li><a href="#nosotros">Nosotros</a></li>
          <li><a href="#servicios">Servicios</a></li>
          <li><a href="#galeria">Galeria</a></li>
          <li><a href="#testimonios">Testimonios</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
        <a href="#contacto" className="nav-cta">{c?.hero?.cta_principal ?? "Contactar"}</a>
      </nav>

      <div className="hero">
        <div className="hero-slides">
          {slides.map((img, i) => (
            <div key={i} className={`hero-slide${i === 0 ? " active" : ""}`}>
              <img src={img} alt={`slide ${i}`} />
            </div>
          ))}
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
        <div className="dots">
          {slides.map((_, i) => (
            <div key={i} className={`dot${i === 0 ? " active" : ""}`} />
          ))}
        </div>
      </div>

      {c?.nosotros && (
        <section id="nosotros">
          <div className="wrap">
            <div className="nosotros-grid">
              <div>{imagenes[1] && <img src={imagenes[1]} alt="nosotros" className="nosotros-img" />}</div>
              <div className="nosotros-content">
                <p className="label" style={{ textAlign: "left" }}>Quienes somos</p>
                <h2>{c.nosotros.titulo}</h2>
                <p>{c.nosotros.historia}</p>
                <p>{c.nosotros.propuesta_valor}</p>
                {(c.nosotros.anos_experiencia || c.nosotros.clientes_atendidos) && (
                  <div className="stats" style={{ marginTop: "2rem", marginBottom: 0 }}>
                    {c.nosotros.anos_experiencia && <div><div className="stat-num">+{c.nosotros.anos_experiencia}</div><div className="stat-label">Anos de experiencia</div></div>}
                    {c.nosotros.clientes_atendidos && <div><div className="stat-num">+{c.nosotros.clientes_atendidos}</div><div className="stat-label">Clientes atendidos</div></div>}
                    {c.nosotros.proyectos_completados && <div><div className="stat-num">+{c.nosotros.proyectos_completados}</div><div className="stat-label">Proyectos completados</div></div>}
                  </div>
                )}
                <div className="mv-grid">
                  <div className="mv-card"><h4>Mision</h4><p>{c.nosotros.mision}</p></div>
                  <div className="mv-card"><h4>Vision</h4><p>{c.nosotros.vision}</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {c?.servicios && (
        <section id="servicios" className="bg-l">
          <div className="wrap">
            <p className="label">Servicios</p>
            <h2 className="st">Lo que ofrecemos</h2>
            <p className="st-sub">Soluciones profesionales adaptadas a las necesidades de tu negocio</p>
            <div className="g4">
              {c.servicios.map((s: any, i: number) => (
                <div key={i} className="srv-card">
                  <div className="srv-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={pr} strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
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
      )}

      <section id="galeria">
        <div className="wrap">
          <p className="label">Galeria</p>
          <h2 className="st">{c?.galeria?.titulo ?? "Nuestro trabajo"}</h2>
          <p className="st-sub">{c?.galeria?.subtitulo ?? "Conoce algunos de nuestros proyectos"}</p>
          <div className="galeria-grid">
            {imagenes.slice(0, 5).map((img, i) => (
              <img key={i} src={img} alt={`galeria ${i}`} className={`gal-img${i === 0 ? " tall" : ""}`} />
            ))}
          </div>
        </div>
      </section>

      {c?.testimonios && (
        <section id="testimonios" className="bg-l">
          <div className="wrap">
            <p className="label">Testimonios</p>
            <h2 className="st">Lo que dicen nuestros clientes</h2>
            <p className="st-sub">La satisfaccion de nuestros clientes es nuestra mayor recompensa</p>
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
      )}

      {c?.faq && (
        <section id="faq">
          <div className="wrap" style={{ maxWidth: "800px" }}>
            <p className="label">FAQ</p>
            <h2 className="st">Preguntas frecuentes</h2>
            <p className="st-sub">Todo lo que necesitas saber antes de empezar</p>
            {c.faq.map((f: any, i: number) => (
              <div key={i} className="faq-item">
                <div className="faq-q">
                  <span>{f.pregunta}</span>
                  <span className="faq-arrow" style={{ fontSize: "1.5rem", color: pr, fontWeight: 300 }}>+</span>
                </div>
                <div className="faq-a">{f.respuesta}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {c?.contacto && (
        <section id="contacto" style={{ background: `linear-gradient(135deg,${pr},${sc})`, padding: "6rem 3rem" }}>
          <div className="wrap">
            <div className="contact-grid">
              <div className="contact-info">
                <p className="label" style={{ color: "rgba(255,255,255,0.7)", textAlign: "left" }}>Contacto</p>
                <h2>{c.contacto.titulo}</h2>
                <p>{c.contacto.descripcion}</p>
                {c.contacto.telefono && <div className="contact-item"><div className="contact-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>{c.contacto.telefono}</div>}
                {c.contacto.email && <div className="contact-item"><div className="contact-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>{c.contacto.email}</div>}
                {c.contacto.direccion && <div className="contact-item"><div className="contact-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>{c.contacto.direccion}</div>}
                {c.contacto.horario && <div className="contact-item"><div className="contact-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>{c.contacto.horario}</div>}
                {c.contacto.whatsapp && <a href={`https://wa.me/${c.contacto.whatsapp.replace(/\D/g,"")}`} className="wa-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>WhatsApp</a>}
              </div>
              <div className="form">
                <h3 style={{ fontWeight: 800, fontSize: "1.25rem", marginBottom: "1.5rem", color: "#111" }}>Enviar mensaje</h3>
                <div className="form-group"><label>Nombre completo</label><input type="text" placeholder="Tu nombre" /></div>
                <div className="form-group"><label>Correo electronico</label><input type="email" placeholder="tu@correo.com" /></div>
                <div className="form-group"><label>Telefono</label><input type="text" placeholder="+57 300 000 0000" /></div>
                <div className="form-group"><label>Mensaje</label><textarea rows={4} placeholder="Cuentanos sobre tu proyecto..." style={{ resize: "none" }}></textarea></div>
                <button className="form-btn">Enviar mensaje</button>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="comparador">
        <h2>Elige tu plan</h2>
        <p>Compara ambas versiones y elige la que mejor se adapta a tu negocio</p>
        <div className="compare-cards">
          <div className="compare-card">
            <h3>Plan Basico</h3>
            <div className="compare-price" style={{ color: "#fff" }}>$499.000</div>
            <p style={{ fontSize: "0.8rem", opacity: 0.7, marginBottom: "1rem" }}>COP</p>
            <ul className="compare-list">
              {["Landing page", "Diseno responsive", "Boton WhatsApp", "1 revision"].map(i => (
                <li key={i}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{i}</li>
              ))}
            </ul>
            <a href={`/demo/${id}`} className="compare-btn" style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>Ver version basica</a>
          </div>
          <div className="compare-card featured">
            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: pr, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "0.5rem" }}>Recomendado</div>
            <h3 style={{ color: "#111" }}>Plan Profesional</h3>
            <div className="compare-price">$999.000</div>
            <p style={{ fontSize: "0.8rem", color: "#999", marginBottom: "1rem" }}>COP</p>
            <ul className="compare-list">
              {["Sitio web completo", "Multiples secciones", "SEO basico", "Carrusel profesional", "Galeria", "Testimonios", "FAQ", "3 revisiones"].map(i => (
                <li key={i}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={pr} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>{i}</li>
              ))}
            </ul>
            <a href="/planes/negocio" className="compare-btn" style={{ background: pr, color: "#fff" }}>Comprar ahora</a>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="footer-grid">
            <div className="footer-brand">
              {logo && <img src={logo} alt="logo" />}
              <h3>{c?.footer?.nombre_empresa}</h3>
              <p>{c?.footer?.descripcion}</p>
              <div className="social-icons">
                {c?.contacto?.instagram && (
                  <a href={c.contacto.instagram.startsWith("http") ? c.contacto.instagram : `https://instagram.com/${c.contacto.instagram.replace("@","")}`} target="_blank" className="social-icon" title="Instagram">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="#fff" stroke="none"/></svg>
                  </a>
                )}
                {c?.contacto?.facebook && (
                  <a href={c.contacto.facebook.startsWith("http") ? c.contacto.facebook : `https://facebook.com/${c.contacto.facebook}`} target="_blank" className="social-icon" title="Facebook">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </a>
                )}
                {c?.contacto?.tiktok && (
                  <a href={c.contacto.tiktok.startsWith("http") ? c.contacto.tiktok : `https://tiktok.com/${c.contacto.tiktok.startsWith("@") ? c.contacto.tiktok : "@"+c.contacto.tiktok}`} target="_blank" className="social-icon" title="TikTok">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg>
                  </a>
                )}
                {c?.contacto?.youtube && (
                  <a href={c.contacto.youtube.startsWith("http") ? c.contacto.youtube : `https://youtube.com/${c.contacto.youtube}`} target="_blank" className="social-icon" title="YouTube">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0f172a"/></svg>
                  </a>
                )}
                {c?.contacto?.whatsapp && (
                  <a href={`https://wa.me/${c.contacto.whatsapp.replace(/\D/g,"")}`} target="_blank" className="social-icon" title="WhatsApp">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  </a>
                )}
                {c?.contacto?.email && (
                  <a href={`mailto:${c.contacto.email}`} className="social-icon" title="Email">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </a>
                )}
              </div>
            </div>
            <div className="footer-col">
              <h4>Navegacion</h4>
              <ul>
                <li><a href="#nosotros">Nosotros</a></li>
                <li><a href="#servicios">Servicios</a></li>
                <li><a href="#galeria">Galeria</a></li>
                <li><a href="#testimonios">Testimonios</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Contacto</h4>
              <ul>
                {c?.contacto?.telefono && <li><a href="#">{c.contacto.telefono}</a></li>}
                {c?.contacto?.email && <li><a href={`mailto:${c.contacto.email}`}>{c.contacto.email}</a></li>}
                {c?.contacto?.direccion && <li><a href="#">{c.contacto.direccion}</a></li>}
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{c?.footer?.copyright}</p>
            <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.2)" }}>Sitio generado por DMS Digital Media Studio</p>
          </div>
        </div>
      </footer>

      <script dangerouslySetInnerHTML={{ __html: script }} />
    </>
  );
}