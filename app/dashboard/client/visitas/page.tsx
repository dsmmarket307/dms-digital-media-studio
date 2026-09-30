"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const ETQ: Record<string, string> = {
  solicitud_recibida: "Solicitud recibida",
  pago_pendiente: "Pago pendiente",
  pago_recibido: "Pago recibido",
  pendiente_agendamiento: "Pendiente de agendamiento",
  visita_agendada: "Visita agendada",
  visita_confirmada: "Visita confirmada",
  visita_realizada: "Visita realizada",
  cotizacion_generada: "Cotizacion generada",
  descontada_cotizacion: "Descontada de cotizacion",
  servicio_no_contratado: "Servicio no contratado",
  cancelada: "Cancelada",
};
const CON_PAGO = ["pago_recibido", "pendiente_agendamiento", "visita_agendada", "visita_confirmada", "visita_realizada", "cotizacion_generada", "servicio_no_contratado", "cancelada"];
const cop = (n: any) => "$" + Number(n || 0).toLocaleString("es-CO") + " COP";
const inp: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", fontSize: 13, outline: "none", boxSizing: "border-box" };
const btn: React.CSSProperties = { background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" };

function Tarjeta({ v, c, llamar, recargar, setMsg }: { v: any; c: any; llamar: (b: any) => Promise<any>; recargar: () => Promise<void>; setMsg: (s: string) => void }) {
  const [metodo, setMetodo] = useState("Nequi");
  const [ref, setRef] = useState("");
  const [valorPago, setValorPago] = useState(String(v.valor_cobrado));
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().slice(0, 10));
  const [estadoSel, setEstadoSel] = useState("");
  const [fechaVisita, setFechaVisita] = useState("");
  const [cot, setCot] = useState("");

  async function accion(body: any, ok?: (j: any) => string) {
    setMsg("");
    const j = await llamar({ id: v.id, ...body });
    if (j) { setMsg(ok ? ok(j) : "Listo."); await recargar(); }
  }

  const pagada = !!v.pago_fecha;
  const cerrada = v.estado === "cancelada" || v.estado === "servicio_no_contratado" || v.estado === "descontada_cotizacion";
  const ciudad = c ? (c.ciudad === "Otra" ? c.ciudad_otra : c.ciudad) : "";

  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <p style={{ margin: 0, fontWeight: 800, color: "#111" }}>{c?.nombre ?? "Cliente"}</p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#666" }}>{c?.celular} {c?.correo ? " | " + c.correo : ""}</p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#666" }}>{c?.tipo_inmueble} | {c?.servicio} | {ciudad} | {c?.direccion}</p>
        </div>
        <span style={{ alignSelf: "flex-start", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "#ede9fe", color: "#7c3aed" }}>{ETQ[v.estado] ?? v.estado}</span>
      </div>
      <p style={{ fontSize: 12, color: "#444", margin: "10px 0 0" }}>
        Valor de la visita: <strong>{cop(v.valor_cobrado)}</strong>
        {pagada && <> | Pago: {cop(v.pago_valor)} por {v.pago_metodo} el {new Date(v.pago_fecha).toLocaleDateString("es-CO")}{v.pago_referencia ? " (ref. " + v.pago_referencia + ")" : ""}</>}
        {v.fecha_visita && <> | Visita: {new Date(v.fecha_visita).toLocaleString("es-CO")}</>}
        {v.descuento_aplicado && <> | Descontado {cop(v.descuento_valor)} de cotizacion {cop(v.cotizacion_valor)}. Saldo: {cop(Number(v.cotizacion_valor) - Number(v.descuento_valor))}</>}
      </p>

      {!pagada && v.estado !== "cancelada" && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
          <select style={inp} value={metodo} onChange={e => setMetodo(e.target.value)}>
            <option>Nequi</option><option>Davivienda</option><option>Efectivo</option><option>Otro</option>
          </select>
          <input style={{ ...inp, width: 110 }} value={valorPago} onChange={e => setValorPago(e.target.value)} placeholder="Valor" />
          <input style={inp} type="date" value={fechaPago} onChange={e => setFechaPago(e.target.value)} />
          <input style={{ ...inp, width: 160 }} value={ref} onChange={e => setRef(e.target.value)} placeholder="Referencia / comprobante" />
          <button style={btn} onClick={() => accion({ accion: "pago", metodo, valor: Number(valorPago), fecha: fechaPago, referencia: ref }, () => "Pago registrado.")}>Registrar pago</button>
          <button style={{ ...btn, background: "#ef4444" }} onClick={() => { if (confirm("Cancelar esta visita?")) accion({ accion: "estado", estado: "cancelada" }); }}>Cancelar visita</button>
        </div>
      )}

      {pagada && !cerrada && (
        <>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
            <select style={inp} value={estadoSel} onChange={e => setEstadoSel(e.target.value)}>
              <option value="">Cambiar estado...</option>
              {CON_PAGO.filter(k => k !== v.estado).map(k => <option key={k} value={k}>{ETQ[k]}</option>)}
            </select>
            {(estadoSel === "visita_agendada" || estadoSel === "visita_confirmada") && (
              <input style={inp} type="datetime-local" value={fechaVisita} onChange={e => setFechaVisita(e.target.value)} />
            )}
            <button style={btn} disabled={!estadoSel} onClick={() => accion({ accion: "estado", estado: estadoSel, fecha_visita: fechaVisita ? new Date(fechaVisita).toISOString() : undefined }, () => "Estado actualizado.")}>Guardar estado</button>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10, alignItems: "center" }}>
            <input style={{ ...inp, width: 170 }} value={cot} onChange={e => setCot(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="Valor de la cotizacion" />
            <button style={btn} onClick={() => accion({ accion: "descuento", cotizacion_valor: Number(cot) }, j => "Descuento aplicado. Saldo a pagar: " + cop(j.saldo))}>Aplicar descuento de la visita</button>
            <button style={{ ...btn, background: "#6b7280" }} onClick={() => { if (confirm("Marcar como servicio no contratado?")) accion({ accion: "estado", estado: "servicio_no_contratado" }); }}>Servicio no contratado</button>
          </div>
        </>
      )}
    </div>
  );
}

