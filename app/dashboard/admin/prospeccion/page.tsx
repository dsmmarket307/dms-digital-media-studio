"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const CATEGORIAS = ["Restaurante", "Hotel", "Inmobiliaria", "Barberia", "Odontologia", "Gimnasio", "Spa", "Farmacia", "Consultorio", "Abogados", "Contaduria", "Tienda", "Salon de Belleza", "Mecanica", "Construccion", "Educacion", "Turismo", "Tecnologia", "Otro"];

export default function ProspeccionIA() {
  const supabase = createClient();
  const [form, setForm] = useState({ nombre: "", categoria: "Restaurante", ciudad: "", telefono: "", sitio_web: "", facebook: "", instagram: "", whatsapp: "" });
  const [analizando, setAnalizando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState("");
  const [mapsForm, setMapsForm] = useState({ ciudad: "", categoria: "Restaurante", cantidad: "10" });
  const [mapsLoading, setMapsLoading] = useState(false);
  const [mapsResult, setMapsResult] = useState<any>(null);

  async function handleAnalizar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre || !form.ciudad) { setError("Nombre y ciudad son requeridos."); return; }
    setAnalizando(true);
    setError("");
    setResultado(null);
    setGuardado(false);
    try {
      const res = await fetch("/api/prospeccion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setResultado(data.data);
    } catch (e: any) {
      setError("Error al analizar. Intenta nuevamente.");
    } finally {
      setAnalizando(false);
    }
  }

  async function handleGuardar() {
    if (!resultado) return;
    setGuardando(true);
    await supabase.from("prospectos").insert({
      nombre: form.nombre,
      categoria: form.categoria,
      ciudad: form.ciudad,
      telefono: form.telefono,
      sitio_web: form.sitio_web,
      facebook: form.facebook,
      instagram: form.instagram,
      whatsapp: form.whatsapp,
      puntaje_digital: resultado.puntaje_digital,
      nivel: resultado.nivel,
      oportunidades: resultado.oportunidades,
      servicio_recomendado: resultado.servicio_recomendado,
      prioridad: resultado.prioridad,
      probabilidad: resultado.probabilidad,
      diagnostico_ia: resultado,
      estado_crm: "nuevo",
    });
    setGuardado(true);
    setGuardando(false);
  }

  async function buscarEnMaps() {
    setMapsLoading(true);
    setMapsResult(null);
    const res = await fetch("/api/prospeccion/buscar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mapsForm),
    });
    const data = await res.json();
    setMapsResult(data);
    setMapsLoading(false);
  }

  const NIVEL_COLORS: Record<string, string> = { bajo: "#EF4444", medio: "#F59E0B", alto: "#10B981" };
  const PRIORIDAD_COLORS: Record<string, string> = { alta: "#EF4444", media: "#F59E0B", baja: "#10B981" };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Prospeccion IA</h1>
        <p className="text-gray-500 text-xs mt-0.5">Analiza negocios potenciales con inteligencia artificial</p>
      </header>

      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        <div style={{ background: "#f0f4ff", border: "1px solid #c7d2fe", borderRadius: "16px", padding: "1.5rem", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.25rem", color: "#3730a3" }}>Importar desde Google Maps</h2>
          <p style={{ fontSize: "0.78rem", color: "#6366f1", marginBottom: "1rem" }}>Busca negocios reales y los importa automaticamente al CRM con diagnostico IA</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px", gap: "0.75rem", marginBottom: "1rem" }}>
            <input value={mapsForm.ciudad} onChange={e => setMapsForm({...mapsForm, ciudad: e.target.value})} placeholder="Ciudad (ej: Pereira)" style={{ padding: "0.75rem 1rem", border: "1px solid #c7d2fe", borderRadius: "8px", fontSize: "0.875rem", outline: "none" }} />
            <select value={mapsForm.categoria} onChange={e => setMapsForm({...mapsForm, categoria: e.target.value})} style={{ padding: "0.75rem 1rem", border: "1px solid #c7d2fe", borderRadius: "8px", fontSize: "0.875rem", outline: "none" }}>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="number" min="1" max="20" value={mapsForm.cantidad} onChange={e => setMapsForm({...mapsForm, cantidad: e.target.value})} style={{ padding: "0.75rem 1rem", border: "1px solid #c7d2fe", borderRadius: "8px", fontSize: "0.875rem", outline: "none" }} />
          </div>
          <button onClick={buscarEnMaps} disabled={mapsLoading || !mapsForm.ciudad} style={{ background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", padding: "0.75rem 1.5rem", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", opacity: mapsLoading ? 0.7 : 1 }}>
            {mapsLoading ? "Buscando en Google Maps..." : "Buscar Negocios en Google Maps"}
          </button>
          {mapsResult && !mapsResult.error && (
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
              {[["Encontrados", mapsResult.encontrados, "#3b82f6"], ["Importados", mapsResult.importados, "#10b981"], ["Actualizados", mapsResult.actualizados, "#f59e0b"], ["Alta Oportunidad", mapsResult.alta_oportunidad, "#ef4444"]].map(([l, v, c]) => (
                <div key={l as string} style={{ background: "#fff", borderRadius: "10px", padding: "0.75rem 1.25rem", textAlign: "center", border: `2px solid ${c}30`, minWidth: "100px" }}>
                  <p style={{ fontSize: "1.5rem", fontWeight: 800, color: c as string }}>{v as number}</p>
                  <p style={{ fontSize: "0.7rem", color: "#666" }}>{l as string}</p>
                </div>
              ))}
            </div>
          )}
          {mapsResult?.error && <p style={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "0.75rem" }}>{mapsResult.error}</p>}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 text-lg mb-4">Datos del negocio</h2>
              {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
              <form onSubmit={handleAnalizar} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombre del negocio *</label>
                  <input type="text" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600" placeholder="Ej: Restaurante El Buen Sabor" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Categoria</label>
                    <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600">
                      {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ciudad *</label>
                    <input type="text" required value={form.ciudad} onChange={e => setForm({ ...form, ciudad: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600" placeholder="Pereira" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Telefono</label>
                    <input type="text" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600" placeholder="+57 300 000 0000" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">WhatsApp</label>
                    <input type="text" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600" placeholder="+57 300 000 0000" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sitio web</label>
                  <input type="text" value={form.sitio_web} onChange={e => setForm({ ...form, sitio_web: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600" placeholder="https://minegocio.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Facebook</label>
                    <input type="text" value={form.facebook} onChange={e => setForm({ ...form, facebook: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600" placeholder="facebook.com/negocio" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Instagram</label>
                    <input type="text" value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600" placeholder="@negocio" />
                  </div>
                </div>
                <button type="submit" disabled={analizando} className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors disabled:opacity-50">
                  {analizando ? "Analizando con IA..." : "Analizar Negocio con IA"}
                </button>
              </form>
            </div>
          </div>

          <div>
            {!resultado && !analizando && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.75"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                </div>
                <p className="text-gray-400 text-sm">Ingresa los datos del negocio y la IA generara un diagnostico completo</p>
              </div>
            )}

            {analizando && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <div style={{ width: 48, height: 48, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                <p className="text-gray-500 text-sm font-medium">La IA esta analizando el negocio...</p>
              </div>
            )}

            {resultado && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-900">Diagnostico Digital</h2>
                    <div className="text-right">
                      <p className="text-3xl font-bold" style={{ color: NIVEL_COLORS[resultado.nivel] }}>{resultado.puntaje_digital}/100</p>
                      <p className="text-xs font-semibold uppercase" style={{ color: NIVEL_COLORS[resultado.nivel] }}>Nivel {resultado.nivel}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
                    <div className="h-3 rounded-full transition-all" style={{ width: `${resultado.puntaje_digital}%`, background: NIVEL_COLORS[resultado.nivel] }} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {resultado.diagnostico && Object.entries(resultado.diagnostico).map(([key, val]: any) => (
                      <div key={key} className="flex items-center gap-2 text-xs">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${val ? "bg-green-100" : "bg-red-100"}`}>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={val ? "#10b981" : "#ef4444"} strokeWidth="3">
                            {val ? <polyline points="20 6 9 17 4 12"/> : <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>}
                          </svg>
                        </div>
                        <span className="text-gray-600">{key.replace(/_/g, " ").replace("tiene ", "")}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="font-bold text-gray-900 mb-3">Oportunidades detectadas</h2>
                  <div className="space-y-2">
                    {resultado.oportunidades?.map((op: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-600 bg-orange-50 rounded-xl p-3">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {op}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="font-bold text-gray-900 mb-3">Recomendacion IA</h2>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-purple-600">{resultado.servicio_recomendado}</span>
                    <div className="flex gap-2">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: `${PRIORIDAD_COLORS[resultado.prioridad]}22`, color: PRIORIDAD_COLORS[resultado.prioridad] }}>
                        Prioridad {resultado.prioridad}
                      </span>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                        {resultado.probabilidad}% cierre
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{resultado.justificacion}</p>
                </div>

                {resultado.propuesta && (
                  <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
                    <h2 className="font-bold text-purple-900 mb-3">Propuesta generada</h2>
                    <h3 className="font-bold text-gray-900 mb-2">{resultado.propuesta.titulo}</h3>
                    <p className="text-sm text-gray-600 mb-2"><strong>Problema:</strong> {resultado.propuesta.problema}</p>
                    <p className="text-sm text-gray-600 mb-3"><strong>Solucion:</strong> {resultado.propuesta.solucion}</p>
                    <div className="space-y-1 mb-3">
                      {resultado.propuesta.beneficios?.map((b: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          {b}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm font-bold text-purple-700">{resultado.propuesta.cta}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  {!guardado ? (
                    <button onClick={handleGuardar} disabled={guardando} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors disabled:opacity-50">
                      {guardando ? "Guardando..." : "Guardar en CRM"}
                    </button>
                  ) : (
                    <div className="flex-1 bg-green-50 border border-green-200 text-green-700 py-3 rounded-xl font-bold text-sm text-center">
                      Guardado en CRM
                    </div>
                  )}
                  <Link href="/dashboard/admin/crm" className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-bold text-sm hover:border-purple-600 hover:text-purple-600 transition-colors text-center">
                    Ver CRM
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}