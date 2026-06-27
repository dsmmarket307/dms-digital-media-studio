"use client";
import { useState } from "react";
import { useCarrito } from "../context/CarritoContext";

export default function CarritoDrawer({ primaryColor, siteId }: { primaryColor: string; siteId: string }) {
  const { items, quitar, limpiar, total, abierto, setAbierto } = useCarrito();
  const [checkout, setCheckout] = useState(false);
  const [form, setForm] = useState({ nombre: "", telefono: "", ciudad: "", barrio: "", direccion: "", notas: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: any) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      for (const item of items) {
        await fetch("/api/pedidos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ site_id: siteId, producto_nombre: item.nombre, producto_precio: item.precio, talla: item.talla, color: item.color, cantidad: item.cantidad, ...form })
        });
      }
      setSuccess(true);
      limpiar();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!abierto) return (
    <button onClick={() => setAbierto(true)} style={{ position: "fixed", bottom: 24, right: 24, width: 56, height: 56, background: primaryColor, border: "none", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", zIndex: 1000 }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
      {items.length > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: "#ef4444", color: "#fff", borderRadius: "50%", width: 20, height: 20, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{items.length}</span>}
    </button>
  );

  return (
    <>
      <div onClick={() => setAbierto(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000 }} />
      <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: "min(420px, 100vw)", background: "#fff", zIndex: 1001, display: "flex", flexDirection: "column", boxShadow: "-4px 0 24px rgba(0,0,0,0.15)" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontWeight: 800, fontSize: "1.1rem" }}>{checkout ? "Datos de entrega" : "Carrito (" + items.length + ")"}</h2>
          <button onClick={() => { setAbierto(false); setCheckout(false); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" style={{ marginBottom: "1rem" }}><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>
              <h3 style={{ fontWeight: 800, color: "#16a34a", marginBottom: 8 }}>Pedido confirmado</h3>
              <p style={{ color: "#555", fontSize: "0.9rem" }}>Te contactaremos pronto para coordinar la entrega.</p>
              <button onClick={() => { setSuccess(false); setCheckout(false); setAbierto(false); }} style={{ marginTop: "1.5rem", padding: "10px 24px", background: "#f3f4f6", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 600 }}>Cerrar</button>
            </div>
          ) : !checkout ? (
            items.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#aaa" }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" style={{ marginBottom: 12 }}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                <p style={{ fontWeight: 600 }}>Tu carrito esta vacio</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {items.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "0.75rem", background: "#f8f9fa", borderRadius: 12 }}>
                    {item.imagen && <img src={item.imagen} alt={item.nombre} style={{ width: 70, height: 70, objectFit: "contain", borderRadius: 8, background: "#fff" }} />}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111", marginBottom: 2 }}>{item.nombre}</p>
                      {item.talla && <p style={{ fontSize: "0.78rem", color: "#666" }}>Talla: {item.talla}</p>}
                      {item.color && <p style={{ fontSize: "0.78rem", color: "#666" }}>Color: {item.color}</p>}
                      <p style={{ fontSize: "0.78rem", color: "#666" }}>Cantidad: {item.cantidad}</p>
                      <p style={{ fontWeight: 700, color: "#111", fontSize: "0.9rem" }}>{item.precio}</p>
                    </div>
                    <button onClick={() => quitar(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", alignSelf: "flex-start" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            <form id="checkout-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { name: "nombre", label: "Nombre completo *", placeholder: "Tu nombre", required: true },
                { name: "telefono", label: "Telefono / WhatsApp *", placeholder: "300 000 0000", required: true },
                { name: "ciudad", label: "Ciudad *", placeholder: "Bogota, Medellin...", required: true },
                { name: "barrio", label: "Barrio", placeholder: "Tu barrio", required: false },
                { name: "direccion", label: "Direccion completa *", placeholder: "Calle 123 # 45-67", required: true },
              ].map(f => (
                <div key={f.name} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#555" }}>{f.label}</label>
                  <input name={f.name} required={f.required} value={(form as any)[f.name]} onChange={handleChange} placeholder={f.placeholder} style={{ padding: "10px 12px", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: "0.88rem", outline: "none", fontFamily: "inherit" }} />
                </div>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#555" }}>Notas adicionales</label>
                <textarea name="notas" value={form.notas} onChange={handleChange} placeholder="Instrucciones especiales..." rows={2} style={{ padding: "10px 12px", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: "0.88rem", outline: "none", fontFamily: "inherit", resize: "vertical" }} />
              </div>
              {error && <p style={{ color: "#ef4444", fontSize: "0.82rem" }}>{error}</p>}
            </form>
          )}
        </div>
        {!success && items.length > 0 && (
          <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #f0f0f0" }}>
            {!checkout ? (
              <button onClick={() => setCheckout(true)} style={{ width: "100%", padding: 16, background: primaryColor, color: "#fff", border: "none", borderRadius: 12, fontSize: "1rem", fontWeight: 700, cursor: "pointer" }}>
                Finalizar pedido
              </button>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setCheckout(false)} style={{ flex: 1, padding: 14, background: "#f3f4f6", border: "none", borderRadius: 12, fontSize: "0.9rem", fontWeight: 600, cursor: "pointer" }}>Atras</button>
                <button form="checkout-form" type="submit" disabled={loading} style={{ flex: 2, padding: 14, background: primaryColor, color: "#fff", border: "none", borderRadius: 12, fontSize: "0.9rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
                  {loading ? "Enviando..." : "Confirmar pedido"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}