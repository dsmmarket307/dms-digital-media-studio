"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCarrito } from "../../context/CarritoContext";
import CarritoDrawer from "./CarritoDrawer";

function Estrellas({ valor }: { valor: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i <= valor ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

export default function DetalleCliente({ producto, siteId, productoId, primaryColor, vendidos, promedio, totalResenas }: { producto: any; siteId: string; productoId: string; primaryColor: string; vendidos: number; promedio: number; totalResenas: number }) {
  const { agregar } = useCarrito();
  const [tallaSeleccionada, setTallaSeleccionada] = useState("");
  const [colorSeleccionado, setColorSeleccionado] = useState("");

  const tallas = producto.tallas ? producto.tallas.split(",").map((t: string) => t.trim()).filter(Boolean) : [];
  const colores = producto.colores ? producto.colores.split(",").map((c: string) => c.trim()).filter(Boolean) : [];

  const pathname = usePathname();
  const paramsPedido = new URLSearchParams();
  if (tallaSeleccionada) paramsPedido.set("talla", tallaSeleccionada);
  if (colorSeleccionado) paramsPedido.set("color", colorSeleccionado);
  const hrefPedido = `${pathname}/pedido${paramsPedido.toString() ? `?${paramsPedido.toString()}` : ""}`;

  return (
    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <style>{`.desc-producto font[size="1"]{font-size:0.75rem} .desc-producto font[size="2"]{font-size:0.875rem} .desc-producto font[size="3"]{font-size:1rem} .desc-producto font[size="4"]{font-size:1.25rem} .desc-producto font[size="5"]{font-size:1.5rem} .desc-producto font[size="6"]{font-size:2rem} .desc-producto font[size="7"]{font-size:2.5rem}`}</style>

      <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#111", lineHeight: 1.3 }}>{producto.nombre}</h1>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <Estrellas valor={Math.round(promedio)} />
        <span style={{ fontSize: "0.85rem", color: "#666" }}>({totalResenas} resena{totalResenas !== 1 ? "s" : ""})</span>
        {vendidos > 0 && <span style={{ fontSize: "0.85rem", color: "#888" }}>· +{vendidos} vendidos</span>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <p style={{ fontSize: "2rem", fontWeight: 800, color: "#111" }}>{producto.precio}</p>
        {producto.precio_anterior && (
          <>
            <p style={{ fontSize: "1.3rem", color: "#aaa", textDecoration: "line-through" }}>{producto.precio_anterior}</p>
            <span style={{ background: "#fee2e2", color: "#dc2626", fontSize: "0.8rem", fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>Oferta</span>
          </>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 0", borderTop: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0" }}>
        {[
          { icon: "🚚", text: "Envio GRATIS" },
          { icon: "💵", text: "Pago Contra Entrega" },
          { icon: "🔒", text: "Compra 100% Segura" },
          { icon: "⭐", text: "Calidad Garantizada" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "1rem" }}>{item.icon}</span>
            <span style={{ fontSize: "0.85rem", color: "#555", fontWeight: 500 }}>{item.text}</span>
          </div>
        ))}
      </div>

      {colores.length > 0 && (
        <div>
          <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#111", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Color</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {colores.map((col: string, j: number) => (
              <button key={j} onClick={() => setColorSeleccionado(col)} style={{ padding: "8px 18px", borderRadius: 8, border: `2px solid ${colorSeleccionado === col ? "#111" : "#e5e7eb"}`, background: colorSeleccionado === col ? "#111" : "#fff", color: colorSeleccionado === col ? "#fff" : "#111", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>{col}</button>
            ))}
          </div>
        </div>
      )}

      {tallas.length > 0 && (
        <div>
          <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#111", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Talla</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {tallas.map((t: string, j: number) => (
              <button key={j} onClick={() => setTallaSeleccionada(t)} style={{ padding: "8px 18px", borderRadius: 8, border: `2px solid ${tallaSeleccionada === t ? "#111" : "#e5e7eb"}`, background: tallaSeleccionada === t ? "#111" : "#fff", color: tallaSeleccionada === t ? "#fff" : "#111", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>{t}</button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
        <Link href={hrefPedido} style={{ display: "block", textAlign: "center", width: "100%", padding: 16, background: primaryColor, color: "#fff", border: "none", borderRadius: 12, fontSize: "1rem", fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 14px ${primaryColor}44`, textDecoration: "none" }}>
          {producto.boton_texto ?? "Realizar Pedido"}
        </Link>
        <button onClick={() => agregar({ productoIndex: 0, nombre: producto.nombre, precio: producto.precio, imagen: producto.imagenes?.[0] ?? "", talla: tallaSeleccionada, color: colorSeleccionado, cantidad: 1 })} style={{ width: "100%", padding: 16, background: "#fff", color: "#111", border: "2px solid #111", borderRadius: 12, fontSize: "1rem", fontWeight: 700, cursor: "pointer" }}>
          Agregar al carrito
        </button>
      </div>

      {producto.descripcion && (
        <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "1rem", marginTop: "0.5rem" }}>
          <div className="desc-producto" style={{ color: "#555", lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: producto.descripcion ?? "" }} />
        </div>
      )}

      <CarritoDrawer primaryColor={primaryColor} siteId={siteId} />
    </div>
  );
}