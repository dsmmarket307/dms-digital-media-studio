"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Facturacion() {
  const router = useRouter();
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(prof);
      const { data } = await supabase.from("package_orders").select("*").eq("customer_email", prof?.email).order("created_at", { ascending: false });
      setOrders(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div style={{ width: 40, height: 40, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const planActivo = orders.find(o => o.status === "approved");

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
            { href: "/dashboard/client/reservas", label: "Reservas" },
            { href: "/dashboard/client/leads", label: "Leads" },
            { href: "/dashboard/client/facturacion", label: "Facturacion", active: true },
            { href: "/dashboard/client/soporte", label: "Soporte" },
          ].map(item => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${item.active ? "bg-purple-50 text-purple-600" : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"}`}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 px-6 py-8 max-w-4xl w-full mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Facturacion</h1>
          <p className="text-gray-500 text-sm mt-1">Tu plan activo e historial de pagos.</p>
        </div>
        {planActivo && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 mb-8">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-widest mb-2">Plan activo</p>
            <h2 className="text-xl font-bold text-gray-900">{planActivo.package_name}</h2>
            <p className="text-gray-500 text-sm mt-1">Comprado el {new Date(planActivo.created_at).toLocaleDateString("es-CO")}</p>
            <p className="text-2xl font-bold text-purple-600 mt-3">${Number(planActivo.price).toLocaleString("es-CO")} COP</p>
            <span className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">Activo</span>
          </div>
        )}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Historial de pagos</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Paquete", "Valor", "Estado", "ID Pago", "Fecha"].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">{o.package_name}</td>
                  <td className="px-6 py-4 text-gray-700">${Number(o.price).toLocaleString("es-CO")}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: o.status === "approved" ? "#10b98122" : "#f59e0b22", color: o.status === "approved" ? "#10B981" : "#F59E0B" }}>
                      {o.status === "approved" ? "Aprobado" : o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{o.mercadopago_payment_id ?? "---"}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(o.created_at).toLocaleDateString("es-CO")}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No hay pagos registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}