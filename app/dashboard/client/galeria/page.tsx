"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Galeria() {
  const router = useRouter();
  const supabase = createClient();
  const [imagenes, setImagenes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUserId(user.id);
      const { data } = await supabase.from("archivos").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setImagenes(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `galeria/${userId}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("logos").upload(path, file, { upsert: true });
      if (!error) {
        const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
        await supabase.from("archivos").insert({ user_id: userId, url: urlData.publicUrl, nombre: file.name, tipo: "imagen" });
      }
    }
    const { data } = await supabase.from("archivos").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setImagenes(data ?? []);
    setUploading(false);
  }

  async function handleDelete(id: string, url: string) {
    await supabase.from("archivos").delete().eq("id", id);
    setImagenes(prev => prev.filter(i => i.id !== id));
  }

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
            { href: "/dashboard/client/galeria", label: "Galeria", active: true },
            { href: "/dashboard/client/reservas", label: "Reservas" },
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Galeria</h1>
            <p className="text-gray-500 text-sm mt-1">Administra las imagenes de tu sitio web.</p>
          </div>
          <div>
            <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" id="galeria-upload" />
            <label htmlFor="galeria-upload" className="cursor-pointer bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors">
              {uploading ? "Subiendo..." : "Subir imagenes"}
            </label>
          </div>
        </div>
        {imagenes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <p className="text-gray-400 mb-4">No hay imagenes aun.</p>
            <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" id="galeria-upload-empty" />
            <label htmlFor="galeria-upload-empty" className="cursor-pointer bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors">
              Subir primera imagen
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {imagenes.map(img => (
              <div key={img.id} className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="relative w-full h-40">
                  <img src={img.url} alt={img.nombre} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500 truncate">{img.nombre}</p>
                </div>
                <button onClick={() => handleDelete(img.id, img.url)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  x
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
