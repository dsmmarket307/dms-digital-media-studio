"use client";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import DateFilter, { DateFilterValue, filtrarPorFecha } from "@/components/DateFilter";

function formatCOP(n: number) {
  return "$" + Math.round(n || 0).toLocaleString("es-CO");
}

type Producto = {
  id: string;
  nombre: string;
  sku: string | null;
  categoria: string | null;
  costo: number;
  precio_venta: number;
  stock: number;
  stock_minimo: number;
  proveedor: string | null;
  notas: string | null;
  updated_at: string;
};

const FORM_VACIO = {
  nombre: "", sku: "", categoria: "", costo: "0", precio_venta: "0",
  stock: "0", stock_minimo: "5", proveedor: "", notas: "",
};

export default function InventarioPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({ modo: "todos", desde: null, hasta: null });
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [saving, setSaving] = useState(false);
  const [soloBajoStock, setSoloBajoStock] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUserId(user.id);
      const { data } = await supabase.from("inventario").select("*").eq("user_id", user.id).order("nombre", { ascending: true });
      setProductos(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtrados = useMemo(() => {
    let list = productos;
    list = filtrarPorFecha(list, "updated_at", dateFilter);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      list = list.filter(p => p.nombre.toLowerCase().includes(q) || (p.sku ?? "").toLowerCase().includes(q) || (p.categoria ?? "").toLowerCase().includes(q));
    }
    if (soloBajoStock) list = list.filter(p => p.stock <= p.stock_minimo);
    return list;
  }, [productos, dateFilter, busqueda, soloBajoStock]);

  const valorTotalInventario = useMemo(() => productos.reduce((s, p) => s + p.stock * p.costo, 0), [productos]);
  const bajoStockCount = useMemo(() => productos.filter(p => p.stock <= p.stock_minimo).length, [productos]);
  const margenPromedio = useMemo(() => {
    const conPrecio = productos.filter(p => p.precio_venta > 0);
    if (conPrecio.length === 0) return 0;
    const suma = conPrecio.reduce((s, p) => s + ((p.precio_venta - p.costo) / p.precio_venta) * 100, 0);
    return suma / conPrecio.length;
  }, [productos]);

  function abrirNuevo() {
    setEditando(null);
    setForm(FORM_VACIO);
    setShowModal(true);
  }

  function abrirEditar(p: Producto) {
    setEditando(p);
    setForm({
      nombre: p.nombre, sku: p.sku ?? "", categoria: p.categoria ?? "",
      costo: String(p.costo), precio_venta: String(p.precio_venta),
      stock: String(p.stock), stock_minimo: String(p.stock_minimo),
      proveedor: p.proveedor ?? "", notas: p.notas ?? "",
    });
    setShowModal(true);
  }

  async function guardar() {
    if (!form.nombre.trim()) return;
    setSaving(true);
    const payload = {
      user_id: userId,
      nombre: form.nombre.trim(),
      sku: form.sku.trim() || null,
      categoria: form.categoria.trim() || null,
      costo: Number(form.costo) || 0,
      precio_venta: Number(form.precio_venta) || 0,
      stock: Number(form.stock) || 0,
      stock_minimo: Number(form.stock_minimo) || 0,
      proveedor: form.proveedor.trim() || null,
      notas: form.notas.trim() || null,
      updated_at: new Date().toISOString(),
    };
    if (editando) {
      const { data } = await supabase.from("inventario").update(payload).eq("id", editando.id).select().single();
      if (data) setProductos(prev => prev.map(p => p.id === editando.id ? data : p));
    } else {
      const { data } = await supabase.from("inventario").insert(payload).select().single();
      if (data) setProductos(prev => [...prev, data]);
    }
    setSaving(false);
    setShowModal(false);
  }

  async function eliminar(id: string) {
    if (!confirm("Eliminar este producto del inventario?")) return;
    await supabase.from("inventario").delete().eq("id", id);
    setProductos(prev => prev.filter(p => p.id !== id));
  }

  function exportarExcel() {
    const rows = filtrados.map(p => ({
      Nombre: p.nombre, SKU: p.sku ?? "", Categoria: p.categoria ?? "",
      Costo: p.costo, "Precio Venta": p.precio_venta, Stock: p.stock, "Stock Minimo": p.stock_minimo,
      Margen_pct: p.precio_venta > 0 ? Math.round(((p.precio_venta - p.costo) / p.precio_venta) * 100) : 0,
      Proveedor: p.proveedor ?? "",
      Actualizado: new Date(p.updated_at).toLocaleDateString("es-CO"),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 24 }, { wch: 12 }, { wch: 16 }, { wch: 10 }, { wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 18 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario");
    XLSX.writeFile(wb, `inventario_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img src="/favicon-32.png" alt="Cargando" style={{ width: 44, height: 44, animation: "spin 1s linear infinite", borderRadius: 10 }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ padding: "2rem", minWidth: 0, background: "#f8f9fa", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111", margin: 0 }}>Inventario</h1>
          <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Controla tu stock, costos y margenes</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={exportarExcel} style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid #e5e7eb", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#fff", color: "#555" }}>Exportar Excel</button>
          <button onClick={abrirNuevo} style={{ padding: "9px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, background: "#7c3aed", color: "#fff" }}>+ Nuevo Producto</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #eee", padding: 18 }}>
          <p style={{ fontSize: 11, color: "#888", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Valor total inventario</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: 0 }}>{formatCOP(valorTotalInventario)}</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 12, border: bajoStockCount > 0 ? "1px solid #fecaca" : "1px solid #eee", padding: 18 }}>
          <p style={{ fontSize: 11, color: "#888", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Productos con bajo stock</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: bajoStockCount > 0 ? "#dc2626" : "#111", margin: 0 }}>{bajoStockCount}</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #eee", padding: 18 }}>
          <p style={{ fontSize: 11, color: "#888", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Margen promedio</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: 0 }}>{margenPromedio.toFixed(0)}%</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #eee", padding: 18 }}>
          <p style={{ fontSize: 11, color: "#888", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Total productos</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: 0 }}>{productos.length}</p>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #eee", padding: "14px 18px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
        <DateFilter value={dateFilter} onChange={setDateFilter} />
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre, SKU o categoria..." style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 12px", fontSize: 12, minWidth: 220 }} />
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#555", cursor: "pointer" }}>
            <input type="checkbox" checked={soloBajoStock} onChange={e => setSoloBajoStock(e.target.checked)} />
            Solo bajo stock
          </label>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #eee", overflow: "hidden" }}>
        {filtrados.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#555", marginBottom: 6 }}>{productos.length === 0 ? "Aun no tienes productos en tu inventario" : "Ningun producto coincide con el filtro"}</p>
            {productos.length === 0 && <p style={{ fontSize: 12, color: "#aaa" }}>Agrega tu primer producto con el boton de arriba</p>}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#fafafa", borderBottom: "1px solid #eee" }}>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, color: "#888", fontWeight: 700 }}>Producto</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, color: "#888", fontWeight: 700 }}>SKU</th>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, color: "#888", fontWeight: 700 }}>Categoria</th>
                  <th style={{ textAlign: "right", padding: "10px 16px", fontSize: 11, color: "#888", fontWeight: 700 }}>Costo</th>
                  <th style={{ textAlign: "right", padding: "10px 16px", fontSize: 11, color: "#888", fontWeight: 700 }}>Precio</th>
                  <th style={{ textAlign: "right", padding: "10px 16px", fontSize: 11, color: "#888", fontWeight: 700 }}>Margen</th>
                  <th style={{ textAlign: "center", padding: "10px 16px", fontSize: 11, color: "#888", fontWeight: 700 }}>Stock</th>
                  <th style={{ textAlign: "right", padding: "10px 16px", fontSize: 11, color: "#888", fontWeight: 700 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(p => {
                  const margen = p.precio_venta > 0 ? Math.round(((p.precio_venta - p.costo) / p.precio_venta) * 100) : 0;
                  const bajo = p.stock <= p.stock_minimo;
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "10px 16px", fontWeight: 700, color: "#111" }}>{p.nombre}</td>
                      <td style={{ padding: "10px 16px", color: "#888" }}>{p.sku || "—"}</td>
                      <td style={{ padding: "10px 16px", color: "#888" }}>{p.categoria || "—"}</td>
                      <td style={{ padding: "10px 16px", textAlign: "right", color: "#555" }}>{formatCOP(p.costo)}</td>
                      <td style={{ padding: "10px 16px", textAlign: "right", color: "#111", fontWeight: 700 }}>{formatCOP(p.precio_venta)}</td>
                      <td style={{ padding: "10px 16px", textAlign: "right", color: margen >= 30 ? "#059669" : margen >= 10 ? "#d97706" : "#dc2626", fontWeight: 700 }}>{margen}%</td>
                      <td style={{ padding: "10px 16px", textAlign: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: bajo ? "#fee2e2" : "#d1fae5", color: bajo ? "#dc2626" : "#059669" }}>{p.stock}</span>
                      </td>
                      <td style={{ padding: "10px 16px", textAlign: "right" }}>
                        <button onClick={() => abrirEditar(p)} style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", background: "none", border: "none", cursor: "pointer", marginRight: 12 }}>Editar</button>
                        <button onClick={() => eliminar(p.id)} style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>Eliminar</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <p style={{ fontWeight: 800, fontSize: 16, color: "#111", margin: 0 }}>{editando ? "Editar Producto" : "Nuevo Producto"}</p>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#888" }}>×</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del producto *" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13, gridColumn: "span 2" }} />
              <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="SKU / codigo" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13 }} />
              <input value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} placeholder="Categoria" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13 }} />
              <div>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>Costo de compra</label>
                <input type="number" value={form.costo} onChange={e => setForm({ ...form, costo: e.target.value })} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13, boxSizing: "border-box" as const }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>Precio de venta</label>
                <input type="number" value={form.precio_venta} onChange={e => setForm({ ...form, precio_venta: e.target.value })} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13, boxSizing: "border-box" as const }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>Stock actual</label>
                <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13, boxSizing: "border-box" as const }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 4 }}>Stock minimo (alerta)</label>
                <input type="number" value={form.stock_minimo} onChange={e => setForm({ ...form, stock_minimo: e.target.value })} style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13, boxSizing: "border-box" as const }} />
              </div>
              <input value={form.proveedor} onChange={e => setForm({ ...form, proveedor: e.target.value })} placeholder="Proveedor (opcional)" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13, gridColumn: "span 2" }} />
              <input value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Notas (opcional)" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 10px", fontSize: 13, gridColumn: "span 2" }} />
            </div>

            <button onClick={guardar} disabled={saving || !form.nombre.trim()} style={{ width: "100%", marginTop: 18, padding: "12px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, background: "#7c3aed", color: "#fff", opacity: saving || !form.nombre.trim() ? 0.6 : 1 }}>
              {saving ? "Guardando..." : editando ? "Guardar cambios" : "Agregar producto"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}