"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function MetaPixelAdmin() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState<any[]>([]);
  const [pixeles, setPixeles] = useState<Record<string, string>>({});
  const [busqueda, setBusqueda] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (prof?.role !== "admin") { router.push("/dashboard/client"); return; }

      const { data } = await supabase.from("generated_websites").select("id, project_name, client_email, meta_pixel_id").order("created_at", { ascending: false });
      setSites(data ?? []);
      const map: Record<string, string> = {};
      (data ?? []).forEach((s: any) => { map[s.id] = s.meta_pixel_id ?? ""; });
      setPixeles(map);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(siteId: string) {
    setSavingId(siteId);
    await supabase.from("generated_websites").update({ meta_pixel_id: pixeles[siteId] || null }).eq("id", siteId);
    setSavingId(null);
    setSavedId(siteId);
    setTimeout(() => setSavedId(null), 3000);
  }

  const sitesFiltrados = sites.filter(s => {
    const q = busqueda.toLowerCase();
    return (s.project_name ?? "").toLowerCase().includes(q) || (s.client_email ?? "").toLowerCase().includes(q);
  });

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ padding: "2rem", minWidth: 0 }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111", margin: 0 }}>Meta Pixel - Todos los sitios</h1>
        <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Administra el pixel de Meta de cualquier sitio de cualquier cliente.</p>
      </div>

      <input
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre del sitio o email del cliente..."
        style={{ width: "100%", maxWidth: 480, border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", marginBottom: "1.5rem" }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {sitesFiltrados.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "3rem", textAlign: "center" }}>
            <p style={{ color: "#aaa", fontSize: 14 }}>No se encontraron sitios.</p>
          </div>
        ) : (
          sitesFiltrados.map(site => (
            <div key={site.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", margin: 0 }}>{site.project_name}</h3>
                  <p style={{ fontSize: 12, color: "#888", margin: 0, marginTop: 2 }}>{site.client_email ?? "Sin email registrado"}</p>
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
                  disabled={savingId === site.id}
                  style={{ padding: "10px 20px", background: savedId === site.id ? "#10b981" : "#7c3aed", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  {savingId === site.id ? "Guardando..." : savedId === site.id ? "Guardado" : "Guardar"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}