"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Reservas() {
  const router = useRouter();
  const supabase = createClient();
  const [reservas, setReservas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data } = await supabase.from("reservas").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setReservas(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const ESTADO_COLORS: Record<string, string> = {
    pendiente: "#F59E0B",
    confirmada: "#10B981",
    cancelada: "#EF4444",
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div style={{ width: 40, height: 40, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100">
          <Link href="/dashboard/client"><Image src="/logo-dms.png" alt="DMS" width={120} height={38} /></Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {[
            { href: "/dashboard/client", label: "Inicio" },
            { href: "/dashboard/client/sitio", label: "Mi Sitio Web" },
            { href: "/dashboard/client/galeria", label: "Galeria" },
            { href: "/dashboard/client/reservas", label: "Reservas", active: true },
            { href: "/dashboard/client/leads", label: "Leads" },
            { href: "/dashboard/client/facturacion", label: "Facturacion" },
            { href: "/dashboard/client/soporte", label: "Soporte" },
          ].map(item => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${item.active ? "bg-purple-50 text-purple-600" : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"}`}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 px-6 py-8 max-w-5xl w-full mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
          <p className="text-gray-500 text-sm mt-1">Reservas recibidas en tu sitio web.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total", value: reservas.length, color: "#7c3aed" },
            { label: "Pendientes", value: reservas.filter(r => r.estado === "pendiente").length, color: "#F59E0B" },
            { label: "Confirmadas", value: reservas.filter(r => r.estado === "confirmada").length, color: "#10B981" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Nombre", "Telefono", "Fecha", "Hora", "Personas", "Estado"].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reservas.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">{r.nombre}</td>
                  <td className="px-6 py-4 text-gray-600">{r.telefono ?? "---"}</td>
                  <td className="px-6 py-4 text-gray-600">{r.fecha ? new Date(r.fecha).toLocaleDateString("es-CO") : "---"}</td>
                  <td className="px-6 py-4 text-gray-600">{r.hora ?? "---"}</td>
                  <td className="px-6 py-4 text-gray-600">{r.personas ?? "---"}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: `${ESTADO_COLORS[r.estado] ?? "#6b7280"}22`, color: ESTADO_COLORS[r.estado] ?? "#6b7280" }}>
                      {r.estado}
                    </span>
                  </td>
                </tr>
              ))}
              {reservas.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No hay reservas aun.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}