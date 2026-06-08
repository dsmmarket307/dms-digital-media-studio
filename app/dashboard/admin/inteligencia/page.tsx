"use client";
import { useState } from "react";

const SECCIONES = [
  { id: "metas", label: "Metas del Mes", color: "#7c3aed" },
  { id: "estrategias", label: "Estrategias de Crecimiento", color: "#7c3aed" },
  { id: "contenido", label: "Calendario de Contenido", color: "#7c3aed" },
  { id: "proyecciones", label: "Proyecciones Financieras", color: "#7c3aed" },
  { id: "clientes", label: "Retencion de Clientes", color: "#059669" },
];

export default function InteligenciaPage() {
  const [activa, setActiva] = useState("metas");
  const [resultados, setResultados] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  async function generar(id: string) {
    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch("/api/ai-business-manager", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: id, negocio: "DMS Digital Studio", tipo: "agencia digital" }),
      });
      const data = await res.json();
      setResultados(prev => ({ ...prev, [id]: data.resultado ?? "Sin resultado" }));
    } catch {
      setResultados(prev => ({ ...prev, [id]: "Error al generar. Intenta de nuevo." }));
    }
    setLoading(prev => ({ ...prev, [id]: false }));
  }

  const seccionActiva = SECCIONES.find(s => s.id === activa);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "2.5rem 2rem", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div style={{ marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(124,58,237,0.15)" }}>
          <a href="/dashboard/admin" style={{ fontSize: "0.75rem", color: "#999", textDecoration: "none" }}>? Dashboard</a>
          <p style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: "#7c3aed", margin: "0.75rem 0 0.25rem", fontWeight: 600 }}>Inteligencia Artificial</p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#111", margin: 0 }}>Centro de Inteligencia</h1>
          <p style={{ color: "#555", fontSize: 13, margin: "6px 0 0" }}>Analitica, metas y proyecciones generadas con IA para DMS Digital Studio</p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {SECCIONES.map(s => (
            <button key={s.id} onClick={() => setActiva(s.id)} style={{ padding: "0.6rem 1.1rem", borderRadius: 10, cursor: "pointer", background: activa === s.id ? "#7c3aed" : "#fff", color: activa === s.id ? "#fff" : "#555", fontSize: "0.8rem", fontWeight: activa === s.id ? 700 : 500, border: `1px solid ${activa === s.id ? "#7c3aed" : "rgba(124,58,237,0.1)"}` }}>
              {s.label}
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(124,58,237,0.1)", overflow: "hidden" }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(124,58,237,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <p style={{ fontSize: "0.65rem", color: "#999", textTransform: "uppercase", letterSpacing: "2px", margin: 0, fontWeight: 600 }}>IA Business Manager</p>
              <p style={{ fontSize: "1rem", fontWeight: 700, color: "#111", margin: "4px 0 0" }}>{seccionActiva?.label}</p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {resultados[activa] && (
                <button onClick={() => navigator.clipboard.writeText(resultados[activa])} style={{ padding: "0.6rem 1rem", background: "transparent", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, color: "#555", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                  Copiar
                </button>
              )}
              <button onClick={() => generar(activa)} disabled={loading[activa]} style={{ padding: "0.6rem 1.25rem", background: loading[activa] ? "#f5f5f5" : "#7c3aed", border: "none", borderRadius: 8, color: loading[activa] ? "#999" : "#fff", fontSize: "0.8rem", fontWeight: 700, cursor: loading[activa] ? "not-allowed" : "pointer" }}>
                {loading[activa] ? "Generando..." : resultados[activa] ? "Regenerar" : "Generar con IA"}
              </button>
            </div>
          </div>

          <div style={{ padding: "1.5rem" }}>
            {!resultados[activa] && !loading[activa] && (
              <div style={{ padding: "3rem", textAlign: "center", border: "1px dashed rgba(124,58,237,0.2)", borderRadius: 12 }}>
                <p style={{ color: "#555", fontSize: "0.875rem", margin: "0 0 4px" }}>Haz clic en "Generar con IA" para obtener {seccionActiva?.label}</p>
                <p style={{ color: "#999", fontSize: "0.75rem", margin: 0 }}>Basado en datos reales de DMS Digital Studio</p>
              </div>
            )}
            {loading[activa] && (
              <div style={{ padding: "3rem", textAlign: "center" }}>
                <div style={{ width: 36, height: 36, border: "3px solid #ede9fe", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ color: "#7c3aed", fontSize: "0.875rem" }}>Analizando datos del estudio...</p>
              </div>
            )}
            {resultados[activa] && !loading[activa] && (
              <div style={{ background: "#f9f9f9", borderRadius: 10, padding: "1.5rem", border: "1px solid rgba(124,58,237,0.08)" }}>
                <pre style={{ color: "#333", fontSize: "0.875rem", lineHeight: 1.8, whiteSpace: "pre-wrap", fontFamily: "Inter, sans-serif", margin: 0 }}>{resultados[activa]}</pre>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button onClick={() => SECCIONES.forEach(s => generar(s.id))} style={{ padding: "0.75rem 1.5rem", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 10, color: "#7c3aed", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
            Generar todo con IA
          </button>
          <button onClick={() => {
            const todo = SECCIONES.map(s => `=== ${s.label.toUpperCase()} ===\n${resultados[s.id] ?? "No generado"}`).join("\n\n");
            const blob = new Blob([todo], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = "inteligencia-dms-" + new Date().toLocaleDateString("es-CO").replace(/\//g, "-") + ".txt"; a.click();
          }} style={{ padding: "0.75rem 1.5rem", background: "transparent", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 10, color: "#555", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
            Descargar reporte
          </button>
        </div>

      </div>
    </div>
  );
}


