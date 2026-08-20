"use client";
import { useState } from "react";

export default function WhatsappWidget({ nombre, mensaje, link, color, rebote }: { nombre: string; mensaje: string; link: string; color: string; rebote?: boolean }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      {abierto && (
        <div style={{ position: "fixed", bottom: 96, right: 24, zIndex: 1000, width: 320, maxWidth: "calc(100vw - 32px)", background: "#fff", borderRadius: 16, boxShadow: "0 8px 30px rgba(0,0,0,0.25)", overflow: "hidden", fontFamily: "inherit" }}>
          <div style={{ background: color, color: "#fff", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Canal de atencion | {nombre}</span>
            <button onClick={() => setAbierto(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: 24, height: 24, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
              ✕
            </button>
          </div>
          <div style={{ padding: 16, background: "#f0f2f5" }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#333", lineHeight: 1.4, boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}>
              Hola, somos el equipo de {nombre}, ¿Como te podemos ayudar?
            </div>
          </div>
          <a href={link} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#111", color: "#fff", padding: "12px 16px", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
            Iniciar conversacion
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          </a>
        </div>
      )}
      {!abierto && (
        <span className="wa-globito" style={{ position: "fixed", bottom: 40, right: 158, zIndex: 999, background: "#fff", color: "#111", padding: "8px 14px", borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 16px rgba(0,0,0,0.2)", whiteSpace: "nowrap", pointerEvents: "none" }}>Hola! Escribinos</span>
      )}
      <button onClick={() => setAbierto(!abierto)} className={rebote && !abierto ? "wa-bounce-anim" : ""} style={{ position: "fixed", bottom: 24, right: 96, zIndex: 999, background: "#25D366", width: 56, height: 56, borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
      </button>
    </>
  );
}