"use client";
import { useState } from "react";

export default function DetalleCliente({ producto, siteId, primaryColor }: { producto: any; siteId: string; primaryColor: string }) {
  const [tallaSeleccionada, setTallaSeleccionada] = useState("");
  const [colorSeleccionado, setColorSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ nombre: "", telefono: "", ciudad: "", barrio: "", direccion: "", notas: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const tallas = producto.tallas ? producto.tallas.split(",").map((t: string) => t.trim()) : [];
  const colores = producto.colores ? producto.colores.split(",").map((c: string) => c.trim()) : [];

  const handleChange = (e: any) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_id: siteId,
          producto_nombre: producto.nombre,
          producto_precio: producto.precio,
          talla: tallaSeleccionada,
          color: colorSeleccionado,
          cantidad,
          ...form
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al enviar pedido");
      setSuccess(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" style={{ marginBottom: "1rem" }}>
        <circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/>
      </svg>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#16a34a", marginBottom: "0.5rem" }}>Pedido recibido</h2>
      <p style={{ color: "#555", textAlign: "center" }}>Nos comunicaremos contigo al <strong>{form.telefono}</strong> para coordinar la entrega.</p>
      <button onClick={() => { setSuccess(false); setMostrarForm(false); }} style={{ marginTop: "1.5rem", padding: "10px 24px", background: "#f3f4f6", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 600 }}>Volver al producto</button>
    </div>
  );

  return (
    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#111", lineHeight: 1.3 }}>{producto.nombre}</h1>
      <p style={{ fontSize: "2rem", fontWeight: 800, color: "#111" }}>{producto.precio}</p>

      {producto.descripcion && !mostrarForm && (
        <p style={{ fontSize: "0.95rem", color: "#555", lineHeight: 2, letterSpacing: "0.01em", whiteSpace: "pre-line" }}>{producto.descripcion}</p>
      )}

      {!mostrarForm && (
        <>
          {colores.length > 0 && (
            <div>
              <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#111", marginBottom: 8 }}>COLOR</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {colores.map((col: string, j: number) => (
                  <button key={j} onClick={() => setColorSeleccionado(col)} style={{ padding: "8px 16px", borderRadius: 8, border: `2px solid ${colorSeleccionado === col ? "#111" : "#e5e7eb"}`, background: colorSeleccionado === col ? "#111" : "#fff", color: colorSeleccionado === col ? "#fff" : "#111", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>{col}</button>
                ))}
              </div>
            </div>
          )}

          {tallas.length > 0 && (
            <div>
              <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#111", marginBottom: 8 }}>TALLA</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {tallas.map((t: string, j: number) => (
                  <button key={j} onClick={() => setTallaSeleccionada(t)} style={{ padding: "8px 16px", borderRadius: 8, border: `2px solid ${tallaSeleccionada === t ? "#111" : "#e5e7eb"}`, background: tallaSeleccionada === t ? "#111" : "#fff", color: tallaSeleccionada === t ? "#fff" : "#111", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>{t}</button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#111", marginBottom: 8 }}>Cantidad</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} style={{ width: 36, height: 36, borderRadius: 8, border: "2px solid #e5e7eb", background: "#fff", fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
              <span style={{ fontWeight: 700, fontSize: "1.1rem", minWidth: 30, textAlign: "center" }}>{cantidad}</span>
              <button onClick={() => setCantidad(cantidad + 1)} style={{ width: 36, height: 36, borderRadius: 8, border: "2px solid #e5e7eb", background: "#fff", fontSize: "1.2rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            </div>
          </div>

          <button onClick={() => setMostrarForm(true)} style={{ width: "100%", padding: 16, background: primaryColor, color: "#fff", border: "none", borderRadius: 12, fontSize: "1rem", fontWeight: 700, cursor: "pointer" }}>
            Pedir ahora
          </button>
        </>
      )}

      {mostrarForm && (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111" }}>Datos de entrega</h3>
          {[
            { name: "nombre", label: "Nombre completo *", placeholder: "Tu nombre", required: true },
            { name: "telefono", label: "Telefono / WhatsApp *", placeholder: "300 000 0000", required: true },
            { name: "ciudad", label: "Ciudad *", placeholder: "Bogota, Medellin...", required: true },
            { name: "barrio", label: "Barrio", placeholder: "Tu barrio", required: false },
            { name: "direccion", label: "Direccion completa *", placeholder: "Calle 123 # 45-67", required: true },
          ].map(f => (
            <div key={f.name} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#555" }}>{f.label}</label>
              <input name={f.name} required={f.required} value={(form as any)[f.name]} onChange={handleChange} placeholder={f.placeholder} style={{ padding: "10px 12px", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: "0.9rem", outline: "none", fontFamily: "inherit" }} />
            </div>
          ))}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#555" }}>Notas adicionales</label>
            <textarea name="notas" value={form.notas} onChange={handleChange} placeholder="Instrucciones especiales..." rows={2} style={{ padding: "10px 12px", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: "0.9rem", outline: "none", fontFamily: "inherit", resize: "vertical" }} />
          </div>
          {error && <p style={{ color: "#ef4444", fontSize: "0.85rem" }}>{error}</p>}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => setMostrarForm(false)} style={{ flex: 1, padding: 14, background: "#f3f4f6", border: "none", borderRadius: 12, fontSize: "0.95rem", fontWeight: 600, cursor: "pointer" }}>Atras</button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: 14, background: primaryColor, color: "#fff", border: "none", borderRadius: 12, fontSize: "0.95rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Enviando..." : "Confirmar pedido"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}