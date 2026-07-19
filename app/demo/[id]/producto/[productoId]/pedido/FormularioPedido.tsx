"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DEPARTAMENTOS: Record<string, string[]> = {
  "Amazonas": ["Leticia", "Puerto Nariño"],
  "Antioquia": ["Medellin", "Bello", "Itagui", "Envigado", "Rionegro", "Apartado", "Turbo"],
  "Arauca": ["Arauca", "Saravena", "Tame"],
  "Atlantico": ["Barranquilla", "Soledad", "Malambo", "Sabanagrande"],
  "Bogota D.C.": ["Bogota"],
  "Bolivar": ["Cartagena", "Magangue", "Mompox"],
  "Boyaca": ["Tunja", "Duitama", "Sogamoso", "Chiquinquira"],
  "Caldas": ["Manizales", "Villamaria", "La Dorada", "Chinchina"],
  "Caqueta": ["Florencia", "San Vicente del Caguan"],
  "Casanare": ["Yopal", "Aguazul", "Villanueva"],
  "Cauca": ["Popayan", "Santander de Quilichao", "Puerto Tejada"],
  "Cesar": ["Valledupar", "Aguachica", "Bosconia"],
  "Choco": ["Quibdo", "Istmina", "Tado"],
  "Cordoba": ["Monteria", "Lorica", "Cerethe"],
  "Cundinamarca": ["Soacha", "Fusagasuga", "Facatativa", "Zipaquira", "Chia", "Mosquera", "Madrid", "Funza"],
  "Guainia": ["Inirida"],
  "Guaviare": ["San Jose del Guaviare"],
  "Huila": ["Neiva", "Pitalito", "Garzon"],
  "La Guajira": ["Riohacha", "Maicao", "Uribia"],
  "Magdalena": ["Santa Marta", "Cienaga", "Fundacion"],
  "Meta": ["Villavicencio", "Acacias", "Granada"],
  "Narino": ["Pasto", "Tumaco", "Ipiales", "Turbo"],
  "Norte de Santander": ["Cucuta", "Ocana", "Pamplona", "Villa del Rosario"],
  "Putumayo": ["Mocoa", "Puerto Asis"],
  "Quindio": ["Armenia", "Calarca", "Montenegro"],
  "Risaralda": ["Pereira", "Dosquebradas", "Santa Rosa de Cabal"],
  "San Andres": ["San Andres", "Providencia"],
  "Santander": ["Bucaramanga", "Floridablanca", "Giron", "Piedecuesta", "Barrancabermeja"],
  "Sucre": ["Sincelejo", "Corozal", "Sampues"],
  "Tolima": ["Ibague", "Espinal", "Melgar", "Honda"],
  "Valle del Cauca": ["Cali", "Buenaventura", "Palmira", "Tulua", "Buga", "Cartago"],
  "Vaupes": ["Mitu"],
  "Vichada": ["Puerto Carreno"],
};

