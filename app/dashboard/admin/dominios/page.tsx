"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDominios() {
  const router = useRouter();
  const supabase = createClient();
  const [dominios, setDominios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (prof?.role !== "admin") { router.push("/dashboard/client"); return; }
      const { data } = await supabase
        .from("domains")
        .select("*, profiles(name, email), generated_websites(project_name), subscriptions(plan)")
        .order("created_at", { ascending: false });
      setDominios(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const STATUS_COLORS: Record<string, string> = {
    pending: "#f59e0b", connecting: "#3b82f6", active: "#10b981", dns_error: "#ef4444"
  };
  const STATUS_LABELS: Record<string, string> = {
    pending: "Pendiente", connecting: "Conectando", active: "Activo", dns_error: "Error DNS"
  };

  const dominiosFiltrados = dominios.filter(d =>
    !filtro ||
    d.domain?.toLowerCase().includes(filtro.toLowerCase()) ||
    d.profiles?.name?.toLowerCase().includes(filtro.toLowerCase()) ||
    d.profiles?.email?.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ padding: "2rem", minWidth: 0 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <Link href="/dashboard/admin" style={{ fontSize: 12, color: "#888", textDecoration: "none", marginBottom: 4, display: "block" }}>← Volver al admin</Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111", margin: 0 }}>Dominios</h1>
          <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Todos los dominios conectados por los clientes.</p>
        </div>
        <input value={filtro} onChange={e => setFiltro(e.target.value)} placeholder="Buscar dominio o cliente..." style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 14px", fontSize: 13, outline: "none", width: 240 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
        {[
          { label: "Total", value: dominios.length, color: "#7c3aed" },
          { label: "Activos", value: dominios.filter(d => d.status === "active").length, color: "#10b981" },
          { label: "Pendientes", value: dominios.filter(d => d.status === "pending").length, color: "#f59e0b" },
          { label: "Error DNS", value: dominios.filter(d => d.status === "dns_error").length, color: "#ef4444" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "1rem" }}>
            <p style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "#888", margin: 0, marginTop: 4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #e5e7eb" }}>
              {["Cliente", "Correo", "Dominio", "Sitio", "Plan", "Estado", "SSL", "Fecha"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dominiosFiltrados.map(d => (
              <tr key={d.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "12px 16px", fontWeight: 700, color: "#111" }}>{d.profiles?.name ?? "---"}</td>
                <td style={{ padding: "12px 16px", color: "#555", fontSize: 12 }}>{d.profiles?.email ?? "---"}</td>
                <td style={{ padding: "12px 16px", fontWeight: 700, color: "#7c3aed" }}>{d.domain}</td>
                <td style={{ padding: "12px 16px", color: "#555" }}>{d.generated_websites?.project_name ?? "---"}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "rgba(124,58,237,0.1)", color: "#7c3aed", textTransform: "capitalize" as const }}>{d.subscriptions?.plan ?? "---"}</span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: `${STATUS_COLORS[d.status]}20`, color: STATUS_COLORS[d.status] }}>{STATUS_LABELS[d.status] ?? d.status}</span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: d.ssl_status === "active" ? "#f0fdf4" : "#fef9ec", color: d.ssl_status === "active" ? "#10b981" : "#f59e0b" }}>{d.ssl_status === "active" ? "Activo" : "Pendiente"}</span>
                </td>
                <td style={{ padding: "12px 16px", color: "#888", fontSize: 12 }}>{new Date(d.created_at).toLocaleDateString("es-CO")}</td>
              </tr>
            ))}
            {dominiosFiltrados.length === 0 && (
              <tr><td colSpan={8} style={{ padding: "2rem", textAlign: "center", color: "#ccc" }}>No hay dominios registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
