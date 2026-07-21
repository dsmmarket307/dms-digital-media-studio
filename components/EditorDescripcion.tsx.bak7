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
  const [antesAfterPaso, setAntesAfterPaso] = useState(0);
  const [antesAfterTemp, setAntesAfterTemp] = useState("");
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

  function insertTabla() {
    const tablaHtml = '<table style="width:100%;border-collapse:collapse;margin:10px 0;font-size:13px;table-layout:fixed;"><tr><th style="border:1px solid #ccc;padding:6px;background:#f3f4f6;text-align:left;font-size:13px;font-weight:700;">Caracteristica</th><th style="border:1px solid #ccc;padding:6px;background:#f3f4f6;text-align:left;font-size:13px;font-weight:700;">Este producto</th><th style="border:1px solid #ccc;padding:6px;background:#f3f4f6;text-align:left;font-size:13px;font-weight:700;">Otros</th></tr><tr><td style="border:1px solid #ccc;padding:6px;font-size:13px;font-weight:400;">Caracteristica 1</td><td style="border:1px solid #ccc;padding:6px;font-size:13px;font-weight:400;">Si</td><td style="border:1px solid #ccc;padding:6px;font-size:13px;font-weight:400;">No</td></tr><tr><td style="border:1px solid #ccc;padding:6px;font-size:13px;font-weight:400;">Caracteristica 2</td><td style="border:1px solid #ccc;padding:6px;font-size:13px;font-weight:400;">Si</td><td style="border:1px solid #ccc;padding:6px;font-size:13px;font-weight:400;">No</td></tr><tr><td style="border:1px solid #ccc;padding:6px;font-size:13px;font-weight:400;">Caracteristica 3</td><td style="border:1px solid #ccc;padding:6px;font-size:13px;font-weight:400;">Si</td><td style="border:1px solid #ccc;padding:6px;font-size:13px;font-weight:400;">No</td></tr><tr><td style="border:1px solid #ccc;padding:6px;font-size:13px;font-weight:400;">Caracteristica 4</td><td style="border:1px solid #ccc;padding:6px;font-size:13px;font-weight:400;">Si</td><td style="border:1px solid #ccc;padding:6px;font-size:13px;font-weight:400;">No</td></tr><tr><td style="border:1px solid #ccc;padding:6px;font-size:13px;font-weight:400;">Caracteristica 5</td><td style="border:1px solid #ccc;padding:6px;font-size:13px;font-weight:400;">Si</td><td style="border:1px solid #ccc;padding:6px;font-size:13px;font-weight:400;">No</td></tr><tr><td style="border:1px solid #ccc;padding:6px;font-size:13px;font-weight:400;">Caracteristica 6</td><td style="border:1px solid #ccc;padding:6px;font-size:13px;font-weight:400;">Si</td><td style="border:1px solid #ccc;padding:6px;font-size:13px;font-weight:400;">No</td></tr></table><br/>';
    document.execCommand("insertHTML", false, tablaHtml);
    handleInput();
  }

    function agregarFila() {
    const editor = editorRef.current;
    if (!editor) return;
    const tablas = editor.querySelectorAll("table");
    const tabla = tablas[tablas.length - 1];
    if (!tabla) return;
    const filas = tabla.querySelectorAll("tr");
    const ultimaFila = filas[filas.length - 1];
    if (!ultimaFila) return;
    const nuevaFila = ultimaFila.cloneNode(true) as HTMLTableRowElement;
    nuevaFila.querySelectorAll("td, th").forEach(celda => { celda.textContent = ""; });
    ultimaFila.after(nuevaFila);
    handleInput();
  }

  function eliminarTabla() {
    const editor = editorRef.current;
    if (!editor) return;
    const tablas = editor.querySelectorAll("table");
    if (tablas.length === 0) return;
    const sel = window.getSelection();
    let tablaAEliminar: Element | null = null;
    if (sel && sel.anchorNode) {
      let node: Node | null = sel.anchorNode;
      while (node && node !== editor) {
        if (node.nodeName === "TABLE") { tablaAEliminar = node as Element; break; }
        if (node.nodeType === 1 && (node as Element).closest) {
          const cerca = (node as Element).closest("table");
          if (cerca) { tablaAEliminar = cerca; break; }
        }
        node = node.parentNode;
      }
    }
    if (!tablaAEliminar) tablaAEliminar = tablas[tablas.length - 1];
    tablaAEliminar.remove();
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

    if (antesAfterPaso === 1) {
      setAntesAfterTemp(data.publicUrl);
      setAntesAfterPaso(2);
      setUploading(false);
      setTimeout(() => fileRef.current?.click(), 200);
      return;
    }
    if (antesAfterPaso === 2) {
      const uid = "ba" + Date.now();
      const dragScript = "var r=this.getBoundingClientRect();var p=Math.max(0,Math.min(100,((event.clientX-r.left)/r.width)*100));document.getElementById(&quot;" + uid + "img&quot;).style.clipPath=&quot;inset(0 &quot;+(100-p)+&quot;% 0 0)&quot;;document.getElementById(&quot;" + uid + "line&quot;).style.left=p+&quot;%&quot;;document.getElementById(&quot;" + uid + "btn&quot;).style.left=p+&quot;%&quot;;";
      const html = '<div id="' + uid + 'box" style="position:relative;width:100%;max-width:500px;aspect-ratio:4/3;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.18);margin:12px 0;cursor:ew-resize;user-select:none;touch-action:none;" onpointerdown="this.setPointerCapture(event.pointerId);this.dataset.d=1;' + dragScript + '" onpointermove="if(this.dataset.d==1){' + dragScript + '}" onpointerup="this.dataset.d=0" onpointerleave="this.dataset.d=0">' +
        '<img src="' + data.publicUrl + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none;" />' +
        '<span style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.6);color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:999px;">DESPUES</span>' +
        '<img id="' + uid + 'img" src="' + antesAfterTemp + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;clip-path:inset(0 50% 0 0);pointer-events:none;" />' +
        '<span style="position:absolute;top:10px;left:10px;background:rgba(0,0,0,0.6);color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:999px;">ANTES</span>' +
        '<div id="' + uid + 'line" style="position:absolute;top:0;bottom:0;left:50%;width:3px;background:#fff;transform:translateX(-50%);box-shadow:0 0 8px rgba(0,0,0,0.4);pointer-events:none;"></div>' +
        '<div id="' + uid + 'btn" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,0.3);pointer-events:none;font-size:16px;color:#7c3aed;">↔</div>' +
        '</div><br/>';
      document.execCommand("insertHTML", false, html);
      handleInput();
      setAntesAfterPaso(0);
      setAntesAfterTemp("");
      setUploading(false);
      return;
    }

    document.execCommand("insertImage", false, data.publicUrl);
    handleInput();
    setUploading(false);
  }

  function iniciarAntesDespues() {
    setAntesAfterPaso(1);
    fileRef.current?.click();
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
          <button style={btnStyle} onClick={insertTabla}>Tabla</button>
          <button style={{ ...btnStyle, color: antesAfterPaso > 0 ? "#7c3aed" : undefined }} onClick={iniciarAntesDespues}>
            {antesAfterPaso === 1 ? "Sube foto ANTES..." : antesAfterPaso === 2 ? "Sube foto DESPUES..." : "Antes/Despues"}
          </button>
          <button style={btnStyle} onClick={agregarFila}>+ Fila</button>
          <button style={btnDanger} onClick={eliminarTabla}>Eliminar tabla</button>
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