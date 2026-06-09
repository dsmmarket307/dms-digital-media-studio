import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string; pagina: string }> };

export default async function SubPage({ params }: Props) {
  const { id, pagina } = await params;
  const supabase = await createClient();
  const { data: site } = await supabase.from("generated_websites").select("*").eq("id", id).single();
  if (!site) notFound();

  const c = site.generated_content;
  const pr = site.primary_color ?? "#7c3aed";
  const sc = site.secondary_color ?? "#000000";
  const logo = site.logo_url ?? "";
  const paginas = c?.paginas_extra ?? [];
  const page = paginas.find((p: any) => p.slug === pagina);
  if (!page) notFound();

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Segoe UI',sans-serif;color:#111}
        nav{display:flex;align-items:center;justify-content:space-between;padding:1rem 2rem;background:#fff;border-bottom:1px solid #f0f0f0;position:sticky;top:0;z-index:100;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
        .wrap{max-width:1100px;margin:0 auto;padding:0 1rem}
        .g3{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem}
        .card{background:#fff;border-radius:16px;padding:2rem;box-shadow:0 2px 12px rgba(0,0,0,.06);border:1px solid #f0f0f0}
        @media(max-width:768px){nav{padding:1rem}.g3{grid-template-columns:1fr}}
      `}</style>

      <nav>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {logo && <img src={logo} alt="logo" style={{ height:44, objectFit:"contain" }} />}
          <span style={{ fontWeight:700, fontSize:"1.1rem", color:pr }}>{c?.footer?.nombre_empresa ?? site.project_name}</span>
        </div>
        <a href={`/demo/${id}`} style={{ background:pr, color:"#fff", padding:"0.5rem 1.25rem", borderRadius:8, textDecoration:"none", fontSize:"0.875rem", fontWeight:700 }}>Volver</a>
      </nav>

      <section style={{ padding:"4rem 2rem" }}>
        <div className="wrap">
          <div style={{ marginBottom:"3rem", textAlign:"center" }}>
            <p style={{ fontSize:".7rem", fontWeight:700, letterSpacing:4, textTransform:"uppercase", color:pr, marginBottom:".75rem" }}>{c?.footer?.nombre_empresa}</p>
            <h1 style={{ fontSize:"clamp(1.5rem,3vw,2.5rem)", fontWeight:800, color:"#111", marginBottom:"1rem" }}>{page.titulo}</h1>
            {page.descripcion && <p style={{ color:"#666", fontSize:"1rem", lineHeight:1.7, maxWidth:600, margin:"0 auto" }}>{page.descripcion}</p>}
          </div>

          {page.items && page.items.length > 0 && (
            <div className="g3">
              {page.items.map((item: any, i: number) => (
                <div key={i} className="card">
                  {item.imagen && <img src={item.imagen} alt={item.nombre} style={{ width:"100%", height:180, objectFit:"cover", borderRadius:10, marginBottom:"1rem" }} />}
                  <h3 style={{ fontWeight:700, fontSize:"1rem", color:"#111", marginBottom:".5rem" }}>{item.nombre}</h3>
                  {item.descripcion && <p style={{ fontSize:".875rem", color:"#666", lineHeight:1.6, marginBottom:".75rem" }}>{item.descripcion}</p>}
                  {item.precio && <p style={{ fontSize:"1.1rem", fontWeight:800, color:pr }}>{item.precio}</p>}
                  {item.btn_label && item.btn_url && (
                    <a href={item.btn_url} target="_blank" rel="noopener noreferrer" style={{ display:"inline-block", marginTop:".75rem", background:pr, color:"#fff", padding:"8px 20px", borderRadius:8, textDecoration:"none", fontSize:".875rem", fontWeight:700 }}>{item.btn_label}</a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer style={{ background:sc||"#111", color:"#fff", padding:"2rem", textAlign:"center" }}>
        {logo && <img src={logo} alt="logo" style={{ height:40, objectFit:"contain", margin:"0 auto 1rem", display:"block", filter:"brightness(0) invert(1)" }} />}
        <p style={{ color:pr, fontWeight:700, fontSize:"1rem" }}>{c?.footer?.nombre_empresa}</p>
        <p style={{ fontSize:".8rem", color:"rgba(255,255,255,.4)", marginTop:4 }}>{c?.footer?.copyright}</p>
      </footer>
    </>
  );
}
