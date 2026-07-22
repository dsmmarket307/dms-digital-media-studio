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
  dispositivo: string | null;
  latitud: number | null;
  longitud: number | null;
  primera_actividad: string;
  ultima_actividad: string;
  generated_websites?: { project_name: string };
}

const UMBRAL_ACTIVA_MS = 45000;

function latLonAXY(lat: number, lon: number) {
  const x = ((lon + 180) / 360) * 100;
  const y = ((90 - lat) / 180) * 50;
  return { x, y };
}

function IconoDispositivo({ tipo }: { tipo: string | null }) {
  const s = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none" as const, stroke: "currentColor", strokeWidth: 2 };
  if (tipo === "Celular") return <svg {...s}><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/></svg>;
  if (tipo === "Tablet") return <svg {...s}><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
  return <svg {...s}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
}

export default function VisitasEnVivo() {
  const supabase = createClient();
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [loading, setLoading] = useState(true);
  const [ahora, setAhora] = useState(Date.now());
  const [statsPorSitio, setStatsPorSitio] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

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

  useEffect(() => {
    async function cargarStats() {
      const inicioAnio = new Date();
      inicioAnio.setFullYear(inicioAnio.getFullYear() - 1);
      const { data } = await supabase
        .from("visitas_historial")
        .select("site_id, creado_en, generated_websites(project_name)")
        .gte("creado_en", inicioAnio.toISOString());

      const ahoraFecha = new Date();
      const inicioHoy = new Date(ahoraFecha.getFullYear(), ahoraFecha.getMonth(), ahoraFecha.getDate());
      const inicioSemana = new Date(inicioHoy);
      inicioSemana.setDate(inicioSemana.getDate() - 7);
      const inicioMes = new Date(inicioHoy);
      inicioMes.setDate(inicioMes.getDate() - 30);
      const inicioAnioCorte = new Date(inicioHoy);
      inicioAnioCorte.setDate(inicioAnioCorte.getDate() - 365);

      const grupos: Record<string, { nombre: string; hoy: number; semana: number; mes: number; anio: number }> = {};
      (data ?? []).forEach((row: any) => {
        const fecha = new Date(row.creado_en);
        const nombre = row.generated_websites?.project_name ?? "Sitio sin nombre";
        if (!grupos[row.site_id]) grupos[row.site_id] = { nombre, hoy: 0, semana: 0, mes: 0, anio: 0 };
        if (fecha >= inicioHoy) grupos[row.site_id].hoy++;
        if (fecha >= inicioSemana) grupos[row.site_id].semana++;
        if (fecha >= inicioMes) grupos[row.site_id].mes++;
        if (fecha >= inicioAnioCorte) grupos[row.site_id].anio++;
      });

      const lista = Object.entries(grupos).map(([site_id, v]) => ({ site_id, ...v }));
      lista.sort((a, b) => b.mes - a.mes);
      setStatsPorSitio(lista);
      setLoadingStats(false);
    }
    cargarStats();
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
    const partes = [s.ciudad, s.pais].filter(Boolean);
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
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111" }}>Visitas en vivo</h1>
        <p style={{ color: "#666", fontSize: "0.9rem", marginTop: 4 }}>Personas navegando tus tiendas ahora mismo</p>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: "1.25rem", marginBottom: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", overflowX: "auto" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#333", marginBottom: 14, marginTop: 0 }}>Visitas por landing</h2>
        {loadingStats ? (
          <p style={{ color: "#aaa", fontSize: 13 }}>Cargando estadisticas...</p>
        ) : statsPorSitio.length === 0 ? (
          <p style={{ color: "#aaa", fontSize: 13 }}>Aun no hay datos de visitas registrados.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                <th style={{ textAlign: "left", padding: "8px 10px", color: "#888", fontWeight: 700 }}>Sitio</th>
                <th style={{ textAlign: "right", padding: "8px 10px", color: "#888", fontWeight: 700 }}>Hoy</th>
                <th style={{ textAlign: "right", padding: "8px 10px", color: "#888", fontWeight: 700 }}>Semana</th>
                <th style={{ textAlign: "right", padding: "8px 10px", color: "#888", fontWeight: 700 }}>Mes</th>
                <th style={{ textAlign: "right", padding: "8px 10px", color: "#888", fontWeight: 700 }}>Anio</th>
              </tr>
            </thead>
            <tbody>
              {statsPorSitio.map(s => (
                <tr key={s.site_id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "8px 10px", fontWeight: 600, color: "#111" }}>{s.nombre}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", color: "#555" }}>{s.hoy}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", color: "#555" }}>{s.semana}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", color: "#555" }}>{s.mes}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", color: "#555" }}>{s.anio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#16a34a", animation: "pulse 1.5s infinite" }} />
        <span style={{ fontSize: 22, fontWeight: 800, color: "#111" }}>{sesionesActivas.length}</span>
        <span style={{ fontSize: 13, color: "#666" }}>{sesionesActivas.length === 1 ? "persona activa ahora" : "personas activas ahora"}</span>
        <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
      </div>

      <div style={{ background: "#0f172a", borderRadius: 16, padding: "1rem", marginBottom: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.1)", position: "relative", overflow: "hidden" }}>
        <svg viewBox="0 0 100 50" style={{ width: "100%", height: "auto", display: "block" }}>
          <rect x="0" y="0" width="100" height="50" fill="#0f172a" />
          <image
            href="https://commons.wikimedia.org/wiki/Special:FilePath/BlankMap-Equirectangular.svg"
            x="0" y="0" width="100" height="50"
            preserveAspectRatio="none"
            style={{ filter: "invert(1) grayscale(1) brightness(0.55) contrast(1.4)", opacity: 0.85 }}
          />

          {sesionesActivas.filter(s => s.latitud != null && s.longitud != null).map(s => {
            const { x, y } = latLonAXY(s.latitud!, s.longitud!);
            return (
              <g key={s.session_id}>
                <circle cx={x} cy={y} r="1.6" fill="#16a34a" opacity="0.3">
                  <animate attributeName="r" values="1.6;3.5;1.6" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx={x} cy={y} r="1" fill="#22c55e" stroke="#fff" strokeWidth="0.3" />
              </g>
            );
          })}
        </svg>
        {sesionesActivas.filter(s => s.latitud != null).length === 0 && (
          <p style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: "#64748b", fontSize: 12, margin: 0 }}>
            Esperando ubicaciones...
          </p>
        )}
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
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#888" }}>
                    <IconoDispositivo tipo={s.dispositivo} />
                    {s.dispositivo ?? "Desconocido"}
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