"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type Step = "form" | "preview" | "sending" | "done";

export default function MarketingPage() {
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ segmento: "todos", tono: "profesional", objetivo: "" });
  const [campaign, setCampaign] = useState<any>(null);
  const [sendResult, setSendResult] = useState<any>(null);

  const inputStyle = { width: "100%", background: "#f9f9f9", border: "1px solid rgba(124,58,237,0.15)", borderRadius: 8, padding: "10px 14px", color: "#111", fontSize: 14, outline: "none", boxSizing: "border-box" as const, fontFamily: "Inter, sans-serif" };
  const labelStyle = { display: "block", color: "#555", fontSize: 11, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.5px" };

  const handleGenerate = async () => {
    setError("");
    if (!form.objetivo) { setError("Escribe el objetivo de la campana."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-campaign", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segment: form.segmento, tone: form.tono, objective: form.objetivo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al generar");
      setCampaign(data.campaign);
      setStep("preview");
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleSend = async () => {
    setStep("sending");
    try {
      const res = await fetch("/api/email/send-campaign", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segment: form.segmento, campaign }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al enviar");
      setSendResult(data);
      setStep("done");
    } catch (e: any) { setError(e.message); setStep("preview"); }
  };

  const reset = () => { setStep("form"); setCampaign(null); setSendResult(null); setError(""); setForm({ segmento: "todos", tono: "profesional", objetivo: "" }); };

  const steps = ["form", "preview", "sending", "done"];
  const stepLabels = ["Configurar", "Preview", "Enviando", "Listo"];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "2.5rem 2rem", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        <div style={{ marginBottom: "2rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(124,58,237,0.15)" }}>
          <a href="/dashboard/admin" style={{ fontSize: "0.75rem", color: "#999", textDecoration: "none" }}>← Dashboard</a>
          <p style={{ fontSize: "0.65rem", letterSpacing: "3px", textTransform: "uppercase", color: "#7c3aed", margin: "0.75rem 0 0.25rem", fontWeight: 600 }}>Administrador</p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#111", margin: 0 }}>Centro Marketing IA</h1>
          <p style={{ color: "#555", fontSize: 13, margin: "6px 0 0" }}>Campanas automaticas con IA para clientes de DMS Digital Studio</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
          {stepLabels.map((label, i) => {
            const current = steps.indexOf(step);
            const active = i === current;
            const done = i < current;
            return (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: active ? "#7c3aed" : done ? "rgba(124,58,237,0.1)" : "rgba(0,0,0,0.04)", color: active ? "#fff" : done ? "#7c3aed" : "#999", border: `1px solid ${active ? "#7c3aed" : done ? "rgba(124,58,237,0.3)" : "rgba(0,0,0,0.08)"}` }}>
                  {done ? <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> : <span>{i + 1}</span>}
                  {label}
                </div>
                {i < 3 && <div style={{ width: 16, height: 1, background: done ? "rgba(124,58,237,0.3)" : "rgba(0,0,0,0.1)" }} />}
              </div>
            );
          })}
        </div>

        {error && <div style={{ marginBottom: 16, padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, color: "#ef4444", fontSize: 13 }}>{error}</div>}

        {step === "form" && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(124,58,237,0.1)", padding: 28 }}>
            <h2 style={{ color: "#111", fontSize: 15, fontWeight: 700, margin: "0 0 22px" }}>Configurar campana</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={labelStyle}>Audiencia</label>
                <select style={inputStyle} value={form.segmento} onChange={e => setForm({ ...form, segmento: e.target.value })}>
                  <option value="todos">Todos los clientes</option>
                  <option value="activos">Clientes con proyectos activos</option>
                  <option value="leads">Leads sin convertir</option>
                  <option value="inactivos">Clientes inactivos</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tono</label>
                <select style={inputStyle} value={form.tono} onChange={e => setForm({ ...form, tono: e.target.value })}>
                  <option value="profesional">Profesional</option>
                  <option value="amigable">Amigable y cercano</option>
                  <option value="urgente">Urgente / Oferta limitada</option>
                  <option value="educativo">Educativo / Informativo</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Objetivo de la campana</label>
                <input style={inputStyle} placeholder="ej. Conseguir mas clientes para diseno web este mes" value={form.objetivo} onChange={e => setForm({ ...form, objetivo: e.target.value })} />
              </div>
            </div>
            <button onClick={handleGenerate} disabled={loading} style={{ marginTop: 24, width: "100%", background: loading ? "#e5e7eb" : "#7c3aed", color: loading ? "#999" : "#fff", border: "none", borderRadius: 10, padding: "13px 0", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Generando con IA..." : "Generar campana con IA"}
            </button>
          </div>
        )}

        {step === "preview" && campaign && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(124,58,237,0.1)", padding: 24 }}>
              <h2 style={{ color: "#111", fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>Copy generado por IA</h2>
              {[{ label: "Asunto", value: campaign.subject }, { label: "Titular", value: campaign.headline }, { label: "CTA", value: campaign.cta }].map(({ label, value }) => (
                <div key={label} style={{ marginBottom: 10, background: "#f9f9f9", borderRadius: 8, padding: "10px 14px", border: "1px solid rgba(0,0,0,0.06)" }}>
                  <span style={{ color: "#999", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</span>
                  <p style={{ color: "#111", fontSize: 13, margin: "3px 0 0", fontWeight: label === "Asunto" ? 600 : 400 }}>{value}</p>
                </div>
              ))}
              <div style={{ background: "#f9f9f9", borderRadius: 8, padding: "10px 14px", border: "1px solid rgba(0,0,0,0.06)" }}>
                <span style={{ color: "#999", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Cuerpo</span>
                <p style={{ color: "#555", fontSize: 13, margin: "3px 0 0", lineHeight: 1.6 }}>{campaign.body}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => { setStep("form"); setCampaign(null); }} style={{ flex: 1, background: "transparent", border: "1px solid rgba(0,0,0,0.1)", color: "#555", borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Volver</button>
              <button onClick={handleSend} style={{ flex: 1, background: "#059669", color: "#fff", border: "none", borderRadius: 10, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Enviar campana</button>
            </div>
          </div>
        )}

        {step === "sending" && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(124,58,237,0.1)", padding: 48, textAlign: "center" }}>
            <div style={{ width: 40, height: 40, border: "3px solid #ede9fe", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <h2 style={{ color: "#111", fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>Enviando campana...</h2>
            <p style={{ color: "#555", fontSize: 13 }}>Esto puede tomar unos segundos.</p>
          </div>
        )}

        {step === "done" && sendResult && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(124,58,237,0.1)", padding: 40, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, background: "rgba(5,150,105,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
            </div>
            <h2 style={{ color: "#111", fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>Campana enviada</h2>
            <p style={{ color: "#555", fontSize: 13, margin: "0 0 24px" }}>Enviada correctamente a tus clientes.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 28 }}>
              <div style={{ background: "#f5f5f5", borderRadius: 12, padding: "14px 24px" }}>
                <div style={{ color: "#059669", fontSize: 26, fontWeight: 700 }}>{sendResult.sentCount ?? 0}</div>
                <div style={{ color: "#555", fontSize: 11, marginTop: 4 }}>Enviados</div>
              </div>
              <div style={{ background: "#f5f5f5", borderRadius: 12, padding: "14px 24px" }}>
                <div style={{ color: "#7c3aed", fontSize: 26, fontWeight: 700 }}>{sendResult.total ?? 0}</div>
                <div style={{ color: "#555", fontSize: 11, marginTop: 4 }}>Total segmento</div>
              </div>
            </div>
            <button onClick={reset} style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Nueva campana</button>
          </div>
        )}
      </div>
    </div>
  );
}
