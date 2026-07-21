"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function MetaPixel() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sites, setSites] = useState<any[]>([]);
  const [pixeles, setPixeles] = useState<Record<string, string>>({});

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data } = await supabase.from("generated_websites").select("id, project_name, meta_pixel_id").eq("user_id", user.id).order("created_at", { ascending: false });
      setSites(data ?? []);
      const map: Record<string, string> = {};
      (data ?? []).forEach((s: any) => { map[s.id] = s.meta_pixel_id ?? ""; });
      setPixeles(map);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(siteId: string) {
    setSaving(true);
    await supabase.from("generated_websites").update({ meta_pixel_id: pixeles[siteId] || null }).eq("id", siteId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ padding: "2rem", minWidth: 0 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111", margin: 0 }}>Meta Pixel</h1>
        <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Conecta tu pixel de Meta para rastrear eventos en tu sitio web.</p>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "#1877f2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </div>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#111", margin: 0, marginBottom: 6 }}>Como obtener tu Pixel ID</h2>
            <ol style={{ fontSize: 13, color: "#555", lineHeight: 1.8, margin: 0, paddingLeft: 20 }}>
              <li>Ve a <strong>Meta Business Suite</strong></li>
              <li>Haz click en <strong>Events Manager</strong></li>
              <li>Selecciona tu pixel o crea uno nuevo</li>
              <li>Copia el <strong>ID del pixel</strong> (numero de 15-16 digitos)</li>
              <li>Pegalo en el campo de tu sitio web abajo</li>
            </ol>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {sites.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "3rem", textAlign: "center" }}>
            <p style={{ color: "#aaa", fontSize: 14 }}>No tienes sitios web creados aun.</p>
          </div>
        ) : (
          sites.map(site => (
            <div key={site.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", margin: 0 }}>{site.project_name}</h3>
                  <p style={{ fontSize: 12, color: "#888", margin: 0, marginTop: 2 }}>
                    {pixeles[site.id] ? (
                      <span style={{ color: "#10b981", fontWeight: 600 }}>Pixel activo: {pixeles[site.id]}</span>
                    ) : (
                      "Sin pixel configurado"
                    )}
                  </p>
                </div>
                {pixeles[site.id] && (
                  <span style={{ background: "#f0fdf4", color: "#10b981", border: "1px solid #86efac", borderRadius: 999, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>Activo</span>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={pixeles[site.id] ?? ""}
                  onChange={e => setPixeles(prev => ({ ...prev, [site.id]: e.target.value }))}
                  placeholder="Ej: 1234567890123456"
                  style={{ flex: 1, border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none" }}
                />
                <button
                  onClick={() => handleSave(site.id)}
                  disabled={saving}
                  style={{ padding: "10px 20px", background: saved ? "#10b981" : "#7c3aed", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "background 0.2s" }}
                >
                  {saving ? "Guardando..." : saved ? "Guardado" : "Guardar"}
                </button>
              </div>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>Eventos que se rastrean automaticamente:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["PageView", "ViewContent", "AddToCart", "InitiateCheckout", "Purchase"].map(e => (
                    <span key={e} style={{ background: "#f5f3ff", color: "#7c3aed", border: "1px solid #e9d5ff", borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{e}</span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}