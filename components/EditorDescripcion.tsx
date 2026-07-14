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
  const fileRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value ?? "";
    }
  }, []);

  function handleInput() {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }

  function execCmd(cmd: string, val?: string) {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    handleInput();
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

  const btnStyle = { padding: "4px 8px", borderRadius: 4, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700 };

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, marginBottom: 6 }}>Descripcion</label>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 4, padding: "6px 8px", background: "#f8f9fa", borderBottom: "1px solid #e5e7eb", flexWrap: "wrap" }}>
          <button style={btnStyle} onClick={() => execCmd("bold")}><b>B</b></button>
          <button style={btnStyle} onClick={() => execCmd("italic")}><i>I</i></button>
          <button style={btnStyle} onClick={() => execCmd("underline")}><u>U</u></button>
          <button style={btnStyle} onClick={() => execCmd("insertUnorderedList")}>• Lista</button>
          <button style={btnStyle} onClick={() => execCmd("insertOrderedList")}>1. Lista</button>
          <button style={{ ...btnStyle, color: uploading ? "#aaa" : "#7c3aed" }} onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? "Subiendo..." : "Imagen"}
          </button>
          <button style={btnStyle} onClick={() => execCmd("removeFormat")}>Limpiar</button>
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          style={{ minHeight: 120, padding: "10px", fontSize: 13, outline: "none", lineHeight: 1.6 }}
        />
      </div>
      <style>{`[contenteditable] img { max-width: 100%; border-radius: 8px; margin: 8px 0; }`}</style>
    </div>
  );
}