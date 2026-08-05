"use client";
import { useState } from "react";

interface ContactoFormProps {
  siteId: string;
  userId?: string | null;
  destinoEmail: string;
  nombreNegocio?: string;
}

export default function ContactoForm({ siteId, userId, destinoEmail, nombreNegocio }: ContactoFormProps) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !mensaje) return;
    setEnviando(true);
    setError("");
    try {
      const res = await fetch("/api/formulario-contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          correo,
          telefono,
          mensaje,
          destino_email: destinoEmail,
          user_id: userId,
          site_id: siteId,
          nombre_negocio: nombreNegocio,
        }),
      });
      if (!res.ok) throw new Error();
      setEnviado(true);
      setNombre("");
      setCorreo("");
      setTelefono("");
      setMensaje("");
    } catch {
      setError("No se pudo enviar el mensaje. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="form">
        <h3 style={{ fontWeight: 800, fontSize: "1.25rem", marginBottom: "0.75rem", color: "#111" }}>Mensaje enviado</h3>
        <p style={{ color: "#555", fontSize: "0.9rem" }}>Gracias por escribirnos, te responderemos pronto.</p>
      </div>
    );
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h3 style={{ fontWeight: 800, fontSize: "1.25rem", marginBottom: "1.5rem", color: "#111" }}>Enviar mensaje</h3>
      <div className="form-group">
        <label>Nombre completo</label>
        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Correo electronico</label>
        <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Telefono</label>
        <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Mensaje</label>
        <textarea rows={4} style={{ resize: "none" }} value={mensaje} onChange={(e) => setMensaje(e.target.value)} required></textarea>
      </div>
      {error && <p style={{ color: "#ef4444", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{error}</p>}
      <button type="submit" className="form-btn" disabled={enviando}>{enviando ? "Enviando..." : "Enviar mensaje"}</button>
    </form>
  );
}