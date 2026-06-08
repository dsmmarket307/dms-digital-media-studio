"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Reservas() {
  const router = useRouter();
  const supabase = createClient();
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data } = await supabase.from("reservas").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setReservas(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const ESTADO_COLORS: Record<string, string> = { pendiente: "#F59E0B", confirmada: "#10B981", cancelada: "#EF4444" };

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
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111", margin: 0 }}>Reservas</h1>
        <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Reservas recibidas en tu sitio web.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
        {[
          { label: "Total", value: reservas.length, color: "#7c3aed" },
          { label: "Pendientes", value: reservas.filter(r => r.estado === "pendiente").length, color: "#F59E0B" },
          { label: "Confirmadas", value: reservas.filter(r => r.estado === "confirmada").length, color: "#10B981" },
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
              {["Nombre", "Telefono", "Fecha", "Hora", "Personas", "Estado"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reservas.map(r => (
              <tr key={r.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "10px 16px", fontWeight: 700, color: "#111" }}>{r.nombre}</td>
                <td style={{ padding: "10px 16px", color: "#555" }}>{r.telefono ?? "---"}</td>
                <td style={{ padding: "10px 16px", color: "#888" }}>{r.fecha ? new Date(r.fecha).toLocaleDateString("es-CO") : "---"}</td>
                <td style={{ padding: "10px 16px", color: "#888" }}>{r.hora ?? "---"}</td>
                <td style={{ padding: "10px 16px", color: "#888" }}>{r.personas ?? "---"}</td>
                <td style={{ padding: "10px 16px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: `${ESTADO_COLORS[r.estado] ?? "#6b7280"}22`, color: ESTADO_COLORS[r.estado] ?? "#6b7280" }}>
                    {r.estado}
                  </span>
                </td>
              </tr>
            ))}
            {reservas.length === 0 && (
              <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#ccc" }}>No hay reservas aun.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
