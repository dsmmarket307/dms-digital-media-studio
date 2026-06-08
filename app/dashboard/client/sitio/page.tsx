"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function MiSitio() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({
    business_name: "", description: "", phone: "", whatsapp: "",
    address: "", facebook: "", instagram: "", tiktok: "", primary_color: "#7c3aed", logo_url: "",
  });
  const [userId, setUserId] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUserId(user.id);
      const { data } = await supabase.from("site_settings").select("*").eq("user_id", user.id).single();
      if (data) { setSettings(data); setLogoPreview(data.logo_url ?? ""); }
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    let logo_url = settings.logo_url;
    if (logoFile) {
      const ext = logoFile.name.split(".").pop();
      const path = `logos/${userId}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("logos").upload(path, logoFile, { upsert: true });
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);
        logo_url = urlData.publicUrl;
      }
    }
    const payload = { ...settings, logo_url, user_id: userId, updated_at: new Date().toISOString() };
    const { data: existing } = await supabase.from("site_settings").select("id").eq("user_id", userId).single();
    if (existing) {
      await supabase.from("site_settings").update(payload).eq("user_id", userId);
    } else {
      await supabase.from("site_settings").insert(payload);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
            { href: "/dashboard/client/sitio", label: "Mi Sitio Web", active: true },
            { href: "/dashboard/client/galeria", label: "Galeria" },
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
        <div className="p-4 border-t border-gray-100">
          <Link href="/dashboard/client" className="text-sm text-gray-500 px-4 py-2 block hover:text-purple-600">Volver al inicio</Link>
        </div>
      </aside>

      <main className="flex-1 px-6 py-8 max-w-3xl w-full mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Mi Sitio Web</h1>
          <p className="text-gray-500 text-sm mt-1">Personaliza la informacion de tu negocio.</p>
        </div>

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-6">
            Cambios guardados correctamente.
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Logo</h2>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" /> : <span className="text-xs text-gray-400">Sin logo</span>}
              </div>
              <div>
                <input type="file" accept="image/png,image/jpg,image/jpeg,image/webp" onChange={handleLogoChange} className="hidden" id="logo-upload" />
                <label htmlFor="logo-upload" className="cursor-pointer bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors">
                  Subir logo
                </label>
                <p className="text-xs text-gray-400 mt-2">PNG, JPG o WEBP. Max 2MB.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-bold text-gray-900 mb-2">Informacion del negocio</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nombre del negocio</label>
              <input type="text" value={settings.business_name} onChange={e => setSettings({ ...settings, business_name: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600" placeholder="Mi Negocio" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descripcion</label>
              <textarea value={settings.description} onChange={e => setSettings({ ...settings, description: e.target.value })} rows={3} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600" placeholder="Describe tu negocio..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Telefono</label>
                <input type="text" value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600" placeholder="+57 300 000 0000" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">WhatsApp</label>
                <input type="text" value={settings.whatsapp} onChange={e => setSettings({ ...settings, whatsapp: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600" placeholder="+57 300 000 0000" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Direccion</label>
              <input type="text" value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600" placeholder="Calle 123, Ciudad" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-bold text-gray-900 mb-2">Redes sociales</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Facebook</label>
              <input type="text" value={settings.facebook} onChange={e => setSettings({ ...settings, facebook: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600" placeholder="https://facebook.com/minegocio" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Instagram</label>
              <input type="text" value={settings.instagram} onChange={e => setSettings({ ...settings, instagram: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600" placeholder="https://instagram.com/minegocio" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">TikTok</label>
              <input type="text" value={settings.tiktok} onChange={e => setSettings({ ...settings, tiktok: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:border-purple-600" placeholder="https://tiktok.com/@minegocio" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Color principal</h2>
            <div className="flex items-center gap-4">
              <input type="color" value={settings.primary_color} onChange={e => setSettings({ ...settings, primary_color: e.target.value })} className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer" />
              <span className="text-sm text-gray-600">{settings.primary_color}</span>
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors disabled:opacity-50">
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </main>
    </div>
  );
}
