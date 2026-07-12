"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Register() {
  const router = useRouter();
  const supabase = createClient();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [terminos, setTerminos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister() {
    if (!nombre || !email || !password || !confirm) { setError("Completa todos los campos obligatorios."); return; }
    if (password !== confirm) { setError("Las contrasenas no coinciden."); return; }
    if (!terminos) { setError("Debes aceptar los terminos y condiciones."); return; }
    if (password.length < 6) { setError("La contrasena debe tener al menos 6 caracteres."); return; }
    setLoading(true);
    setError("");
    const { data, error: err } = await supabase.auth.signUp({ email, password, options: { data: { name: `${nombre} ${apellido}`, phone: telefono } } });
    if (err) { setError(err.message); setLoading(false); return; }
    if (data.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, name: `${nombre} ${apellido}`, email, phone: telefono, role: "client" });
    }
    router.push("/dashboard/client");
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 50%, #6d28d9 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", position: "relative", overflow: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; }
        input::placeholder { color: #94a3b8; }
        input:focus { outline: none; }
      `}</style>

      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 480 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", margin: "0 auto 12px", boxShadow: "0 8px 24px rgba(0,0,0,0.3)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
            <Image src="/logo-dms.png" alt="DMS" width={70} height={70} style={{ objectFit: "cover" }} />
          </div>
          <h1 style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 800, margin: 0 }}>DMS Digital Media Studio</h1>
        </div>

        <div style={{ background: "#fff", borderRadius: 24, padding: "2rem", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#111", textAlign: "center", margin: 0, marginBottom: 6 }}>Registra tus Datos</h2>
          <p style={{ fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 24, marginTop: 0 }}>Ingresa tus datos para crear una cuenta en DMS</p>

          {error && <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#ef4444", marginBottom: 16 }}>{error}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "11px 14px", background: "#f8fafc" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input placeholder="Nombre (s)" value={nombre} onChange={e => setNombre(e.target.value)} style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, color: "#111", outline: "none", minWidth: 0 }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "11px 14px", background: "#f8fafc" }}>
              <input placeholder="Apellido (s)" value={apellido} onChange={e => setApellido(e.target.value)} style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, color: "#111", outline: "none", minWidth: 0 }} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "11px 14px", background: "#f8fafc" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <input type="tel" placeholder="Numero de telefono" value={telefono} onChange={e => setTelefono(e.target.value)} style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, color: "#111", outline: "none" }} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "11px 14px", background: "#f8fafc" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input type="email" placeholder="Correo electronico" value={email} onChange={e => setEmail(e.target.value)} style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, color: "#111", outline: "none" }} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "11px 14px", background: "#f8fafc" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type={showPass ? "text" : "password"} placeholder="Contrasena" value={password} onChange={e => setPassword(e.target.value)} style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, color: "#111", outline: "none" }} />
              <button onClick={() => setShowPass(!showPass)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">{showPass ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}</svg>
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "11px 14px", background: "#f8fafc" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type={showConfirm ? "text" : "password"} placeholder="Confirmar contrasena" value={confirm} onChange={e => setConfirm(e.target.value)} style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, color: "#111", outline: "none" }} />
              <button onClick={() => setShowConfirm(!showConfirm)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">{showConfirm ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}</svg>
              </button>
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", fontSize: 13, color: "#555", marginBottom: 20, lineHeight: 1.5 }}>
            <input type="checkbox" checked={terminos} onChange={e => setTerminos(e.target.checked)} style={{ width: 14, height: 14, accentColor: "#7c3aed", marginTop: 2, flexShrink: 0 }} />
            Acepto los <a href="/terminos-y-condiciones" target="_blank" style={{ color: "#7c3aed", fontWeight: 600, textDecoration: "none" }}>terminos y condiciones</a> y <a href="/politica-de-privacidad" target="_blank" style={{ color: "#7c3aed", fontWeight: 600, textDecoration: "none" }}>politica de privacidad</a> de DMS.
          </label>

          <button onClick={handleRegister} disabled={loading} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: loading ? "#c4b5fd" : "#7c3aed", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s" }}>
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>

          <p style={{ textAlign: "center", fontSize: 13, color: "#64748b", marginTop: 20, marginBottom: 0 }}>
            Ya tienes una cuenta? <a href="/auth/login" style={{ color: "#7c3aed", fontWeight: 700, textDecoration: "none" }}>Inicia Sesion</a>
          </p>
        </div>
      </div>
    </div>
  );
}