export default function VisitasCM() {
  const router = useRouter();
  const supabase = createClient();
  const [data, setData] = useState<any>({ visitas: [], cotizaciones: [], precio: null });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [precio, setPrecio] = useState("");

  async function llamar(body: any) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/auth/login"); return null; }
    const res = await fetch("/api/visitas-cm", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token }, body: JSON.stringify(body) });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) { setMsg(j?.error || "Error."); return null; }
    return j;
  }

  async function cargar() {
    const j = await llamar({ accion: "listar" });
    if (j) { setData(j); setPrecio(j.precio != null ? String(Number(j.precio)) : ""); }
    setLoading(false);
  }

  useEffect(() => { cargar(); }, []);

  async function guardarPrecio() {
    setMsg("");
    const j = await llamar({ accion: "precio", valor: Number(precio) });
    if (j) { setMsg("Precio guardado. Solo aplica a visitas nuevas."); await cargar(); }
  }

  if (loading) return <div style={{ padding: "2rem" }}>Cargando...</div>;

  return (
    <div style={{ padding: "2rem", minWidth: 0, maxWidth: 980 }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111", margin: 0 }}>Visitas tecnicas</h1>
      <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Pago anticipado, agendamiento y descuento en la cotizacion.</p>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, margin: "16px 0" }}>
        <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>Configuracion - Precios - Visita tecnica</p>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input style={{ ...inp, width: 140 }} value={precio} onChange={e => setPrecio(e.target.value.replace(/[^0-9.]/g, ""))} />
          <span style={{ fontSize: 13, color: "#555" }}>COP</span>
          <button style={btn} onClick={guardarPrecio}>Guardar precio</button>
        </div>
      </div>

      {msg && <p style={{ background: "#f5f3ff", color: "#5b21b6", padding: "8px 12px", borderRadius: 8, fontSize: 13 }}>{msg}</p>}

      {data.visitas.length === 0 && <p style={{ color: "#aaa" }}>No hay visitas aun.</p>}
      {data.visitas.map((v: any) => (
        <Tarjeta key={v.id} v={v} c={data.cotizaciones.find((x: any) => x.id === v.cotizacion_id)} llamar={llamar} recargar={cargar} setMsg={setMsg} />
      ))}
    </div>
  );
}