"use client";
import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

type Area = { x: number; y: number; width: number; height: number };

async function getCroppedBlob(imageSrc: string, cropPixels: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });
  const canvas = document.createElement("canvas");
  canvas.width = cropPixels.width;
  canvas.height = cropPixels.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen");
  ctx.drawImage(
    image,
    cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height,
    0, 0, cropPixels.width, cropPixels.height
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob); else reject(new Error("No se pudo generar la imagen recortada"));
    }, "image/jpeg", 0.92);
  });
}

export default function ImageCropperModal({
  imageSrc,
  aspect,
  onCancel,
  onConfirm,
}: {
  imageSrc: string;
  aspect: number;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixelsResult: Area) => {
    setCroppedAreaPixels(croppedAreaPixelsResult);
  }, []);

  async function confirmar() {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
      onConfirm(blob);
    } catch (e) {
      alert("Error al recortar la imagen. Intenta de nuevo.");
      setProcessing(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.3)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0" }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: "#111", margin: 0 }}>Ajusta el encuadre</h2>
          <p style={{ fontSize: 12, color: "#888", margin: "4px 0 0" }}>Arrastra para mover, usa la barra para hacer zoom.</p>
        </div>

        <div style={{ position: "relative", width: "100%", height: 320, background: "#222" }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div style={{ padding: "14px 20px" }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, display: "block", marginBottom: 6 }}>Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ padding: "14px 20px", borderTop: "1px solid #f0f0f0", display: "flex", gap: 8 }}>
          <button onClick={onCancel} disabled={processing} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
          <button onClick={confirmar} disabled={processing} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: processing ? 0.6 : 1 }}>{processing ? "Procesando..." : "Usar esta imagen"}</button>
        </div>
      </div>
    </div>
  );
}
