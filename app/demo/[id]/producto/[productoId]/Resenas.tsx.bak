"use client";
import { useState, useEffect } from "react";

function Estrellas({ valor, onClick }: { valor: number; onClick?: (v: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} onClick={() => onClick?.(i)} width="20" height="20" viewBox="0 0 24 24" fill={i <= valor ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2" style={{ cursor: onClick ? "pointer" : "default" }}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

export default function Resenas({ siteId, productoIndex }: { siteId: string; productoIndex: number }) {
  const [resenas, setResenas] = useState<any[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ nombre: "", calificacion: 5, comentario: "", foto: null as File | null });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/resenas?site_id=${siteId}&producto_index=${productoIndex}`)
      .then(r => r.json())
      .then(d => setResenas(d.resenas ?? []));
  }, [siteId, productoIndex, success]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      let foto_url = "";
      if (form.foto) {
        const fd = new FormData();
        fd.append("file", form.foto);
        fd.append("site_id", siteId);
        const r = await fetch("/api/resenas/upload", { method: "POST", body: fd });
        const d = await r.json();
        foto_url = d.url ?? "";
      }
      await fetch("/api/resenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site_id: siteId, producto_index: productoIndex, nombre: form.nombre, calificacion: form.calificacion, comentario: form.comentario, foto_url })
      });
      setSuccess(true);
      setMostrarForm(false);
      setForm({ nombre: "", calificacion: 5, comentario: "", foto: null });
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const promedio = resenas.length > 0 ? (resenas.reduce((a, r) => a + r.calificacion, 0) / resenas.length) : 0;

  return (
    <div style={{ marginTop: "2rem", borderTop: "1px solid #f0f0f0", paddingTop: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: 8 }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111", marginBottom: 4 }}>Resenas de clientes</h3>
          {resenas.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Estrellas valor={Math.round(promedio)} />
              <span style={{ fontSize: "0.85rem", color: "#666" }}>{promedio.toFixed(1)} · {resenas.length} resena{resenas.length !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
        <button onClick={() => setMostrarForm(!mostrarForm)} style={{ padding: "8px 16px", background: "#111", color: "#fff", border: "none", borderRadius: 10, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}>
          {mostrarForm ? "Cancelar" : "Escribir resena"}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={handleSubmit} style={{ background: "#f8f9fa", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#555" }}>Tu nombre *</label>
            <input required value={form.nombre} onChange={e => setForm(p => ({...p, nombre: e.target.value}))} placeholder="Tu nombre" style={{ padding: "10px 12px", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: "0.9rem", outline: "none" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#555" }}>Calificacion *</label>
            <Estrellas valor={form.calificacion} onClick={v => setForm(p => ({...p, calificacion: v}))} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#555" }}>Comentario *</label>
            <textarea required value={form.comentario} onChange={e => setForm(p => ({...p, comentario: e.target.value}))} placeholder="Cuéntanos tu experiencia..." rows={3} style={{ padding: "10px 12px", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: "0.9rem", outline: "none", resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#555" }}>Foto (opcional)</label>
            <input type="file" accept="image/*" onChange={e => setForm(p => ({...p, foto: e.target.files?.[0] ?? null}))} style={{ fontSize: "0.85rem" }} />
          </div>
          <button type="submit" disabled={loading} style={{ padding: "12px", background: "#111", color: "#fff", border: "none", borderRadius: 10, fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Enviando..." : "Publicar resena"}
          </button>
        </form>
      )}

      {resenas.length === 0 ? (
        <p style={{ color: "#aaa", fontSize: "0.9rem" }}>Aun no hay resenas. Se el primero en opinar.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {resenas.map((r: any) => (
            <div key={r.id} style={{ background: "#f8f9fa", borderRadius: 12, padding: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#555", fontSize: "0.9rem" }}>{r.nombre?.charAt(0)?.toUpperCase()}</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111" }}>{r.nombre}</p>
                    <Estrellas valor={r.calificacion} />
                  </div>
                </div>
                <span style={{ fontSize: "0.75rem", color: "#aaa" }}>{new Date(r.created_at).toLocaleDateString("es-CO")}</span>
              </div>
              <p style={{ fontSize: "0.9rem", color: "#555", lineHeight: 1.6 }}>{r.comentario}</p>
              {r.foto_url && <img src={r.foto_url} alt="resena" style={{ marginTop: 8, width: "100%", maxWidth: 200, borderRadius: 8, objectFit: "cover" }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}