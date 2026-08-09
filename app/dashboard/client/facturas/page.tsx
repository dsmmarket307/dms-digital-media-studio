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

function formatCOP(n: number) {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

type Item = { concepto: string; cantidad: number; valor: number };

export default function FacturasPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [facturas, setFacturas] = useState<any[]>([]);
  const [negocio, setNegocio] = useState({ nombre: "", nit: "", direccion: "", telefono: "", email: "", logo_url: "" });
  const [editandoNegocio, setEditandoNegocio] = useState(false);
  const [guardandoNegocio, setGuardandoNegocio] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [facturaVer, setFacturaVer] = useState<any>(null);
  const [form, setForm] = useState({
    cliente_nombre: "", cliente_email: "", cliente_telefono: "", cliente_direccion: "",
    descuento: "0", fecha: new Date().toISOString().slice(0, 10), fecha_vencimiento: "", notas: "",
  });
  const [items, setItems] = useState<Item[]>([{ concepto: "", cantidad: 1, valor: 0 }]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUserId(user.id);

      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      const { data: sitios } = await supabase.from("generated_websites").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1);
      const sitio = sitios?.[0];
      const contacto = sitio?.generated_content?.contacto ?? {};

      setNegocio({
        nombre: sitio?.project_name ?? prof?.name ?? "",
        nit: prof?.nit ?? "",
        direccion: prof?.direccion ?? contacto.direccion ?? "",
        telefono: prof?.phone ?? contacto.telefono ?? "",
        email: prof?.email ?? contacto.email ?? "",
        logo_url: prof?.logo_url ?? sitio?.logo_url ?? "",
      });

      const { data: f } = await supabase.from("facturas").select("*").eq("user_id", user.id).order("numero", { ascending: false });
      setFacturas(f ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function guardarDatosNegocio() {
    setGuardandoNegocio(true);
    await supabase.from("profiles").update({ nit: negocio.nit, direccion: negocio.direccion, logo_url: negocio.logo_url }).eq("id", userId);
    setGuardandoNegocio(false);
    setEditandoNegocio(false);
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
    const siguienteNumero = (facturas[0]?.numero ?? 0) + 1;
    const { data, error } = await supabase.from("facturas").insert({
      user_id: userId,
      numero: siguienteNumero,
      cliente_nombre: form.cliente_nombre,
      cliente_email: form.cliente_email || null,
      cliente_telefono: form.cliente_telefono || null,
      cliente_direccion: form.cliente_direccion || null,
      items: items.filter(it => it.concepto),
      subtotal, descuento, impuesto: 0, total,
      estado: "pendiente",
      fecha: form.fecha,
      fecha_vencimiento: form.fecha_vencimiento || null,
      notas: form.notas || null,
    }).select().single();
    if (!error && data) {
      setFacturas(prev => [data, ...prev]);
      setForm({ cliente_nombre: "", cliente_email: "", cliente_telefono: "", cliente_direccion: "", descuento: "0", fecha: new Date().toISOString().slice(0, 10), fecha_vencimiento: "", notas: "" });
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
      Subtotal: Number(f.subtotal), Descuento: Number(f.descuento), Total: Number(f.total), Estado: ESTADOS[f.estado]?.label ?? f.estado,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 8 }, { wch: 28 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Facturas");
    XLSX.writeFile(wb, `facturas_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111", margin: 0 }}>Facturas</h1>
          <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Crea y gestiona las facturas de tu negocio</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={exportarExcel} style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid #e5e7eb", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#fff", color: "#555" }}>Exportar Excel</button>
          <button onClick={() => setShowModal(true)} style={{ padding: "9px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#7c3aed", color: "#fff" }}>+ Nueva Factura</button>
        </div>
      </div>

      <div className="no-print" style={{ background: "#fff", borderRadius: 12, border: "1px solid #eee", padding: "16px 20px", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        {editandoNegocio ? (
          <div style={{ flex: 1, minWidth: 260, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input value={negocio.nombre} onChange={e => setNegocio({ ...negocio, nombre: e.target.value })} placeholder="Nombre del negocio" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", fontSize: 12 }} />
            <input value={negocio.nit} onChange={e => setNegocio({ ...negocio, nit: e.target.value })} placeholder="NIT" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", fontSize: 12 }} />
            <input value={negocio.direccion} onChange={e => setNegocio({ ...negocio, direccion: e.target.value })} placeholder="Direccion" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", fontSize: 12 }} />
            <input value={negocio.telefono} onChange={e => setNegocio({ ...negocio, telefono: e.target.value })} placeholder="Telefono" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", fontSize: 12 }} />
            <input value={negocio.email} onChange={e => setNegocio({ ...negocio, email: e.target.value })} placeholder="Email" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", fontSize: 12, gridColumn: "span 2" }} />
          </div>
        ) : (
          <div>
            <p style={{ fontWeight: 800, fontSize: 14, color: "#111", margin: "0 0 4px" }}>{negocio.nombre || "Tu negocio"}</p>
            <p style={{ fontSize: 12, color: "#888", margin: 0 }}>{[negocio.nit && `NIT ${negocio.nit}`, negocio.direccion, negocio.telefono, negocio.email].filter(Boolean).join(" · ")}</p>
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          {editandoNegocio ? (
            <button onClick={guardarDatosNegocio} disabled={guardandoNegocio} style={{ padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#7c3aed", color: "#fff" }}>{guardandoNegocio ? "Guardando..." : "Guardar"}</button>
          ) : (
            <button onClick={() => setEditandoNegocio(true)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #e5e7eb", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#fff", color: "#555" }}>Editar datos</button>
          )}
        </div>
      </div>

      <div className="no-print" style={{ background: "#fff", borderRadius: 12, border: "1px solid #eee", overflow: "hidden" }}>
        {facturas.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#555", marginBottom: 6 }}>Aun no tienes facturas</p>
            <p style={{ fontSize: 12, color: "#aaa" }}>Crea tu primera factura con el boton de arriba</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "1px solid #eee" }}>
                <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, color: "#888", fontWeight: 700 }}>N°</th>
                <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, color: "#888", fontWeight: 700 }}>Cliente</th>
                <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, color: "#888", fontWeight: 700 }}>Fecha</th>
                <th style={{ textAlign: "right", padding: "10px 16px", fontSize: 11, color: "#888", fontWeight: 700 }}>Total</th>
                <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, color: "#888", fontWeight: 700 }}>Estado</th>
                <th style={{ textAlign: "right", padding: "10px 16px", fontSize: 11, color: "#888", fontWeight: 700 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map(f => (
                <tr key={f.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "10px 16px", fontWeight: 700, color: "#111" }}>{f.numero}</td>
                  <td style={{ padding: "10px 16px", color: "#333" }}>{f.cliente_nombre}</td>
                  <td style={{ padding: "10px 16px", color: "#888" }}>{new Date(f.fecha).toLocaleDateString("es-CO")}</td>
                  <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: 700, color: "#111" }}>{formatCOP(Number(f.total))}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <select value={f.estado} onChange={e => cambiarEstado(f.id, e.target.value)} style={{ fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 999, border: "none", background: ESTADOS[f.estado]?.bg, color: ESTADOS[f.estado]?.color, cursor: "pointer" }}>
                      {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "right" }}>
                    <button onClick={() => setFacturaVer(f)} style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", background: "none", border: "none", cursor: "pointer", marginRight: 12 }}>Ver</button>
                    <button onClick={() => eliminarFactura(f.id)} style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="no-print" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <p style={{ fontWeight: 800, fontSize: 16, color: "#111", margin: 0 }}>Nueva Factura</p>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#888" }}>×</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <input value={form.cliente_nombre} onChange={e => setForm({ ...form, cliente_nombre: e.target.value })} placeholder="Nombre del cliente *" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13, gridColumn: "span 2" }} />
              <input value={form.cliente_email} onChange={e => setForm({ ...form, cliente_email: e.target.value })} placeholder="Email (opcional)" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13 }} />
              <input value={form.cliente_telefono} onChange={e => setForm({ ...form, cliente_telefono: e.target.value })} placeholder="Telefono (opcional)" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13 }} />
              <input value={form.cliente_direccion} onChange={e => setForm({ ...form, cliente_direccion: e.target.value })} placeholder="Direccion (opcional)" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13, gridColumn: "span 2" }} />
              <div>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>Fecha</label>
                <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13, boxSizing: "border-box" as const }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>Fecha vencimiento (opcional)</label>
                <input type="date" value={form.fecha_vencimiento} onChange={e => setForm({ ...form, fecha_vencimiento: e.target.value })} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13, boxSizing: "border-box" as const }} />
              </div>
            </div>

            <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", margin: "16px 0 8px" }}>Items</p>

            {items.map((it, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 70px 100px 30px", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <input value={it.concepto} onChange={e => updateItem(i, "concepto", e.target.value)} placeholder="Concepto" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", fontSize: 12 }} />
                <input type="number" value={it.cantidad} onChange={e => updateItem(i, "cantidad", Number(e.target.value))} placeholder="Cant." style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", fontSize: 12 }} />
                <input type="number" value={it.valor} onChange={e => updateItem(i, "valor", Number(e.target.value))} placeholder="Valor" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", fontSize: 12 }} />
                <button onClick={() => removeItem(i)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}>×</button>
              </div>
            ))}
            <button onClick={addItem} style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1px dashed #7c3aed", background: "rgba(124,58,237,0.05)", color: "#7c3aed", fontSize: 12, fontWeight: 700, cursor: "pointer", marginBottom: 16 }}>+ Agregar item</button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>Descuento</label>
                <input type="number" value={form.descuento} onChange={e => setForm({ ...form, descuento: e.target.value })} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13, boxSizing: "border-box" as const }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>Notas (opcional)</label>
                <input value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13, boxSizing: "border-box" as const }} />
              </div>
            </div>

            <div style={{ borderTop: "1px solid #eee", paddingTop: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888", marginBottom: 4 }}>
                <span>Subtotal</span><span>{formatCOP(subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888", marginBottom: 4 }}>
                <span>Descuento</span><span>-{formatCOP(descuento)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: "#111" }}>
                <span>Total</span><span>{formatCOP(total)}</span>
              </div>
            </div>

            <button onClick={guardarFactura} disabled={saving} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, background: "#7c3aed", color: "#fff" }}>
              {saving ? "Guardando..." : "Guardar Factura"}
            </button>
          </div>
        </div>
      )}

      {facturaVer && (
        <div className="no-print" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto" }}>
            <div className="print-area" style={{ padding: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                  {negocio.logo_url && <img src={negocio.logo_url} alt="logo" style={{ height: 40, marginBottom: 8, objectFit: "contain" }} />}
                  <p style={{ fontWeight: 800, fontSize: 15, color: "#111", margin: 0 }}>{negocio.nombre}</p>
                  <p style={{ fontSize: 11, color: "#888", margin: "2px 0 0" }}>{[negocio.nit && `NIT ${negocio.nit}`, negocio.direccion].filter(Boolean).join(" · ")}</p>
                  <p style={{ fontSize: 11, color: "#888", margin: 0 }}>{[negocio.telefono, negocio.email].filter(Boolean).join(" · ")}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: 800, fontSize: 18, color: "#7c3aed", margin: 0 }}>FACTURA N° {facturaVer.numero}</p>
                  <p style={{ fontSize: 12, color: "#888", margin: "4px 0 0" }}>Fecha: {new Date(facturaVer.fecha).toLocaleDateString("es-CO")}</p>
                  {facturaVer.fecha_vencimiento && <p style={{ fontSize: 12, color: "#888", margin: 0 }}>Vence: {new Date(facturaVer.fecha_vencimiento).toLocaleDateString("es-CO")}</p>}
                  <span style={{ display: "inline-block", marginTop: 6, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: ESTADOS[facturaVer.estado]?.bg, color: ESTADOS[facturaVer.estado]?.color }}>{ESTADOS[facturaVer.estado]?.label}</span>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 4 }}>Cliente</p>
                <p style={{ fontWeight: 700, fontSize: 13, color: "#111", margin: 0 }}>{facturaVer.cliente_nombre}</p>
                <p style={{ fontSize: 12, color: "#888", margin: "2px 0 0" }}>{[facturaVer.cliente_email, facturaVer.cliente_telefono, facturaVer.cliente_direccion].filter(Boolean).join(" · ")}</p>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 16 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #111" }}>
                    <th style={{ textAlign: "left", padding: "6px 4px", fontSize: 11, color: "#888" }}>Concepto</th>
                    <th style={{ textAlign: "center", padding: "6px 4px", fontSize: 11, color: "#888" }}>Cant.</th>
                    <th style={{ textAlign: "right", padding: "6px 4px", fontSize: 11, color: "#888" }}>Valor unit.</th>
                    <th style={{ textAlign: "right", padding: "6px 4px", fontSize: 11, color: "#888" }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(facturaVer.items ?? []).map((it: Item, i: number) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "6px 4px" }}>{it.concepto}</td>
                      <td style={{ padding: "6px 4px", textAlign: "center" }}>{it.cantidad}</td>
                      <td style={{ padding: "6px 4px", textAlign: "right" }}>{formatCOP(it.valor)}</td>
                      <td style={{ padding: "6px 4px", textAlign: "right" }}>{formatCOP(it.cantidad * it.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ width: 220 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888", marginBottom: 4 }}>
                    <span>Subtotal</span><span>{formatCOP(Number(facturaVer.subtotal))}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888", marginBottom: 4 }}>
                    <span>Descuento</span><span>-{formatCOP(Number(facturaVer.descuento))}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: "#111", borderTop: "1px solid #eee", paddingTop: 6, marginTop: 4 }}>
                    <span>Total</span><span>{formatCOP(Number(facturaVer.total))}</span>
                  </div>
                </div>
              </div>

              {facturaVer.notas && (
                <div style={{ marginTop: 20, paddingTop: 12, borderTop: "1px solid #eee" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", marginBottom: 4 }}>Notas</p>
                  <p style={{ fontSize: 12, color: "#555", margin: 0 }}>{facturaVer.notas}</p>
                </div>
              )}
            </div>

            <div className="no-print" style={{ display: "flex", gap: 8, padding: "16px 32px", borderTop: "1px solid #eee" }}>
              <button onClick={imprimir} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #e5e7eb", cursor: "pointer", fontSize: 13, fontWeight: 700, background: "#fff", color: "#555" }}>Imprimir / PDF</button>
              <button onClick={() => setFacturaVer(null)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, background: "#7c3aed", color: "#fff" }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
