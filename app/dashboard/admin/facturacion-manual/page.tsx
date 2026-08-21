"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

const ESTADOS: Record<string, { label: string; color: string; bg: string }> = {
  pendiente: { label: "Pendiente", color: "#d97706", bg: "#fef3c7" },
  pagada:    { label: "Pagada",    color: "#059669", bg: "#d1fae5" },
  vencida:   { label: "Vencida",   color: "#dc2626", bg: "#fee2e2" },
  anulada:   { label: "Anulada",   color: "#6b7280", bg: "#f3f4f6" },
};

function formatMonto(n: number, moneda: string) {
  if (moneda === "USD") return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return "$" + Math.round(n).toLocaleString("es-CO");
}

type Item = { concepto: string; cantidad: number; valor: number };

export default function FacturacionManualAdmin() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [facturas, setFacturas] = useState<any[]>([]);
  const [negocio, setNegocio] = useState({ nombre: "", direccion: "", telefono: "", email: "", logo_url: "" });
  const [guardandoNegocio, setGuardandoNegocio] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [facturaVer, setFacturaVer] = useState<any>(null);
  const [form, setForm] = useState({
    cliente_nombre: "", cliente_email: "", cliente_telefono: "", cliente_direccion: "",
    moneda: "COP", descuento: "0", fecha: new Date().toISOString().slice(0, 10), fecha_vencimiento: "", notas: "",
  });
  const [items, setItems] = useState<Item[]>([{ concepto: "", cantidad: 1, valor: 0 }]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (prof?.role !== "admin") { router.push("/dashboard/client"); return; }
      setUserId(user.id);
      setNegocio({
        nombre: prof?.name ?? "",
        direccion: prof?.direccion ?? "",
        telefono: prof?.phone ?? "",
        email: prof?.email ?? "",
        logo_url: prof?.logo_url ?? "",
      });
      const { data: f } = await supabase.from("facturas").select("*").eq("user_id", user.id).order("numero", { ascending: false });
      setFacturas(f ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploadingLogo(true);
    const ext = file.name.split(".").pop();
    const fileName = `logo-dms-${userId}-${Date.now()}.${ext}`;
    await supabase.storage.from("logos").upload(fileName, file, { upsert: true });
    const { data } = supabase.storage.from("logos").getPublicUrl(fileName);
    setNegocio(prev => ({ ...prev, logo_url: data.publicUrl }));
    setUploadingLogo(false);
  }

  async function guardarDatosNegocio() {
    setGuardandoNegocio(true);
    await supabase.from("profiles").update({ name: negocio.nombre, direccion: negocio.direccion, phone: negocio.telefono, logo_url: negocio.logo_url }).eq("id", userId);
    setGuardandoNegocio(false);
  }

  function addItem() { setItems(prev => [...prev, { concepto: "", cantidad: 1, valor: 0 }]); }
  function removeItem(i: number) { setItems(prev => prev.filter((_, idx) => idx !== i)); }
  function updateItem(i: number, field: keyof Item, value: any) {
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: value } : it));
  }

  const subtotal = items.reduce((s, it) => s + (Number(it.cantidad) || 0) * (Number(it.valor) || 0), 0);
  const descuento = Number(form.descuento) || 0;
  const total = Math.max(0, subtotal - descuento);

  async function guardarFactura() {
    if (!form.cliente_nombre || items.every(it => !it.concepto)) return;
    setSaving(true);
    const { data: { user: freshUser } } = await supabase.auth.getUser();
    if (!freshUser) { alert("Sesion expirada, vuelve a iniciar sesion."); setSaving(false); return; }
    const siguienteNumero = (facturas[0]?.numero ?? 0) + 1;
    const { data, error } = await supabase.from("facturas").insert({

      user_id: freshUser.id,
      numero: siguienteNumero,
      cliente_nombre: form.cliente_nombre,
      cliente_email: form.cliente_email || null,
      cliente_telefono: form.cliente_telefono || null,
      cliente_direccion: form.cliente_direccion || null,
      items: items.filter(it => it.concepto),
      subtotal, descuento, impuesto: 0, total,
      moneda: form.moneda,
      estado: "pendiente",
      fecha: form.fecha,
      fecha_vencimiento: form.fecha_vencimiento || null,
      notas: form.notas || null,
    }).select().single();
    if (!error && data) {
      setFacturas(prev => [data, ...prev]);
      setForm({ cliente_nombre: "", cliente_email: "", cliente_telefono: "", cliente_direccion: "", moneda: "COP", descuento: "0", fecha: new Date().toISOString().slice(0, 10), fecha_vencimiento: "", notas: "" });
      setItems([{ concepto: "", cantidad: 1, valor: 0 }]);
      setShowModal(false);
    } else if (error) {
      alert("Error al guardar: " + error.message);
    }
    setSaving(false);
  }

  async function cambiarEstado(id: string, estado: string) {
    await supabase.from("facturas").update({ estado, updated_at: new Date().toISOString() }).eq("id", id);
    setFacturas(prev => prev.map(f => f.id === id ? { ...f, estado } : f));
  }

  async function eliminarFactura(id: string) {
    if (!confirm("Eliminar esta factura?")) return;
    await supabase.from("facturas").delete().eq("id", id);
    setFacturas(prev => prev.filter(f => f.id !== id));
  }

  function exportarExcel() {
    const rows = facturas.map(f => ({
      Numero: f.numero, Cliente: f.cliente_nombre, Fecha: new Date(f.fecha).toLocaleDateString("es-CO"),
      Moneda: f.moneda ?? "COP", Subtotal: Number(f.subtotal), Descuento: Number(f.descuento), Total: Number(f.total), Estado: ESTADOS[f.estado]?.label ?? f.estado,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 8 }, { wch: 28 }, { wch: 12 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Facturas DMS");
    XLSX.writeFile(wb, `facturas_dms_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  function imprimir() { window.print(); }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img src="/favicon-32.png" alt="Cargando" style={{ width: 44, height: 44, animation: "spin 1s linear infinite", borderRadius: 10 }} />      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ padding: "2rem", minWidth: 0, background: "#f8f9fa", minHeight: "100vh" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; }
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; top: 0; left: 0; width: 100%; padding: 40px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111", margin: 0 }}>Facturacion Manual (DMS)</h1>
          <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Facturas de DMS a tus propios clientes — casos especiales, COP o USD</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={exportarExcel} style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid #e5e7eb", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#fff", color: "#555" }}>Exportar Excel</button>
          <button onClick={() => setShowModal(true)} style={{ padding: "9px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#7c3aed", color: "#fff" }}>+ Nueva Factura</button>
        </div>
      </div>

      <div className="no-print" style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", border: "1px solid #e8e8e8", marginBottom: 24 }}>
        <h2 style={{ fontSize: 14, fontWeight: 800, color: "#111", marginBottom: 4 }}>Datos de mi negocio (DMS)</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10, marginBottom: 14 }}>
          {negocio.logo_url ? (
            <img src={negocio.logo_url} alt="Logo" style={{ width: 56, height: 56, borderRadius: 10, objectFit: "contain", border: "1px solid #e5e7eb", background: "#fff" }} />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: 10, border: "1px dashed #d1d5db", display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc", fontSize: 10 }}>Sin logo</div>
          )}
          <div>
            <label style={{ display: "inline-block", padding: "7px 14px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12, fontWeight: 700, color: "#555", cursor: "pointer", background: "#fff" }}>
              {uploadingLogo ? "Subiendo..." : "Subir logo"}
              <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} style={{ display: "none" }} />
            </label>
          </div>
        </div>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>Estos datos aparecen como "Supplier" en tus facturas. Todo editable.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Nombre</label>
            <input value={negocio.nombre} onChange={e => setNegocio(prev => ({ ...prev, nombre: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Telefono</label>
            <input value={negocio.telefono} onChange={e => setNegocio(prev => ({ ...prev, telefono: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Email</label>
            <input value={negocio.email} onChange={e => setNegocio(prev => ({ ...prev, email: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Direccion</label>
            <input value={negocio.direccion} onChange={e => setNegocio(prev => ({ ...prev, direccion: e.target.value }))} placeholder="Ej: Calle 35 # 11-52, Barrio Buenos Aires Centro, Pereira, Risaralda" style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
          </div>
        </div>
        <button onClick={guardarDatosNegocio} disabled={guardandoNegocio} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", opacity: guardandoNegocio ? 0.6 : 1 }}>{guardandoNegocio ? "Guardando..." : "Guardar datos"}</button>
      </div>

      <div className="no-print" style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: "#111", margin: 0 }}>Historial de facturas</h2>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #e5e7eb" }}>
              {["No.", "Cliente", "Total", "Estado", "Fecha", ""].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {facturas.map(f => (
              <tr key={f.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "10px 16px", fontWeight: 700, color: "#111" }}>#{f.numero}</td>
                <td style={{ padding: "10px 16px", color: "#555" }}>{f.cliente_nombre}</td>
                <td style={{ padding: "10px 16px", fontWeight: 700, color: "#111" }}>{formatMonto(Number(f.total), f.moneda ?? "COP")} <span style={{ fontSize: 10, color: "#aaa" }}>{f.moneda ?? "COP"}</span></td>
                <td style={{ padding: "10px 16px" }}>
                  <select value={f.estado} onChange={e => cambiarEstado(f.id, e.target.value)} style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: ESTADOS[f.estado]?.bg, color: ESTADOS[f.estado]?.color, border: "none", cursor: "pointer" }}>
                    {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </td>
                <td style={{ padding: "10px 16px", color: "#888" }}>{new Date(f.fecha).toLocaleDateString("es-CO")}</td>
                <td style={{ padding: "10px 16px", display: "flex", gap: 10 }}>
                  <button onClick={() => setFacturaVer(f)} style={{ background: "none", border: "none", color: "#7c3aed", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Ver</button>
                  <button onClick={() => eliminarFactura(f.id)} style={{ background: "none", border: "none", color: "#ccc", fontSize: 12, cursor: "pointer" }}>Eliminar</button>
                </td>
              </tr>
            ))}
            {facturas.length === 0 && (
              <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#ccc" }}>No hay facturas registradas aun.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="no-print" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 560, boxShadow: "0 8px 40px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111", marginBottom: 16 }}>Nueva Factura #{(facturas[0]?.numero ?? 0) + 1}</h2>

            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {(["COP", "USD"] as const).map(m => (
                <button key={m} onClick={() => setForm(prev => ({ ...prev, moneda: m }))} style={{ flex: 1, padding: "9px", borderRadius: 8, border: `2px solid ${form.moneda === m ? "#7c3aed" : "#e5e7eb"}`, background: form.moneda === m ? "#f5f3ff" : "#fff", color: form.moneda === m ? "#7c3aed" : "#888", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  {m === "COP" ? "Pesos (COP)" : "Dolares (USD)"}
                </button>
              ))}
            </div>

            <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, marginBottom: 8 }}>Datos del cliente</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <input placeholder="Nombre del cliente *" value={form.cliente_nombre} onChange={e => setForm(prev => ({ ...prev, cliente_nombre: e.target.value }))} style={{ gridColumn: "1 / -1", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }} />
              <input placeholder="Email" value={form.cliente_email} onChange={e => setForm(prev => ({ ...prev, cliente_email: e.target.value }))} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }} />
              <input placeholder="Telefono" value={form.cliente_telefono} onChange={e => setForm(prev => ({ ...prev, cliente_telefono: e.target.value }))} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }} />
              <input placeholder="Direccion" value={form.cliente_direccion} onChange={e => setForm(prev => ({ ...prev, cliente_direccion: e.target.value }))} style={{ gridColumn: "1 / -1", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none" }} />
            </div>

            <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, marginBottom: 8 }}>Conceptos</p>
            {items.map((it, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 60px 90px 24px", gap: 6, marginBottom: 6, alignItems: "center" }}>
                <input placeholder="Descripcion" value={it.concepto} onChange={e => updateItem(i, "concepto", e.target.value)} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", fontSize: 12, outline: "none" }} />
                <input type="number" placeholder="Cant." value={it.cantidad} onChange={e => updateItem(i, "cantidad", Number(e.target.value))} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 8px", fontSize: 12, outline: "none" }} />
                <input type="number" placeholder="Valor" value={it.valor} onChange={e => updateItem(i, "valor", Number(e.target.value))} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 8px", fontSize: 12, outline: "none" }} />
                <button onClick={() => removeItem(i)} disabled={items.length === 1} style={{ background: "none", border: "none", color: "#ccc", fontSize: 16, cursor: items.length === 1 ? "default" : "pointer" }}>x</button>
              </div>
            ))}
            <button onClick={addItem} style={{ background: "none", border: "1px dashed #d1d5db", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#7c3aed", fontWeight: 700, cursor: "pointer", marginBottom: 16 }}>+ Agregar concepto</button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Descuento</label>
                <input type="number" value={form.descuento} onChange={e => setForm(prev => ({ ...prev, descuento: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Vence (opcional)</label>
                <input type="date" value={form.fecha_vencimiento} onChange={e => setForm(prev => ({ ...prev, fecha_vencimiento: e.target.value }))} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 4 }}>Notas</label>
              <textarea value={form.notas} onChange={e => setForm(prev => ({ ...prev, notas: e.target.value }))} rows={2} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const, resize: "vertical" as const }} />
            </div>

            <div style={{ background: "#f8f9fa", borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#555", marginBottom: 4 }}><span>Subtotal</span><span>{formatMonto(subtotal, form.moneda)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#555", marginBottom: 8 }}><span>Descuento</span><span>-{formatMonto(descuento, form.moneda)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: "#111", borderTop: "1px solid #e5e7eb", paddingTop: 8 }}><span>Total ({form.moneda})</span><span>{formatMonto(total, form.moneda)}</span></div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
              <button onClick={guardarFactura} disabled={saving || !form.cliente_nombre} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>{saving ? "Guardando..." : "Guardar factura"}</button>
            </div>
          </div>
        </div>
      )}

      {facturaVer && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 640, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
            <div className="no-print" style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#111", margin: 0 }}>Factura #{facturaVer.numero}</h2>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={imprimir} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Imprimir / PDF</button>
                <button onClick={() => setFacturaVer(null)} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer" }}>x</button>
              </div>
            </div>

            <div className="print-area" style={{ padding: "60px 36px 36px 36px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {negocio.logo_url && <img src={negocio.logo_url} alt="Logo" style={{ width: 160, height: 160, objectFit: "contain" }} />}
                  
                </div>
                <p style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: 0 }}>Factura</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 30 }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 800, color: "#111", textTransform: "uppercase" as const, margin: 0, marginBottom: 6 }}>Emisor</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#111", margin: 0 }}>{negocio.nombre}</p>
                  <p style={{ fontSize: 11, color: "#555", margin: 0, marginTop: 2, whiteSpace: "pre-line" as const }}>{negocio.direccion}</p>
                  {negocio.telefono && <p style={{ fontSize: 11, color: "#555", margin: 0, marginTop: 2 }}>{negocio.telefono}</p>}
                  {negocio.email && <p style={{ fontSize: 11, color: "#555", margin: 0 }}>{negocio.email}</p>}

                  <p style={{ fontSize: 10, fontWeight: 800, color: "#111", textTransform: "uppercase" as const, margin: 0, marginTop: 16, marginBottom: 6 }}>Cliente</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#111", margin: 0 }}>{facturaVer.cliente_nombre}</p>
                  {facturaVer.cliente_direccion && <p style={{ fontSize: 11, color: "#555", margin: 0, marginTop: 2 }}>{facturaVer.cliente_direccion}</p>}
                  {facturaVer.cliente_email && <p style={{ fontSize: 11, color: "#555", margin: 0 }}>{facturaVer.cliente_email}</p>}
                  {facturaVer.cliente_telefono && <p style={{ fontSize: 11, color: "#555", margin: 0 }}>{facturaVer.cliente_telefono}</p>}
                </div>
                <div style={{ textAlign: "right", fontSize: 11, color: "#333" }}>
                  <p style={{ margin: 0, marginBottom: 4 }}><b>Factura No:</b> {facturaVer.numero}</p>
                  <p style={{ margin: 0, marginBottom: 4 }}><b>Fecha:</b> {new Date(facturaVer.fecha).toLocaleDateString("es-CO")}</p>
                  {facturaVer.fecha_vencimiento && <p style={{ margin: 0, marginBottom: 4 }}><b>Vence:</b> {new Date(facturaVer.fecha_vencimiento).toLocaleDateString("es-CO")}</p>}
                  <p style={{ margin: 0 }}><b>Moneda:</b> {facturaVer.moneda ?? "COP"}</p>
                </div>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 4, border: "1px solid #d1d5db" }}>
                <thead>
                  <tr style={{ background: "#f3f4f6" }}>
                    <th style={{ textAlign: "left", padding: "8px 10px", fontSize: 11, fontWeight: 700, color: "#333", border: "1px solid #d1d5db" }}>Descripcion</th>
                    <th style={{ textAlign: "right", padding: "8px 10px", fontSize: 11, fontWeight: 700, color: "#333", border: "1px solid #d1d5db", width: 60 }}>Cant.</th>
                    <th style={{ textAlign: "right", padding: "8px 10px", fontSize: 11, fontWeight: 700, color: "#333", border: "1px solid #d1d5db", width: 100 }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {(facturaVer.items ?? []).map((it: Item, i: number) => (
                    <tr key={i}>
                      <td style={{ padding: "8px 10px", color: "#111", border: "1px solid #d1d5db" }}>{it.concepto}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right", color: "#555", border: "1px solid #d1d5db" }}>{it.cantidad}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right", color: "#111", border: "1px solid #d1d5db" }}>{formatMonto(it.cantidad * it.valor, facturaVer.moneda ?? "COP")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, marginBottom: 20 }}>
                <table style={{ borderCollapse: "collapse", fontSize: 12, width: 260 }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: "6px 10px", border: "1px solid #d1d5db", fontWeight: 700, color: "#333" }}>Subtotal</td>
                      <td style={{ padding: "6px 10px", border: "1px solid #d1d5db", textAlign: "right" }}>{formatMonto(Number(facturaVer.subtotal), facturaVer.moneda ?? "COP")}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 10px", border: "1px solid #d1d5db", fontWeight: 700, color: "#333" }}>Descuento</td>
                      <td style={{ padding: "6px 10px", border: "1px solid #d1d5db", textAlign: "right" }}>-{formatMonto(Number(facturaVer.descuento), facturaVer.moneda ?? "COP")}</td>
                    </tr>
                    <tr style={{ background: "#f3f4f6" }}>
                      <td style={{ padding: "6px 10px", border: "1px solid #d1d5db", fontWeight: 800 }}>Total</td>
                      <td style={{ padding: "6px 10px", border: "1px solid #d1d5db", textAlign: "right", fontWeight: 800 }}>{formatMonto(Number(facturaVer.total), facturaVer.moneda ?? "COP")}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "6px 10px", border: "1px solid #d1d5db", fontWeight: 700, color: "#333" }}>Moneda</td>
                      <td style={{ padding: "6px 10px", border: "1px solid #d1d5db", textAlign: "right" }}>{facturaVer.moneda ?? "COP"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {facturaVer.notas && (
                <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 12, marginBottom: 12 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, margin: 0, marginBottom: 4 }}>Notas</p>
                  <p style={{ fontSize: 12, color: "#555", margin: 0 }}>{facturaVer.notas}</p>
                </div>
              )}

              
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
