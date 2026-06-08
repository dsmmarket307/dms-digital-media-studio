"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LeadsCliente() {
  const router = useRouter();
  const supabase = createClient();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      const { data } = await supabase.from("leads").select("*").eq("fuente", "manual").eq("email", prof?.email).order("created_at", { ascending: false });
      setLeads(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ padding: "2rem", minWidth: 0 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111", margin: 0 }}>Leads</h1>
        <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Personas que han solicitado informacion sobre tu negocio.</p>
      </div>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #e5e7eb" }}>
              {["Nombre", "Correo", "Telefono", "Mensaje", "Fecha"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map(l => (
              <tr key={l.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "10px 16px", fontWeight: 700, color: "#111" }}>{l.nombre}</td>
                <td style={{ padding: "10px 16px", color: "#555" }}>{l.email}</td>
                <td style={{ padding: "10px 16px", color: "#888" }}>{l.telefono ?? "---"}</td>
                <td style={{ padding: "10px 16px", color: "#888", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.mensaje ?? "---"}</td>
                <td style={{ padding: "10px 16px", color: "#aaa", fontSize: 12 }}>{new Date(l.created_at).toLocaleDateString("es-CO")}</td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#ccc" }}>No hay leads aun.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
