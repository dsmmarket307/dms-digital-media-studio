"use client";
import { useEffect, useState } from "react";

export default function EstrellasProducto({ siteId, productoIndex }: { siteId: string; productoIndex: number }) {
  const [data, setData] = useState<{ total: number; promedio: number } | null>(null);

  useEffect(() => {
    fetch(`/api/resenas?site_id=${siteId}&producto_index=${productoIndex}`)
      .then(r => r.json())
      .then(d => {
        const resenas = d.resenas ?? [];
        const total = resenas.length;
        const promedio = total > 0 ? resenas.reduce((a: number, r: any) => a + r.calificacion, 0) / total : 0;
        setData({ total, promedio });
      });
  }, [siteId, productoIndex]);

  if (!data) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill={s <= Math.round(data.promedio) ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span style={{ fontSize: "0.72rem", color: "#888" }}>({data.total})</span>
    </div>
  );
}