export default function FormularioPedido({ producto, siteId, productoId, primaryColor, tallaInicial, colorInicial }: { producto: any; siteId: string; productoId: string; primaryColor: string; tallaInicial?: string; colorInicial?: string }) {
  const pathname = usePathname();
  const hrefVolver = pathname.replace(/\/pedido$/, "");
  const [cantidad, setCantidad] = useState(1);
  const [departamento, setDepartamento] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [form, setForm] = useState({ nombre: "", apellido: "", direccion: "", barrio: "", casa: "", telefono: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const tallaSeleccionada = tallaInicial ?? "";
  const colorSeleccionado = colorInicial ?? "";

  const ofertasConfig = producto.ofertas ?? [
    { cantidad: 1, descuento: 0, oculta: false },
    { cantidad: 2, descuento: 15, oculta: false },
    { cantidad: 3, descuento: 25, oculta: false },
    { cantidad: 4, descuento: 35, oculta: false },
  ];
  const ofertas = ofertasConfig
    .filter((o: any) => !o.oculta)
    .map((o: any) => ({
      cantidad: o.cantidad,
      descuento: o.descuento,
      label: o.cantidad === 1 ? "1 unidad" : `${o.cantidad} unidades + envio Gratis`,
    }));

  const precioBase = parseFloat((producto.precio ?? "0").replace(/[^0-9]/g, "")) || 0;
  const ofertaActual = ofertas.find((o: any) => o.cantidad === cantidad) ?? ofertas[0];
  const precioTotal = precioBase * cantidad * (1 - ofertaActual.descuento / 100);

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
          nombre: `${form.nombre} ${form.apellido}`,
          telefono: form.telefono,
          ciudad: `${departamento} - ${ciudad}`,
          barrio: form.barrio,
          direccion: `${form.direccion} ${form.casa}`,
          notas: ""
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
    <div style={{ padding: "1rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" style={{ marginBottom: "1rem" }}>
        <circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/>
      </svg>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#16a34a", marginBottom: "0.5rem" }}>Pedido recibido</h2>
      <p style={{ color: "#555", textAlign: "center" }}>Nos comunicaremos contigo al <strong>{form.telefono}</strong> para coordinar la entrega.</p>
      <Link href={hrefVolver} style={{ marginTop: "1.5rem", padding: "10px 24px", background: "#f3f4f6", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 600, textDecoration: "none", color: "#111" }}>Volver al producto</Link>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {producto.imagenes?.[0] && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f8f9fa", borderRadius: 12, padding: "12px" }}>
          <img src={producto.imagenes[0]} alt={producto.nombre} style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111", margin: 0 }}>{producto.nombre}</p>
            {tallaSeleccionada && <p style={{ fontSize: "0.8rem", color: "#888", margin: 0 }}>Talla: {tallaSeleccionada}</p>}
            {colorSeleccionado && <p style={{ fontSize: "0.8rem", color: "#888", margin: 0 }}>Color: {colorSeleccionado}</p>}
            <p style={{ fontSize: "1rem", fontWeight: 800, color: "#111", margin: 0 }}>${precioTotal.toLocaleString("es-CO")}</p>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#111", textTransform: "uppercase", letterSpacing: 1 }}>Selecciona tu oferta</p>
        {ofertas.map((o: any) => {
          const precioOferta = precioBase * o.cantidad * (1 - o.descuento / 100);
          const precioSinDesc = precioBase * o.cantidad;
          const seleccionado = cantidad === o.cantidad;
          return (
            <div key={o.cantidad} onClick={() => setCantidad(o.cantidad)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: `2px solid ${seleccionado ? primaryColor : "#e5e7eb"}`, borderRadius: 12, cursor: "pointer", background: seleccionado ? `${primaryColor}08` : "#fff", transition: "all 0.15s" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${seleccionado ? primaryColor : "#d1d5db"}`, background: seleccionado ? primaryColor : "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {seleccionado && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#111", margin: 0 }}>{o.label}</p>
                {o.descuento > 0 && <span style={{ fontSize: "0.75rem", background: primaryColor, color: "#fff", padding: "1px 8px", borderRadius: 999, fontWeight: 700 }}>Ahorra {o.descuento}%</span>}
              </div>
              <div style={{ textAlign: "right" }}>
                {o.descuento > 0 && <p style={{ fontSize: "0.8rem", color: "#aaa", textDecoration: "line-through", margin: 0 }}>${precioSinDesc.toLocaleString("es-CO")}</p>}
                <p style={{ fontSize: "1rem", fontWeight: 800, color: "#111", margin: 0 }}>${precioOferta.toLocaleString("es-CO")}</p>
              </div>
            </div>
          );
        })}
      </div>

      <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111", margin: 0 }}>Datos de entrega</h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#555" }}>Nombre *</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 12px", background: "#f8fafc" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <input name="nombre" required value={form.nombre} onChange={handleChange} placeholder="Nombre" style={{ border: "none", background: "transparent", fontSize: "0.9rem", outline: "none", width: "100%" }} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#555" }}>Apellido *</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 12px", background: "#f8fafc" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <input name="apellido" required value={form.apellido} onChange={handleChange} placeholder="Apellido" style={{ border: "none", background: "transparent", fontSize: "0.9rem", outline: "none", width: "100%" }} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#555" }}>Direccion *</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 12px", background: "#f8fafc" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <input name="direccion" required value={form.direccion} onChange={handleChange} placeholder="Direccion" style={{ border: "none", background: "transparent", fontSize: "0.9rem", outline: "none", width: "100%" }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#555" }}>Departamento *</label>
        <select required value={departamento} onChange={e => { setDepartamento(e.target.value); setCiudad(""); }} style={{ border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 12px", background: "#f8fafc", fontSize: "0.9rem", outline: "none" }}>
          <option value="">Departamento</option>
          {Object.keys(DEPARTAMENTOS).sort().map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#555" }}>Ciudad *</label>
        <select required value={ciudad} onChange={e => setCiudad(e.target.value)} style={{ border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 12px", background: "#f8fafc", fontSize: "0.9rem", outline: "none" }}>
          <option value="">Ciudad</option>
          {(DEPARTAMENTOS[departamento] ?? []).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#555" }}>Barrio *</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 12px", background: "#f8fafc" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <input name="barrio" required value={form.barrio} onChange={handleChange} placeholder="Barrio" style={{ border: "none", background: "transparent", fontSize: "0.9rem", outline: "none", width: "100%" }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#555" }}>Casa o Apartamento *</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 12px", background: "#f8fafc" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <input name="casa" required value={form.casa} onChange={handleChange} placeholder="Casa o Apartamento" style={{ border: "none", background: "transparent", fontSize: "0.9rem", outline: "none", width: "100%" }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#555" }}>Telefono *</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 12px", background: "#f8fafc" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 13.1a19.79 19.79 0 01-3.07-8.67A2 2 0 013.62 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
          <input name="telefono" required value={form.telefono} onChange={handleChange} placeholder="Telefono" type="tel" style={{ border: "none", background: "transparent", fontSize: "0.9rem", outline: "none", width: "100%" }} />
        </div>
      </div>

      <div style={{ background: "#f8f9fa", borderRadius: 12, padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: "0.85rem", color: "#555" }}>Subtotal</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>${precioTotal.toLocaleString("es-CO")}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: "0.85rem", color: "#555" }}>Envio</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#16a34a" }}>GRATIS</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e5e7eb", paddingTop: 8, marginTop: 4 }}>
          <span style={{ fontSize: "1rem", fontWeight: 800, color: "#111" }}>Total</span>
          <span style={{ fontSize: "1rem", fontWeight: 800, color: "#111" }}>${precioTotal.toLocaleString("es-CO")}</span>
        </div>
      </div>

      {error && <p style={{ color: "#ef4444", fontSize: "0.85rem" }}>{error}</p>}

      <div style={{ display: "flex", gap: 8 }}>
        <Link href={hrefVolver} style={{ flex: 1, padding: 14, background: "#f3f4f6", border: "none", borderRadius: 12, fontSize: "0.95rem", fontWeight: 600, cursor: "pointer", textAlign: "center", textDecoration: "none", color: "#111" }}>Atras</Link>
        <button type="submit" disabled={loading} style={{ flex: 2, padding: 14, background: primaryColor, color: "#fff", border: "none", borderRadius: 12, fontSize: "0.95rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Enviando..." : "Confirmar pedido"}
        </button>
      </div>
    </form>
  );
}