"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface EditorDescripcionProps {
  value: string;
  onChange: (v: string) => void;
  productoIndex: number;
}

export default function EditorDescripcion({ value, onChange, productoIndex }: EditorDescripcionProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value ?? "";
    }
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG") {
        editor.querySelectorAll("img").forEach(img => img.style.outline = "");
        const img = target as HTMLImageElement;
        img.style.outline = "2px solid #7c3aed";
        setSelectedImg(img);
      } else {
        editor.querySelectorAll("img").forEach(img => img.style.outline = "");
        setSelectedImg(null);
      }
    };
    editor.addEventListener("click", handleClick);
    return () => editor.removeEventListener("click", handleClick);
  }, []);

  function handleInput() {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }

  function execCmd(cmd: string, val?: string) {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    handleInput();
  }

  function deleteSelectedImg() {
    if (selectedImg) {
      selectedImg.remove();
      setSelectedImg(null);
      handleInput();
    }
  }

  function resizeSelectedImg(size: string) {
    if (selectedImg) {
      const sizes: Record<string, string> = { small: "150px", medium: "300px", large: "100%" };
      selectedImg.style.width = sizes[size];
      selectedImg.style.maxWidth = "100%";
      handleInput();
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `desc-${productoIndex}-${Date.now()}.${ext}`;
    await supabase.storage.from("logos").upload(fileName, file, { upsert: true });
    const { data } = supabase.storage.from("logos").getPublicUrl(fileName);
    document.execCommand("insertImage", false, data.publicUrl);
    handleInput();
    setUploading(false);
  }

  const btnStyle: React.CSSProperties = { padding: "4px 8px", borderRadius: 4, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 };
  const btnDanger: React.CSSProperties = { ...btnStyle, background: "#fef2f2", color: "#ef4444", border: "1px solid #fca5a5" };
  const btnActive: React.CSSProperties = { ...btnStyle, background: "#7c3aed", color: "#fff", border: "1px solid #7c3aed" };

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, marginBottom: 6 }}>Descripcion</label>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 4, padding: "6px 8px", background: "#f8f9fa", borderBottom: "1px solid #e5e7eb", flexWrap: "wrap" }}>
          <select onChange={e => execCmd("fontSize", e.target.value)} style={{ ...btnStyle, padding: "4px 4px" }} defaultValue="">
            <option value="" disabled>Tamano</option>
            <option value="1">Pequeno</option>
            <option value="3">Normal</option>
            <option value="5">Grande</option>
            <option value="7">Muy grande</option>
          </select>
          <button style={btnStyle} onClick={() => execCmd("bold")}><b>B</b></button>
          <button style={btnStyle} onClick={() => execCmd("italic")}><i>I</i></button>
          <button style={btnStyle} onClick={() => execCmd("underline")}><u>U</u></button>
          <button style={btnStyle} onClick={() => execCmd("justifyLeft")}>Izq</button>
          <button style={btnStyle} onClick={() => execCmd("justifyCenter")}>Centro</button>
          <button style={btnStyle} onClick={() => execCmd("justifyRight")}>Der</button>
          <button style={btnStyle} onClick={() => execCmd("insertUnorderedList")}>Lista</button>
          <button style={{ ...btnStyle, color: uploading ? "#aaa" : "#7c3aed" }} onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? "Subiendo..." : "Imagen"}
          </button>
          <button style={btnStyle} onClick={() => execCmd("removeFormat")}>Limpiar</button>
        </div>

        {selectedImg && (
          <div style={{ display: "flex", gap: 4, padding: "6px 8px", background: "#f0f0ff", borderBottom: "1px solid #e5e7eb", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", marginRight: 4 }}>Imagen seleccionada:</span>
            <button style={btnStyle} onClick={() => resizeSelectedImg("small")}>Pequena</button>
            <button style={btnStyle} onClick={() => resizeSelectedImg("medium")}>Mediana</button>
            <button style={btnStyle} onClick={() => resizeSelectedImg("large")}>Grande</button>
            <button style={btnDanger} onClick={deleteSelectedImg}>Eliminar</button>
          </div>
        )}

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          style={{ minHeight: 120, padding: "10px", fontSize: 13, outline: "none", lineHeight: 1.6 }}
        />
      </div>
      <style>{`[contenteditable] img { max-width: 100%; border-radius: 8px; margin: 8px 0; cursor: pointer; }`}</style>
    </div>
  );
}