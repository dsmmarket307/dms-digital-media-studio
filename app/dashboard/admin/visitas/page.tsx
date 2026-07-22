"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Sesion {
  id: string;
  site_id: string;
  session_id: string;
  pagina: string;
  producto_nombre: string | null;
  ciudad: string | null;
  region: string | null;
  pais: string | null;
  primera_actividad: string;
  ultima_actividad: string;
  generated_websites?: { project_name: string };
}

const UMBRAL_ACTIVA_MS = 45000;

export default function VisitasEnVivo() {
  const supabase = createClient();
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [loading, setLoading] = useState(true);
  const [ahora, setAhora] = useState(Date.now());

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from("sesiones_activas")
        .select("*, generated_websites(project_name)")
        .order("ultima_actividad", { ascending: false });
      setSesiones(data ?? []);
      setLoading(false);
    }
    cargar();

    const canal = supabase
      .channel("sesiones_activas_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "sesiones_activas" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setSesiones(prev => [payload.new as Sesion, ...prev.filter(s => s.session_id !== (payload.new as any).session_id)]);
        } else if (payload.eventType === "UPDATE") {
          setSesiones(prev => prev.map(s => s.session_id === (payload.new as any).session_id ? { ...s, ...(payload.new as any) } : s));
        } else if (payload.eventType === "DELETE") {
          setSesiones(prev => prev.filter(s => s.id !== (payload.old as any).id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(canal); };
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  const sesionesActivas = sesiones.filter(s => ahora - new Date(s.ultima_actividad).getTime() < UMBRAL_ACTIVA_MS);
  const sesionesRecientes = sesiones.filter(s => ahora - new Date(s.ultima_actividad).getTime() >= UMBRAL_ACTIVA_MS).slice(0, 20);

  function tiempoActivo(fecha: string) {
    const segundos = Math.floor((ahora - new Date(fecha).getTime()) / 1000);
    if (segundos < 60) return segundos + "s";
    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return minutos + "m";
    return Math.floor(minutos / 60) + "h";
  }

  function ubicacion(s: Sesion) {
    const partes = [s.ciudad, s.region, s.pais].filter(Boolean);
    return partes.length > 0 ? partes.join(", ") : "Ubicacion desconocida";
  }

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ padding: "2rem", fontFamily: "'Segoe UI', sans-serif", background: "#f8f9fa", minHeight: "100vh" }}>
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 10 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111" }}>Visitas en vivo</h1>
          <p style={{ color: "#666", fontSize: "0.9rem", marginTop: 4 }}>Personas navegando tus tiendas ahora mismo</p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#16a34a", animation: "pulse 1.5s infinite" }} />
        <span style={{ fontSize: 22, fontWeight: 800, color: "#111" }}>{sesionesActivas.length}</span>
        <span style={{ fontSize: 13, color: "#666" }}>{sesionesActivas.length === 1 ? "persona activa ahora" : "personas activas ahora"}</span>
        <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
      </div>

      {sesionesActivas.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 2rem", background: "#fff", borderRadius: 16, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", marginBottom: 24 }}>
          <p style={{ color: "#888", fontWeight: 600 }}>No hay nadie navegando en este momento</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 30 }}>
          {sesionesActivas.map(s => (
            <div key={s.session_id} style={{ background: "#fff", borderRadius: 14, padding: "1rem 1.25rem", boxShadow: "0 2px 16px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", borderLeft: "3px solid #16a34a" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111" }}>
                    {s.generated_websites?.project_name ?? "Tienda"}
                  </span>
                  <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 20, background: "#dcfce7", color: "#16a34a", fontWeight: 700 }}>
                    En vivo
                  </span>
                  <span style={{ fontSize: 11, color: "#888" }}>
                    {s.pagina === "producto" ? "Viendo: " + (s.producto_nombre ?? "producto") : "En el inicio"}
                  </span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "#666" }}>
                  {ubicacion(s)} • Activo hace {tiempoActivo(s.ultima_actividad)}
                </div>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#aaa", textAlign: "right" }}>
                {new Date(s.primera_actividad).toLocaleTimeString("es-CO")}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#555", marginBottom: 12 }}>Actividad reciente</h2>
      {sesionesRecientes.length === 0 ? (
        <p style={{ color: "#aaa", fontSize: 13 }}>Sin actividad reciente todavia.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sesionesRecientes.map(s => (
            <div key={s.session_id} style={{ background: "#fff", borderRadius: 12, padding: "0.75rem 1rem", boxShadow: "0 1px 8px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", opacity: 0.75 }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#333" }}>
                  {s.generated_websites?.project_name ?? "Tienda"}
                </span>
                <span style={{ fontSize: 12, color: "#999", marginLeft: 8 }}>
                  {s.pagina === "producto" ? "Vio: " + (s.producto_nombre ?? "producto") : "Vio el inicio"}
                </span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#aaa" }}>
                {ubicacion(s)} • {new Date(s.ultima_actividad).toLocaleString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}