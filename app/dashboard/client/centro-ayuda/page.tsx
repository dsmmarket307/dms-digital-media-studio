"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const CATEGORIAS = [
  "Primeros Pasos","Crear Mi Sitio","Editar Mi Sitio","Conectar Dominio","Leads","Reservas","CRM Pipeline","Automatizaciones","Agente IA","Facturacion","Suscripciones","Preguntas Frecuentes"
];

function getYoutubeEmbed(url: string) {
  if (!url) return "";
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

function TutorialCard({ t, onClick }: { t: any; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, overflow:"hidden", cursor:"pointer" }}>
      {t.video_url && (
        <div style={{ height:110, background:"#111", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
        </div>
      )}
      <div style={{ padding:"12px 14px" }}>
        <span style={{ fontSize:10, fontWeight:700, color:"#7c3aed", background:"rgba(124,58,237,0.08)", padding:"2px 8px", borderRadius:999 }}>{t.categoria}</span>
        <p style={{ fontWeight:700, color:"#111", fontSize:13, margin:"8px 0 4px" }}>{t.titulo}</p>
        <p style={{ fontSize:12, color:"#888", margin:0, overflow:"hidden", textOverflow:"ellipsis", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" as const }}>{t.descripcion}</p>
      </div>
    </div>
  );
}

export default function CentroAyuda() {
  const supabase = createClient();
  const [tutoriales, setTutoriales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("tutoriales").select("*").order("created_at", { ascending: false });
      setTutoriales(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function verTutorial(t: any) {
    setSelected(t);
    await supabase.from("tutoriales").update({ vistas: (t.vistas ?? 0) + 1 }).eq("id", t.id);
  }

  const filtrados = tutoriales.filter(t => {
    const matchBusqueda = !busqueda || t.titulo.toLowerCase().includes(busqueda.toLowerCase()) || (t.descripcion ?? "").toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = !categoria || t.categoria === categoria;
    return matchBusqueda && matchCategoria;
  });

  const destacados = tutoriales.filter(t => t.destacado);
  const masVistos = [...tutoriales].sort((a,b) => (b.vistas??0)-(a.vistas??0)).slice(0,4);
  const novedades = [...tutoriales].sort((a,b) => new Date(b.updated_at).getTime()-new Date(a.updated_at).getTime()).slice(0,4);

  if (loading) return <div style={{ padding: "2rem" }}><p style={{ color:"#888", fontSize:13 }}>Cargando...</p></div>;

  if (selected) {
    return (
      <div style={{ padding: "2rem", maxWidth: 800 }}>
        <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", color:"#7c3aed", fontSize:13, fontWeight:700, cursor:"pointer", marginBottom:16, padding:0 }}>Volver</button>
        <div>
          <span style={{ fontSize:11, fontWeight:700, color:"#7c3aed", background:"rgba(124,58,237,0.08)", padding:"3px 10px", borderRadius:999 }}>{selected.categoria}</span>
        </div>
        <h1 style={{ fontSize:"1.4rem", fontWeight:800, color:"#111", margin:"10px 0 6px" }}>{selected.titulo}</h1>
        <p style={{ color:"#888", fontSize:13, marginBottom:16 }}>{selected.descripcion}</p>
        {selected.video_url && (
          <div style={{ position:"relative", paddingBottom:"56.25%", borderRadius:12, overflow:"hidden", marginBottom:20, background:"#000" }}>
            <iframe src={getYoutubeEmbed(selected.video_url)} style={{ position:"absolute", inset:0, width:"100%", height:"100%", border:"none" }} allowFullScreen />
          </div>
        )}
        {selected.pasos?.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <h2 style={{ fontSize:14, fontWeight:800, color:"#111", marginBottom:12 }}>Pasos</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {selected.pasos.map((p: any, i: number) => (
                <div key={i} style={{ display:"flex", gap:12, background:"#f8f9fa", borderRadius:10, padding:"12px 14px" }}>
                  <div style={{ width:24, height:24, borderRadius:"50%", background:"#7c3aed", color:"#fff", fontSize:12, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{i+1}</div>
                  <p style={{ fontSize:13, color:"#555", margin:0 }}>{p.texto ?? p}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {selected.faqs?.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <h2 style={{ fontSize:14, fontWeight:800, color:"#111", marginBottom:12 }}>Preguntas frecuentes</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {selected.faqs.map((f: any, i: number) => (
                <div key={i} style={{ border:"1px solid #e5e7eb", borderRadius:10, padding:"12px 14px" }}>
                  <p style={{ fontWeight:700, color:"#111", fontSize:13, marginBottom:4 }}>{f.pregunta}</p>
                  <p style={{ fontSize:13, color:"#666", margin:0 }}>{f.respuesta}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <p style={{ fontSize:11, color:"#aaa" }}>Actualizado: {new Date(selected.updated_at).toLocaleDateString("es-CO")}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111", margin: 0 }}>Centro de Ayuda</h1>
        <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Aprende a usar la plataforma DMS paso a paso.</p>
      </div>

      <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar tutoriales... ej: como conectar un dominio" style={{ width:"100%", border:"1px solid #e5e7eb", borderRadius:10, padding:"12px 16px", fontSize:13, outline:"none", boxSizing:"border-box", marginBottom:20 }} />

      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8, marginBottom:24 }}>
        <button onClick={() => setCategoria(null)} style={{ flexShrink:0, padding:"6px 14px", borderRadius:999, border:"1px solid", borderColor: !categoria ? "#7c3aed" : "#e5e7eb", background: !categoria ? "rgba(124,58,237,0.08)" : "#fff", color: !categoria ? "#7c3aed" : "#555", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>Todas</button>
        {CATEGORIAS.map(c => (
          <button key={c} onClick={() => setCategoria(c)} style={{ flexShrink:0, padding:"6px 14px", borderRadius:999, border:"1px solid", borderColor: categoria===c ? "#7c3aed" : "#e5e7eb", background: categoria===c ? "rgba(124,58,237,0.08)" : "#fff", color: categoria===c ? "#7c3aed" : "#555", fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>{c}</button>
        ))}
      </div>

      {!busqueda && !categoria && (
        <>
          {destacados.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize:14, fontWeight:800, color:"#111", marginBottom:12 }}>Videos Recomendados</h2>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12 }}>
                {destacados.map(t => <TutorialCard key={t.id} t={t} onClick={() => verTutorial(t)} />)}
              </div>
            </div>
          )}
          {masVistos.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize:14, fontWeight:800, color:"#111", marginBottom:12 }}>Tutoriales mas vistos</h2>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12 }}>
                {masVistos.map(t => <TutorialCard key={t.id} t={t} onClick={() => verTutorial(t)} />)}
              </div>
            </div>
          )}
          {novedades.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize:14, fontWeight:800, color:"#111", marginBottom:12 }}>Novedades de la plataforma</h2>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12 }}>
                {novedades.map(t => <TutorialCard key={t.id} t={t} onClick={() => verTutorial(t)} />)}
              </div>
            </div>
          )}
          {tutoriales.length === 0 && (
            <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:"3rem", textAlign:"center", color:"#aaa", fontSize:13 }}>Aun no hay tutoriales publicados.</div>
          )}
        </>
      )}

      {(busqueda || categoria) && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize:14, fontWeight:800, color:"#111", marginBottom:12 }}>{filtrados.length} resultado(s)</h2>
          {filtrados.length === 0 ? (
            <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:"2rem", textAlign:"center", color:"#aaa", fontSize:13 }}>No encontramos tutoriales para tu busqueda.</div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12 }}>
              {filtrados.map(t => <TutorialCard key={t.id} t={t} onClick={() => verTutorial(t)} />)}
            </div>
          )}
        </div>
      )}

      <div style={{ background:"linear-gradient(135deg,#7c3aed,#4f46e5)", borderRadius:14, padding:"24px", textAlign:"center", marginTop: 32 }}>
        <p style={{ color:"#fff", fontWeight:800, fontSize:15, margin:"0 0 6px" }}>No encontraste lo que buscabas?</p>
        <p style={{ color:"rgba(255,255,255,0.8)", fontSize:13, margin:"0 0 16px" }}>Nuestro equipo de soporte esta listo para ayudarte.</p>
        <Link href="/dashboard/client/soporte" style={{ background:"#fff", color:"#7c3aed", padding:"10px 24px", borderRadius:10, fontSize:13, fontWeight:700, textDecoration:"none", display:"inline-block" }}>Contactar Soporte</Link>
      </div>
    </div>
  );
}
