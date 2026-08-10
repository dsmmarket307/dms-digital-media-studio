"use client";
import { useState } from "react";

export type DateFilterValue = {
  modo: "todos" | "hoy" | "semana" | "mes" | "anio" | "rango";
  desde: string | null;
  hasta: string | null;
};

function pad(n: number) { return n < 10 ? "0" + n : "" + n; }
function toISODate(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

export function calcularRango(modo: DateFilterValue["modo"], rangoManual?: { desde: string; hasta: string }): { desde: string | null; hasta: string | null } {
  const hoy = new Date();
  if (modo === "todos") return { desde: null, hasta: null };
  if (modo === "hoy") {
    const iso = toISODate(hoy);
    return { desde: iso, hasta: iso };
  }
  if (modo === "semana") {
    const dia = hoy.getDay();
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((dia + 6) % 7));
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    return { desde: toISODate(lunes), hasta: toISODate(domingo) };
  }
  if (modo === "mes") {
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    return { desde: toISODate(inicio), hasta: toISODate(fin) };
  }
  if (modo === "anio") {
    const inicio = new Date(hoy.getFullYear(), 0, 1);
    const fin = new Date(hoy.getFullYear(), 11, 31);
    return { desde: toISODate(inicio), hasta: toISODate(fin) };
  }
  if (modo === "rango" && rangoManual) {
    return { desde: rangoManual.desde || null, hasta: rangoManual.hasta || null };
  }
  return { desde: null, hasta: null };
}

export function filtrarPorFecha<T extends Record<string, any>>(items: T[], campo: string, filtro: DateFilterValue): T[] {
  if (filtro.modo === "todos" || (!filtro.desde && !filtro.hasta)) return items;
  return items.filter(it => {
    const raw = it[campo];
    if (!raw) return false;
    const fecha = String(raw).slice(0, 10);
    if (filtro.desde && fecha < filtro.desde) return false;
    if (filtro.hasta && fecha > filtro.hasta) return false;
    return true;
  });
}

const OPCIONES: { key: DateFilterValue["modo"]; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "hoy", label: "Hoy" },
  { key: "semana", label: "Semana" },
  { key: "mes", label: "Mes" },
  { key: "anio", label: "Ano" },
  { key: "rango", label: "Rango" },
];

export default function DateFilter({ value, onChange }: { value: DateFilterValue; onChange: (v: DateFilterValue) => void }) {
  const [desdeTmp, setDesdeTmp] = useState(value.desde ?? "");
  const [hastaTmp, setHastaTmp] = useState(value.hasta ?? "");

  function selectModo(modo: DateFilterValue["modo"]) {
    if (modo === "rango") {
      onChange({ modo, desde: desdeTmp || null, hasta: hastaTmp || null });
      return;
    }
    const rango = calcularRango(modo);
    onChange({ modo, ...rango });
  }

  function aplicarRango() {
    onChange({ modo: "rango", desde: desdeTmp || null, hasta: hastaTmp || null });
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
      {OPCIONES.map(o => (
        <button
          key={o.key}
          onClick={() => selectModo(o.key)}
          style={{
            fontSize: 12,
            fontWeight: 700,
            padding: "6px 14px",
            borderRadius: 8,
            border: value.modo === o.key ? "1px solid #7c3aed" : "1px solid #e5e7eb",
            background: value.modo === o.key ? "rgba(124,58,237,0.08)" : "#fff",
            color: value.modo === o.key ? "#7c3aed" : "#555",
            cursor: "pointer",
          }}
        >
          {o.label}
        </button>
      ))}
      {value.modo === "rango" && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input type="date" value={desdeTmp} onChange={e => setDesdeTmp(e.target.value)} style={{ fontSize: 12, border: "1px solid #e5e7eb", borderRadius: 8, padding: "5px 8px" }} />
          <span style={{ fontSize: 12, color: "#aaa" }}>a</span>
          <input type="date" value={hastaTmp} onChange={e => setHastaTmp(e.target.value)} style={{ fontSize: 12, border: "1px solid #e5e7eb", borderRadius: 8, padding: "5px 8px" }} />
          <button onClick={aplicarRango} style={{ fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", cursor: "pointer" }}>Aplicar</button>
        </div>
      )}
    </div>
  );
}