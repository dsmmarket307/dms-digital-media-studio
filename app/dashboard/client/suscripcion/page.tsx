"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const PLANES = [
  { slug: "basico",      name: "Basico",      price: 49000,  items: ["1 Landing Page activa", "Boton WhatsApp", "Subdominio DMS", "Soporte basico"] },
  { slug: "profesional", name: "Profesional", price: 99000,  items: ["1 Sitio profesional", "Editor Visual", "SEO basico", "Dominio personalizado", "Leads integrados"] },
  { slug: "empresarial", name: "Empresarial", price: 199000, items: ["Hasta 3 sitios activos", "CRM integrado", "Automatizacion IA", "Soporte prioritario"] },
];

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: "Activa",     color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  cancelled: { label: "Cancelada",  color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  expired:   { label: "Vencida",    color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  suspended: { label: "Suspendida", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
};

export default function SuscripcionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [suscripcion, setSuscripcion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelando, setCancelando] = useState(false);
  const [suscribiendo, setSuscribiendo] = useState("");
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [activando, setActivando] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (prof?.role === "admin") { router.push("/dashboard/admin"); return; }
      setProfile(prof);

      const collection_status = searchParams.get("collection_status") ?? searchParams.get("status");
      const payment_id = searchParams.get("payment_id") || searchParams.get("collection_id");
      const plan = searchParams.get("plan");

      if ((collection_status === "approved" || collection_status === "success") && payment_id && plan) {
        setActivando(true);
        try {
          const res = await fetch("/api/mercadopago/activar-suscripcion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payment_id, user_id: user.id, plan }),
          });
          const data = await res.json();
          if (data.ok) setPagoExitoso(true);
        } catch (e) {
          console.error("Error activando:", e);
        }
        setActivando(false);
      }

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setSuscripcion(sub ?? null);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSuscribir(slug: string) {
    if (!profile) return;
    setSuscribiendo(slug);
    try {
      const res = await fetch("/api/mercadopago/suscripcion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: slug, user_id: profile.id, payer_email: profile.email, payer_name: profile.name ?? profile.email }),
      });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert("Error al iniciar pago.");
      }
    } catch {
      alert("Error de conexion.");
    }
    setSuscribiendo("");
  }

  async function handleCancelar() {
    if (!confirm("Seguro que deseas cancelar?")) return;
    setCancelando(true);
    await supabase.from("subscriptions").update({ status: "cancelled" }).eq("id", suscripcion.id);
    setSuscripcion((prev: any) => ({ ...prev, status: "cancelled" }));
    setCancelando(false);
  }

  if (loading || activando) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#7c3aed", fontWeight: 600, fontSize: 14 }}>{activando ? "Activando tu suscripcion..." : "Cargando..."}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const planActual = PLANES.find(p => p.slug === suscripcion?.plan);
  const diasRestantes = suscripcion?.current_period_end
    ? Math.max(0, Math.ceil((new Date(suscripcion.current_period_end).getTime() - Date.now()) / 86400000))
    : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f0f0" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <header style={{ background: "#fff", borderBottom: "1px solid rgba(124,58,237,0.1)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111", margin: 0 }}>Mi Suscripcion</h1>
          <p style={{ color: "#888", fontSize: 12, margin: "4px 0 0" }}>Administra tu plan y metodo de pago</p>
        </div>
        <Link href="/dashboard/client" style={{ fontSize: 13, color: "#7c3aed", fontWeight: 700, textDecoration: "none" }}>Volver al inicio</Link>
      </header>

      <div style={{ padding: "24px 16px", maxWidth: 800, margin: "0 auto" }}>

        {pagoExitoso && (
          <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
            <p style={{ fontWeight: 800, color: "#065f46", fontSize: 14, margin: 0 }}>Pago exitoso</p>
            <p style={{ color: "#065f46", fontSize: 13, margin: "4px 0 0" }}>Tu suscripcion esta activa. Gracias por confiar en DMS Digital Studio.</p>
          </div>
        )}

        {!suscripcion && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, textAlign: "center", border: "1px solid #e8e8e8", marginBottom: 24 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111", marginBottom: 8 }}>No tienes una suscripcion activa</h2>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>Elige un plan para comenzar.</p>
          </div>
        )}

        {suscripcion && (
          <>
            <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: "#111", margin: 0 }}>Estado actual</h2>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: STATUS_LABELS[suscripcion.status]?.bg ?? "#f3f4f6", color: STATUS_LABELS[suscripcion.status]?.color ?? "#555" }}>
                  {STATUS_LABELS[suscripcion.status]?.label ?? suscripcion.status}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
                <div style={{ background: "#f8f8f8", borderRadius: 12, padding: 16 }}>
                  <p style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Plan</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: "#111", textTransform: "capitalize" }}>{suscripcion.plan}</p>
                  <p style={{ fontSize: 12, color: "#888" }}>${(planActual?.price ?? 0).toLocaleString("es-CO")}/mes</p>
                </div>
                {suscripcion.current_period_end && (
                  <div style={{ background: "#f8f8f8", borderRadius: 12, padding: 16 }}>
                    <p style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Vence el</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: diasRestantes <= 5 ? "#ef4444" : "#111" }}>{new Date(suscripcion.current_period_end).toLocaleDateString("es-CO")}</p>
                    <p style={{ fontSize: 11, color: "#888" }}>{diasRestantes} dias restantes</p>
                  </div>
                )}
                <div style={{ background: "#f8f8f8", borderRadius: 12, padding: 16 }}>
                  <p style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Miembro desde</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{new Date(suscripcion.created_at).toLocaleDateString("es-CO")}</p>
                </div>
              </div>
              {suscripcion.status === "active" && diasRestantes <= 5 && (
                <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 10, padding: "12px 16px", marginTop: 16 }}>
                  <p style={{ fontSize: 13, color: "#92400e", fontWeight: 600, margin: 0 }}>Tu plan vence en {diasRestantes} dias. Renuevalo para no perder tu sitio.</p>
                </div>
              )}
              {suscripcion.status === "expired" && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", marginTop: 16 }}>
                  <p style={{ fontSize: 13, color: "#991b1b", fontWeight: 600, margin: 0 }}>Tu suscripcion ha vencido. Tu sitio no es visible publicamente.</p>
                </div>
              )}
            </div>

            {planActual && (
              <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8", marginBottom: 16 }}>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: "#111", marginBottom: 16 }}>Tu plan incluye</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {planActual.items.map(item => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#555" }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e8e8e8" }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#111", marginBottom: 16 }}>Acciones</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(suscripcion.status === "expired" || suscripcion.status === "cancelled") && (
                  <button onClick={() => handleSuscribir(suscripcion.plan)} disabled={!!suscribiendo} style={{ background: "#7c3aed", color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
                    {suscribiendo ? "Redirigiendo..." : "Renovar suscripcion"}
                  </button>
                )}
                {suscripcion.status === "active" && (
                  <button onClick={handleCancelar} disabled={cancelando} style={{ background: "#fef2f2", color: "#ef4444", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
                    {cancelando ? "Cancelando..." : "Cancelar suscripcion"}
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {(!suscripcion || suscripcion.status === "expired" || suscripcion.status === "cancelled") && (
          <div style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: "#111", marginBottom: 16 }}>Planes disponibles</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              {PLANES.map(p => (
                <div key={p.slug} style={{ background: "#fff", borderRadius: 16, padding: 20, border: p.slug === "profesional" ? "2px solid #7c3aed" : "1px solid #e8e8e8", position: "relative" }}>
                  {p.slug === "profesional" && (
                    <span style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: "#7c3aed", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 999 }}>MAS POPULAR</span>
                  )}
                  <p style={{ fontWeight: 800, fontSize: 15, color: "#111", marginBottom: 4 }}>{p.name}</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: "#7c3aed", marginBottom: 4 }}>${p.price.toLocaleString("es-CO")}</p>
                  <p style={{ fontSize: 11, color: "#888", marginBottom: 14 }}>COP / mes</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                    {p.items.map(item => (
                      <p key={item} style={{ fontSize: 12, color: "#555", margin: 0 }}>— {item}</p>
                    ))}
                  </div>
                  <button onClick={() => handleSuscribir(p.slug)} disabled={suscribiendo === p.slug} style={{ display: "block", width: "100%", textAlign: "center", background: p.slug === "profesional" ? "#7c3aed" : "#111", color: "#fff", padding: "9px", borderRadius: 9, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", opacity: suscribiendo === p.slug ? 0.6 : 1 }}>
                    {suscribiendo === p.slug ? "Redirigiendo..." : "Suscribirme"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
