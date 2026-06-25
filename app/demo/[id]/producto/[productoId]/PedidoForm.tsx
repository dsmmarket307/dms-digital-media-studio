"use client";
import { useState } from "react";

export default function PedidoForm({ producto, siteId, primaryColor }: { producto: any; siteId: string; primaryColor: string }) {
  const [form, setForm] = useState({ nombre: "", telefono: "", ciudad: "", barrio: "", direccion: "", talla: "", cantidad: 1, notas: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: any) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site_id: siteId, producto_nombre: producto.nombre, producto_precio: producto.precio, ...form })
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
    <div style={{ textAlign: "center", padding: "3rem 2rem", background: "#fff", borderRadius: 20, marginTop: "2rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" style={{ marginBottom: "1rem" }}>
        <circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/>
      </svg>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#16a34a", marginBottom: "0.75rem" }}>Pedido recibido</h2>
      <p style={{ color: "#555" }}>Nos comunicaremos contigo al <strong>{form.telefono}</strong> para coordinar la entrega.</p>
    </div>
  );

  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: "2rem", marginTop: "2rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="2">
          <path d="M5 8h14M5 8a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v0a2 2 0 01-2 2M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8"/>
        </svg>
        <span style={{ fontSize: "1.2rem", fontWeight: 800 }}>Hacer pedido - Pago contra entrega</span>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#555" }}>Nombre completo *</label>
            <input name="nombre" required value={form.nombre} onChange={handleChange} placeholder="Tu nombre" style={{ padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: "0.95rem", outline: "none", fontFamily: "inherit" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#555" }}>Telefono / WhatsApp *</label>
            <input name="telefono" required value={form.telefono} onChange={handleChange} placeholder="300 000 0000" style={{ padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: "0.95rem", outline: "none", fontFamily: "inherit" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#555" }}>Ciudad *</label>
            <input name="ciudad" required value={form.ciudad} onChange={handleChange} placeholder="Bogota, Medellin..." style={{ padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: "0.95rem", outline: "none", fontFamily: "inherit" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#555" }}>Barrio</label>
            <input name="barrio" value={form.barrio} onChange={handleChange} placeholder="Tu barrio" style={{ padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: "0.95rem", outline: "none", fontFamily: "inherit" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "1 / -1" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#555" }}>Direccion completa *</label>
            <input name="direccion" required value={form.direccion} onChange={handleChange} placeholder="Calle 123 # 45-67" style={{ padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: "0.95rem", outline: "none", fontFamily: "inherit" }} />
          </div>
          {producto.tallas && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#555" }}>Talla</label>
              <select name="talla" value={form.talla} onChange={handleChange} style={{ padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: "0.95rem", outline: "none", fontFamily: "inherit" }}>
                {producto.tallas.split(",").map((t: string, j: number) => (
                  <option key={j} value={t.trim()}>{t.trim()}</option>
                ))}
              </select>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#555" }}>Cantidad</label>
            <input name="cantidad" type="number" min={1} value={form.cantidad} onChange={handleChange} style={{ padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: "0.95rem", outline: "none", fontFamily: "inherit" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, gridColumn: "1 / -1" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#555" }}>Notas adicionales</label>
            <textarea name="notas" rows={3} value={form.notas} onChange={handleChange} placeholder="Instrucciones especiales, color, etc..." style={{ padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: "0.95rem", outline: "none", fontFamily: "inherit", resize: "vertical" }} />
          </div>
        </div>
        {error && <p style={{ color: "#ef4444", fontSize: "0.9rem", marginTop: "1rem" }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 16, background: primaryColor, color: "#fff", border: "none", borderRadius: 12, fontSize: "1rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: "1.5rem", opacity: loading ? 0.7 : 1, fontFamily: "inherit" }}>
          {loading ? "Enviando..." : "Confirmar pedido contra entrega"}
        </button>
      </form>
    </div>
  );
}