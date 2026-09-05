import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = { params: Promise<{ id: string; nombre: string }> };

export default async function CategoriaPage({ params }: Props) {
  const { id, nombre } = await params;
  const supabase = await createClient();
  const { data: site } = await supabase.from("generated_websites").select("*").eq("id", id).single();
  if (!site) notFound();

  const c = site.generated_content as any;
  const pr = site.primary_color ?? "#7c3aed";
  const sc = site.secondary_color ?? "#0f172a";
  const nombreDecodificado = decodeURIComponent(nombre);

  const productosFiltrados = (c?.productos ?? []).filter(
    (p: any, i: number) => (p.categoria ?? "").toLowerCase() === nombreDecodificado.toLowerCase()
  ).map((p: any, i: number) => ({ ...p, indiceOriginal: (c?.productos ?? []).indexOf(p) }));

  const css = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI', sans-serif;color:#111}
    .cat-nav{display:flex;align-items:center;padding:1.5rem 3rem;border-bottom:1px solid #f0f0f0}
    .cat-nav a{color:${pr};text-decoration:none;font-weight:700;font-size:0.9rem}
    .cat-header{padding:3rem;text-align:center;border-bottom:1px solid #f0f0f0}
    .cat-header h1{font-size:2rem;font-weight:900;text-transform:uppercase;letter-spacing:2px}
    .cat-wrap{max-width:1200px;margin:0 auto;padding:3rem}
    .cat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem}
    a.cat-card{text-decoration:none;color:inherit;display:block;border-radius:4px;transition:opacity 0.25s ease}
    a.cat-card:hover{opacity:0.9}
    a.cat-card > div:first-child{width:100%;aspect-ratio:4/5;background:#f5f5f5;border-radius:4px;overflow:hidden;display:flex;align-items:center;justify-content:center}
    a.cat-card > div:first-child img{width:100%;height:100%;object-fit:cover;object-position:top center}
    .cat-card h3{font-size:0.95rem;font-weight:500;margin-top:1rem;color:#111}
    .cat-card p{font-size:1.05rem;font-weight:700;color:#111;margin-top:0.25rem}
    .cat-empty{text-align:center;padding:4rem;color:#888}
    @media(max-width:768px){.cat-nav,.cat-header,.cat-wrap{padding-left:1.5rem;padding-right:1.5rem}}
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <nav className="cat-nav">
        <Link href={`/demo/${id}/profesional`}>&larr; Volver a la tienda</Link>
      </nav>
      <div className="cat-header">
        <h1>{nombreDecodificado}</h1>
      </div>
      <div className="cat-wrap">
        {productosFiltrados.length === 0 ? (
          <div className="cat-empty">No hay productos en esta categoria.</div>
        ) : (
          <div className="cat-grid">
            {productosFiltrados.map((p: any, i: number) => (
              <Link key={i} href={`/demo/${id}/producto/${p.indiceOriginal}?from=profesional`} className="cat-card">
                <div>
                  {p.imagenes?.length > 0 && <img src={p.imagenes[0]} alt={p.nombre} />}
                </div>
                <h3>{p.nombre}</h3>
                <p>{p.precio}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
