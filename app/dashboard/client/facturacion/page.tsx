"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Facturacion() {
  const router = useRouter();
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(prof);
      const { data } = await supabase.from("package_orders").select("*").eq("customer_email", prof?.email).order("created_at", { ascending: false });
      setOrders(data ?? []);
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

  const planActivo = orders.find(o => o.status === "approved");

  return (
    <div style={{ padding: "2rem", minWidth: 0 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111", margin: 0 }}>Facturacion</h1>
        <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Tu plan activo e historial de pagos.</p>
      </div>
      {planActivo && (
        <div style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 14, padding: "1.5rem", marginBottom: "2rem" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Plan activo</p>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#111", margin: 0 }}>{planActivo.package_name}</h2>
          <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Comprado el {new Date(planActivo.created_at).toLocaleDateString("es-CO")}</p>
          <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#7c3aed", marginTop: 8 }}>${Number(planActivo.price).toLocaleString("es-CO")} COP</p>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#d1fae5", color: "#059669" }}>Activo</span>
        </div>
      )}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: "#111", margin: 0 }}>Historial de pagos</h2>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #e5e7eb" }}>
              {["Paquete", "Valor", "Estado", "ID Pago", "Fecha"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "10px 16px", fontWeight: 700, color: "#111" }}>{o.package_name}</td>
                <td style={{ padding: "10px 16px", color: "#555" }}>${Number(o.price).toLocaleString("es-CO")}</td>
                <td style={{ padding: "10px 16px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: o.status === "approved" ? "#d1fae5" : "#fef3c7", color: o.status === "approved" ? "#10B981" : "#F59E0B" }}>
                    {o.status === "approved" ? "Aprobado" : o.status}
                  </span>
                </td>
                <td style={{ padding: "10px 16px", color: "#aaa", fontSize: 12 }}>{o.mercadopago_payment_id ?? "---"}</td>
                <td style={{ padding: "10px 16px", color: "#888" }}>{new Date(o.created_at).toLocaleDateString("es-CO")}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#ccc" }}>No hay pagos registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
