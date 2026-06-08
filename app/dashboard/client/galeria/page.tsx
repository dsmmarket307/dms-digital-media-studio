"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ padding: "2rem", minWidth: 0 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111", margin: 0 }}>Galeria</h1>
          <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Administra las imagenes de tu sitio web.</p>
        </div>
        <div>
          <input type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: "none" }} id="galeria-upload" />
          <label htmlFor="galeria-upload" style={{ cursor: "pointer", background: "#7c3aed", color: "#fff", padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
            {uploading ? "Subiendo..." : "Subir imagenes"}
          </label>
        </div>
      </div>
      {imagenes.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "4rem", textAlign: "center" }}>
          <p style={{ color: "#aaa", marginBottom: 16 }}>No hay imagenes aun.</p>
          <input type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: "none" }} id="galeria-upload-empty" />
          <label htmlFor="galeria-upload-empty" style={{ cursor: "pointer", background: "#7c3aed", color: "#fff", padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}>
            Subir primera imagen
          </label>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16 }}>
          {imagenes.map(img => (
            <div key={img.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden", position: "relative" }}>
              <img src={img.url} alt={img.nombre} style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
              <div style={{ padding: "8px 10px" }}>
                <p style={{ fontSize: 11, color: "#888", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.nombre}</p>
              </div>
              <button onClick={() => handleDelete(img.id, img.url)} style={{ position: "absolute", top: 8, right: 8, background: "#ef4444", color: "#fff", border: "none", borderRadius: "50%", width: 24, height: 24, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>x</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
