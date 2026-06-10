"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PLANES_PRECIOS: Record<string, number> = { basico: 49000, profesional: 99000, empresarial: 199000 };
const PLANES_LABELS: Record<string, string> = { basico: "Plan Basico", profesional: "Plan Profesional", empresarial: "Plan Empresarial" };

export default function Facturacion() {
  const router = useRouter();
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [suscripcion, setSuscripcion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      const { data: sub } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      setSuscripcion(sub ?? null);
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

  const diasRestantes = suscripcion?.current_period_end ? Math.max(0, Math.ceil((new Date(suscripcion.current_period_end).getTime() - Date.now()) / 86400000)) : 0;

  return (
    <div style={{ padding: "2rem", minWidth: 0 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111", margin: 0 }}>Facturacion</h1>
        <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Tu plan activo e historial de pagos.</p>
      </div>

      {suscripcion ? (
        <div style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 14, padding: "1.5rem", marginBottom: "2rem" }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 12 }}>Plan activo</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Plan</p>
              <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111", textTransform: "capitalize" as const }}>{PLANES_LABELS[suscripcion.plan] ?? suscripcion.plan}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Valor mensual</p>
              <p style={{ fontSize: "1.3rem", fontWeight: 800, color: "#7c3aed" }}>${(PLANES_PRECIOS[suscripcion.plan] ?? 0).toLocaleString("es-CO")} COP</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Estado</p>
              <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: suscripcion.status === "active" ? "#d1fae5" : "#fef3c7", color: suscripcion.status === "active" ? "#059669" : "#d97706" }}>
                {suscripcion.status === "active" ? "Activo" : suscripcion.status}
              </span>
            </div>
            {suscripcion.current_period_end && (
              <div>
                <p style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Vence el</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: diasRestantes <= 5 ? "#ef4444" : "#111" }}>{new Date(suscripcion.current_period_end).toLocaleDateString("es-CO")}</p>
                <p style={{ fontSize: 11, color: "#888" }}>{diasRestantes} dias restantes</p>
              </div>
            )}
          </div>
          {(suscripcion.status === "expired" || suscripcion.status === "cancelled") && (
            <Link href="/dashboard/client/suscripcion" style={{ display: "inline-block", marginTop: 16, background: "#7c3aed", color: "#fff", padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Renovar plan</Link>
          )}
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "1.5rem", marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontWeight: 700, color: "#111", marginBottom: 4 }}>No tienes un plan activo</p>
            <p style={{ fontSize: 13, color: "#888" }}>Elige un plan para comenzar a usar todas las funciones.</p>
          </div>
          <Link href="/dashboard/client/suscripcion" style={{ background: "#7c3aed", color: "#fff", padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Ver planes</Link>
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
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const }}>{h}</th>
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
