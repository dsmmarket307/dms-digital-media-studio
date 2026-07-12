"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Login() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email || !password) { setError("Completa todos los campos."); return; }
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError("Correo o contrasena incorrectos."); setLoading(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { data: prof } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
    if (prof?.role === "admin") { router.push("/dashboard/admin"); } else { router.push("/dashboard/client"); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 50%, #6d28d9 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        * { box-sizing: border-box; }
        input::placeholder { color: #94a3b8; }
        input:focus { outline: none; border-color: #7c3aed !important; box-shadow: 0 0 0 3px rgba(26,86,219,0.15); }
      `}</style>

      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", margin: "0 auto 12px", boxShadow: "0 8px 24px rgba(0,0,0,0.3)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
            <Image src="/logo-dms.png" alt="DMS" width={70} height={70} style={{ objectFit: "cover" }} />
          </div>
          <h1 style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 800, margin: 0 }}>DMS Digital Media Studio</h1>
        </div>

        <div style={{ background: "#fff", borderRadius: 24, padding: "2rem", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#111", textAlign: "center", margin: 0, marginBottom: 6 }}>Bienvenido de nuevo</h2>
          <p style={{ fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 24, marginTop: 0 }}>Ingresa tus datos para iniciar sesion</p>

          {error && <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#ef4444", marginBottom: 16 }}>{error}</div>}

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "11px 14px", background: "#f8fafc" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input type="email" placeholder="Correo electronico" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, color: "#111", outline: "none" }} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "11px 14px", background: "#f8fafc" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type={showPass ? "text" : "password"} placeholder="Contrasena" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, color: "#111", outline: "none" }} />
              <button onClick={() => setShowPass(!showPass)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">{showPass ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}</svg>
              </button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, color: "#555" }}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ width: 14, height: 14, accentColor: "#7c3aed" }} />
              Recordarme
            </label>
            <a href="#" style={{ fontSize: 13, color: "#7c3aed", textDecoration: "none", fontWeight: 600 }}>Olvido su contrasena?</a>
          </div>

          <button onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: loading ? "#c4b5fd" : "#7c3aed", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s" }}>
            {loading ? "Iniciando..." : "Iniciar Sesion"}
          </button>

          <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", marginTop: 20, marginBottom: 0 }}>
            No tienes una cuenta? <a href="/auth/register" style={{ color: "#7c3aed", fontWeight: 700, textDecoration: "none" }}>Registrate</a>
          </p>
        </div>
      </div>
    </div>
  );
}