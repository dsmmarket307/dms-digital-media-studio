"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NuevaContrasena() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  async function handleActualizar() {
    if (!password || !confirm) { setError("Completa ambos campos."); return; }
    if (password !== confirm) { setError("Las contrasenas no coinciden."); return; }
    if (password.length < 6) { setError("La contrasena debe tener al menos 6 caracteres."); return; }
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) { setError(err.message); setLoading(false); return; }
    setExito(true);
    setLoading(false);
    setTimeout(() => router.push("/auth/login"), 2500);
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 50%, #6d28d9 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", position: "relative", overflow: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; }
        input::placeholder { color: #94a3b8; }
        input:focus { outline: none; }
      `}</style>

      <div style={{ position: "absolute", top: 28, right: 32, zIndex: 2 }}>
        <Image src="/logo-dms-white.png" alt="DMS Digital Media Studio" width={130} height={42} style={{ height: 36, width: "auto", objectFit: "contain" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 440 }}>
        <div style={{ background: "#fff", borderRadius: 24, padding: "2rem", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
          {exito ? (
            <div style={{ textAlign: "center", padding: "1rem 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#111", marginBottom: 10 }}>Contrasena actualizada</h2>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>Te llevaremos al inicio de sesion...</p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#111", textAlign: "center", margin: 0, marginBottom: 6 }}>Nueva contrasena</h2>
              <p style={{ fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 24, marginTop: 0 }}>Ingresa tu nueva contrasena</p>

              {error && <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#ef4444", marginBottom: 16 }}>{error}</div>}

              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "11px 14px", background: "#f8fafc" }}>
                  <input type="password" placeholder="Nueva contrasena" value={password} onChange={e => setPassword(e.target.value)} style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, color: "#111", outline: "none" }} />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "11px 14px", background: "#f8fafc" }}>
                  <input type="password" placeholder="Confirmar contrasena" value={confirm} onChange={e => setConfirm(e.target.value)} onKeyDown={e => e.key === "Enter" && handleActualizar()} style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, color: "#111", outline: "none" }} />
                </div>
              </div>

              <button onClick={handleActualizar} disabled={loading} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: loading ? "#c4b5fd" : "#7c3aed", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "Guardando..." : "Guardar contrasena"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
