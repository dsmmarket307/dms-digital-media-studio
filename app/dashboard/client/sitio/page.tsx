"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MiSitio() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [sitios, setSitios] = useState<any[]>([]);
  const [suscripcion, setSuscripcion] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (prof?.role === "admin") { router.push("/dashboard/admin"); return; }
      const [{ data: s }, { data: sub }] = await Promise.all([
        supabase.from("generated_websites").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      setSitios(s ?? []);
      setSuscripcion(sub ?? null);
      setLoading(false);
    }
    load();
  }, []);

  async function handleEliminar(id: string) {
    if (!confirm("Eliminar este sitio?")) return;
    await supabase.from("generated_websites").delete().eq("id", id);
    setSitios(prev => prev.filter(s => s.id !== id));
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const plan = suscripcion?.plan ?? "basico";
  const puedeEditar = suscripcion?.status === "trial" || suscripcion?.status === "active";

  const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    draft:     { label: "Borrador",   color: "#888",    bg: "#f3f4f6" },
    published: { label: "Publicado",  color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f0f0" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <header style={{ background: "#fff", borderBottom: "1px solid rgba(124,58,237,0.1)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111", margin: 0 }}>Mi Sitio Web</h1>
          <p style={{ color: "#888", fontSize: 12, margin: "4px 0 0" }}>Administra tus sitios web generados</p>
        </div>
        <Link href="/dashboard/client/builder" style={{ background: "#7c3aed", color: "#fff", padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
          + Crear nuevo sitio
        </Link>
      </header>

      <div style={{ padding: "24px 16px", maxWidth: 1000, margin: "0 auto" }}>

        {sitios.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 16, padding: 48, textAlign: "center", border: "1px solid #e8e8e8" }}>
            <p style={{ fontSize: 15, color: "#555", marginBottom: 8 }}>No tienes sitios creados aun</p>
            <p style={{ fontSize: 13, color: "#aaa", marginBottom: 20 }}>Crea tu primer sitio web con inteligencia artificial</p>
            <Link href="/dashboard/client/builder" style={{ background: "#7c3aed", color: "#fff", padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
              Crear mi sitio
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {sitios.map(s => (
              <div key={s.id} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #e8e8e8", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ height: 90, background: `linear-gradient(135deg, ${s.primary_color ?? "#7c3aed"}, ${s.secondary_color ?? "#1a1a1a"})`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  {s.logo_url ? (
                    <img src={s.logo_url} alt="logo" style={{ height: 44, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
                  ) : (
                    <p style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{s.project_name}</p>
                  )}
                  <span style={{ position: "absolute", top: 10, right: 10, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: STATUS_LABELS[s.status]?.bg ?? "#f3f4f6", color: STATUS_LABELS[s.status]?.color ?? "#888" }}>
                    {STATUS_LABELS[s.status]?.label ?? s.status}
                  </span>
                </div>
                <div style={{ padding: 16 }}>
                  <p style={{ fontWeight: 800, fontSize: 14, color: "#111", marginBottom: 4 }}>{s.project_name}</p>
                  <p style={{ fontSize: 11, color: "#aaa", marginBottom: 14 }}>{s.website_type} — {new Date(s.created_at).toLocaleDateString("es-CO")}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {puedeEditar ? (
                      <Link href={`/demo/${s.id}`} target="_blank" style={{ background: "#f3f4f6", color: "#555", padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
                        Ver demo
                      </Link>
                    ) : (
                      <Link href="/planes" style={{ background: "#f3f4f6", color: "#aaa", padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
                        Ver demo
                      </Link>
                    )}
                    {puedeEditar && plan !== "basico" ? (
                      <Link href={`/dashboard/admin/page-builder/${s.id}`} style={{ background: "#7c3aed", color: "#fff", padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
                        Editar
                      </Link>
                    ) : (
                      <Link href="/planes" style={{ background: "#f3f4f6", color: "#aaa", padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
                        Editar (PRO)
                      </Link>
                    )}
                    <button onClick={() => handleEliminar(s.id)} style={{ gridColumn: "span 2", background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 8, padding: "8px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}