"use client";
import { useState } from "react";

const TIPOS = ["Casa", "Apartamento", "Local comercial", "Oficina", "Otro"];
const SERVICIOS = [
  "Pintura exterior",
  "Pintura interior",
  "Pintura de fachada",
  "Mantenimiento de techos",
  "Mantenimiento de pisos",
  "Tratamiento de humedad",
  "Pintura y mantenimiento general",
];
const CIUDADES = ["Pereira", "Dosquebradas", "Cerritos", "Otra"];
const MAX_FOTOS = 4;
const MAX_BYTES = 1000000;

const VACIO = {
  tipo_inmueble: "", tipo_otro: "", area_m2: "", servicio: "", humedad: "",
  ciudad: "", ciudad_otra: "", direccion: "", visita: "",
  nombre: "", celular: "", correo: "", mensaje: "", sitio_web: "",
};
type Campos = typeof VACIO;
type Foto = { id: string; nombre: string; blob: Blob; preview: string };

async function comprimir(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img: HTMLImageElement = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("img"));
      i.src = url;
    });
    const factor = Math.min(1, 1600 / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * factor));
    const h = Math.max(1, Math.round(img.height * factor));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("ctx");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    let blob: Blob | null = null;
    for (const q of [0.75, 0.6, 0.45]) {
      blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", q));
      if (blob && blob.size <= MAX_BYTES) break;
    }
    if (!blob) throw new Error("blob");
    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function Lbl({ id, t, req }: { id: string; t: string; req?: boolean }) {
  return (
    <label className="cq-l" htmlFor={id}>
      {t}
      {req && <span className="cq-req" aria-hidden="true"> *</span>}
    </label>
  );
}

export default function CotizacionForm({ siteId, primaryColor }: { siteId: string; primaryColor: string }) {
  const pr = primaryColor || "#7c3aed";
  const [f, setF] = useState<Campos>(VACIO);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [errorFoto, setErrorFoto] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [visitaValor, setVisitaValor] = useState<number | null>(null);

  const set = (k: keyof Campos, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function agregarFotos(ev: React.ChangeEvent<HTMLInputElement>) {
    const archivos = Array.from(ev.target.files ?? []);
    ev.target.value = "";
    setErrorFoto("");
    if (!archivos.length) return;
    const espacio = Math.max(MAX_FOTOS - fotos.length, 0);
    if (archivos.length > espacio) setErrorFoto("Puedes adjuntar hasta " + MAX_FOTOS + " fotografias.");
    const nuevas: Foto[] = [];
    for (const a of archivos.slice(0, espacio)) {
      try {
        const blob = await comprimir(a);
        if (blob.size > MAX_BYTES) {
          setErrorFoto("La fotografia \"" + a.name + "\" es demasiado pesada.");
          continue;
        }
        nuevas.push({ id: Date.now() + "-" + Math.random(), nombre: a.name, blob, preview: URL.createObjectURL(blob) });
      } catch {
        setErrorFoto("No se pudo leer \"" + a.name + "\". Usa una imagen JPG o PNG.");
      }
    }
    setFotos((p) => [...p, ...nuevas]);
  }

  function quitarFoto(id: string) {
    setFotos((p) => {
      const x = p.find((y) => y.id === id);
      if (x) URL.revokeObjectURL(x.preview);
      return p.filter((y) => y.id !== id);
    });
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;
    setError("");
    setEnviando(true);
    try {
      const fd = new FormData();
      fd.append("site_id", siteId);
      Object.entries(f).forEach(([k, v]) => fd.append(k, v));
      fotos.forEach((ft, i) => fd.append("fotos", ft.blob, "foto-" + (i + 1) + ".jpg"));
      const res = await fetch("/api/cotizacion-cm", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "No se pudo enviar la solicitud.");
      fotos.forEach((ft) => URL.revokeObjectURL(ft.preview));
      setFotos([]);
      setF(VACIO);
      setVisitaValor(typeof data?.visita?.valor === "number" ? data.visita.valor : null);
      setEnviado(true);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err?.message || "No se pudo enviar la solicitud. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  const estilos = (
    <style>{`
      .cq{background:#fff;border-radius:24px;padding:2.5rem;max-width:860px;margin:0 auto;box-shadow:0 2px 20px rgba(0,0,0,.08);border:1px solid #f0f0f0;position:relative}
      .cq-intro{color:#111;font-size:clamp(1.15rem,2.6vw,1.5rem);font-weight:700;line-height:1.4;text-align:center;margin-bottom:.75rem}
      .cq-note{font-size:.75rem;color:#6b7280;text-align:center;margin-bottom:1.5rem}
      .cq-sec{padding-top:1.5rem;margin-top:1.5rem;border-top:1px solid #f0f0f0}
      .cq-sec h3{font-size:1.05rem;font-weight:800;color:#111;margin-bottom:1.25rem;display:flex;align-items:center;gap:.6rem}
      .cq-num{width:28px;height:28px;border-radius:50%;background:${pr};color:#fff;font-size:.8rem;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
      .cq-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem}
      .cq-full{grid-column:1/-1}
      .cq-l{display:block;font-size:.8rem;font-weight:600;color:#374151;margin-bottom:.5rem}
      .cq-req{color:#dc2626}
      .cq-in{width:100%;border:1.5px solid #e5e7eb;border-radius:12px;padding:.875rem 1rem;font-size:.9rem;outline:none;font-family:inherit;background:#fff;color:#111;transition:border-color .2s}
      .cq-in:focus{border-color:${pr}}
      textarea.cq-in{resize:vertical;min-height:110px}
      .cq-radios{display:flex;flex-direction:column;gap:.6rem}
      .cq-inline{flex-direction:row}
      .cq-inline .cq-opt{flex:1}
      .cq-opt{display:flex;align-items:center;gap:.6rem;border:1.5px solid #e5e7eb;border-radius:12px;padding:.75rem 1rem;cursor:pointer;font-size:.9rem;color:#111;line-height:1.4}
      .cq-opt:has(input:checked){border-color:${pr};background:${pr}12}
      .cq-opt input{accent-color:${pr};width:18px;height:18px;flex-shrink:0}
      .cq-file{font-size:.85rem;color:#374151;max-width:100%}
      .cq-hint{font-size:.75rem;color:#6b7280;margin-top:.4rem}
      .cq-thumbs{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:.75rem}
      .cq-th{position:relative;width:88px;height:88px;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb}
      .cq-th img{width:100%;height:100%;object-fit:cover;display:block}
      .cq-th button{position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;border:none;background:rgba(0,0,0,.65);color:#fff;cursor:pointer;font-size:13px;line-height:1}
      .cq-err{color:#dc2626;font-size:.85rem;margin:.5rem 0}
      .cq-btn{width:100%;background:${pr};color:#fff;padding:1rem;border-radius:12px;border:none;font-size:1rem;font-weight:800;letter-spacing:.5px;cursor:pointer;transition:opacity .2s;margin-top:1.5rem}
      .cq-btn:hover{opacity:.9}
      .cq-btn:disabled{opacity:.6;cursor:not-allowed}
      .cq-legal{font-size:.75rem;color:#6b7280;line-height:1.5;text-align:center;margin-top:1rem}
      .cq-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
      .cq-ok{text-align:center;padding:1rem 0}
      .cq-ok h3{font-weight:800;font-size:1.4rem;color:#111;margin-bottom:.75rem}
      .cq-ok p{color:#555;font-size:.95rem;line-height:1.6}
      @media(max-width:640px){.cq{padding:1.5rem 1.1rem;border-radius:18px}.cq-grid{grid-template-columns:1fr}.cq-inline{flex-direction:column}}
    `}</style>
  );

  if (enviado) {
    return (
      <div className="cq">
        {estilos}
        <div className="cq-ok" role="status">
          <h3>Solicitud enviada</h3>
          {visitaValor !== null && (
            <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1rem", margin: "0 0 1rem", textAlign: "left" }}>
              <p><strong>Visita tecnica y diagnostico: {"$" + visitaValor.toLocaleString("es-CO")} COP</strong></p>
              <p>Para agendar la visita debes pagar este valor por adelantado. Si luego contratas el servicio, se descuenta de la cotizacion.</p>
              <p>Nequi: <strong>3155654948</strong></p>
              <p>Cuenta de ahorros Davivienda: <strong>48438515568</strong></p>
              <p>A nombre de CM Pinturas y Mantenimiento.</p>
              <p>Envia el comprobante por WhatsApp al <strong>3155654948</strong> y te confirmaremos el agendamiento.</p>
            </div>
          )}
          <p>Gracias, recibimos tu solicitud. Te contactaremos pronto para brindarte una cotización personalizada.</p>
        </div>
      </div>
    );
  }

  return (
    <form className="cq" onSubmit={enviar}>
      {estilos}
      <p className="cq-intro">Cuéntanos sobre tu trabajo y te contactaremos para brindarte una cotización personalizada.</p>
      <p className="cq-note"><span className="cq-req">*</span> Campos obligatorios</p>

      <input type="text" name="sitio_web" className="cq-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.sitio_web} onChange={(e) => set("sitio_web", e.target.value)} />

      <div className="cq-sec" style={{ borderTop: "none", paddingTop: 0, marginTop: 0 }}>
        <h3><span className="cq-num">1</span>Información del inmueble</h3>
        <div className="cq-grid">
          <div>
            <Lbl id="cq-tipo" t="Tipo de inmueble" req />
            <select id="cq-tipo" className="cq-in" required value={f.tipo_inmueble} onChange={(e) => set("tipo_inmueble", e.target.value)}>
              <option value="">Selecciona una opción</option>
              {TIPOS.map((t) => (<option key={t} value={t}>{t}</option>))}
            </select>
          </div>
          <div>
            <Lbl id="cq-area" t="Área aproximada del inmueble (m²)" />
            <input id="cq-area" className="cq-in" type="text" inputMode="decimal" placeholder="Ej: 60" value={f.area_m2} onChange={(e) => set("area_m2", e.target.value.replace(/[^0-9.,]/g, ""))} />
          </div>
          {f.tipo_inmueble === "Otro" && (
            <div className="cq-full">
              <Lbl id="cq-tipootro" t="¿Qué tipo de inmueble es?" req />
              <input id="cq-tipootro" className="cq-in" type="text" required maxLength={80} value={f.tipo_otro} onChange={(e) => set("tipo_otro", e.target.value)} />
            </div>
          )}
          <div className="cq-full">
            <Lbl id="cq-servicio" t="¿Qué servicio necesitas?" req />
            <select id="cq-servicio" className="cq-in" required value={f.servicio} onChange={(e) => set("servicio", e.target.value)}>
              <option value="">Selecciona una opción</option>
              {SERVICIOS.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
          <div className="cq-full">
            <span className="cq-l">¿El inmueble presenta problemas de humedad?<span className="cq-req"> *</span></span>
            <div className="cq-radios cq-inline">
              <label className="cq-opt"><input type="radio" name="humedad" value="si" required checked={f.humedad === "si"} onChange={() => set("humedad", "si")} />Sí</label>
              <label className="cq-opt"><input type="radio" name="humedad" value="no" required checked={f.humedad === "no"} onChange={() => set("humedad", "no")} />No</label>
            </div>
          </div>
        </div>
      </div>

      <div className="cq-sec">
        <h3><span className="cq-num">2</span>Ubicación del trabajo</h3>
        <div className="cq-grid">
          <div>
            <Lbl id="cq-ciudad" t="Ciudad" req />
            <select id="cq-ciudad" className="cq-in" required value={f.ciudad} onChange={(e) => set("ciudad", e.target.value)}>
              <option value="">Selecciona una opción</option>
              {CIUDADES.map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>
          {f.ciudad === "Otra" && (
            <div>
              <Lbl id="cq-ciudadotra" t="¿Cuál ciudad?" req />
              <input id="cq-ciudadotra" className="cq-in" type="text" required maxLength={80} value={f.ciudad_otra} onChange={(e) => set("ciudad_otra", e.target.value)} />
            </div>
          )}
          <div className="cq-full">
            <Lbl id="cq-dir" t="Dirección del inmueble" req />
            <input id="cq-dir" className="cq-in" type="text" required minLength={5} maxLength={200} value={f.direccion} onChange={(e) => set("direccion", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="cq-sec">
        <h3><span className="cq-num">3</span>Visita para diagnóstico</h3>
        <span className="cq-l">¿Deseas una visita presencial para evaluar el inmueble?<span className="cq-req"> *</span></span>
        <div className="cq-radios">
          <label className="cq-opt"><input type="radio" name="visita" value="si" required checked={f.visita === "si"} onChange={() => set("visita", "si")} />Sí, deseo una visita para diagnóstico.</label>
          <label className="cq-opt"><input type="radio" name="visita" value="no" required checked={f.visita === "no"} onChange={() => set("visita", "no")} />No, prefiero recibir una cotización inicialmente.</label>
        </div>
      </div>

      <div className="cq-sec">
        <h3><span className="cq-num">4</span>Datos del solicitante</h3>
        <div className="cq-grid">
          <div>
            <Lbl id="cq-nombre" t="Nombre y apellido" req />
            <input id="cq-nombre" className="cq-in" type="text" required minLength={3} maxLength={100} autoComplete="name" value={f.nombre} onChange={(e) => set("nombre", e.target.value)} />
          </div>
          <div>
            <Lbl id="cq-cel" t="Número de celular / WhatsApp" req />
            <input id="cq-cel" className="cq-in" type="tel" required inputMode="tel" maxLength={25} autoComplete="tel" value={f.celular} onChange={(e) => set("celular", e.target.value)} />
          </div>
          <div className="cq-full">
            <Lbl id="cq-correo" t="Correo electrónico" req />
            <input id="cq-correo" className="cq-in" type="email" required maxLength={120} autoComplete="email" value={f.correo} onChange={(e) => set("correo", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="cq-sec">
        <h3><span className="cq-num">5</span>Información adicional</h3>
        <div className="cq-grid">
          <div className="cq-full">
            <Lbl id="cq-msg" t="Cuéntanos brevemente sobre tu trabajo" />
            <textarea id="cq-msg" className="cq-in" maxLength={2000} value={f.mensaje} onChange={(e) => set("mensaje", e.target.value)} />
          </div>
          <div className="cq-full">
            <Lbl id="cq-fotos" t="Adjuntar fotografías del inmueble (opcional)" />
            <input id="cq-fotos" className="cq-file" type="file" accept="image/*" multiple disabled={fotos.length >= MAX_FOTOS} onChange={agregarFotos} />
            <p className="cq-hint">Hasta {MAX_FOTOS} fotografías. Se ajustan automáticamente de tamaño.</p>
            {errorFoto && <p className="cq-err">{errorFoto}</p>}
            {fotos.length > 0 && (
              <div className="cq-thumbs">
                {fotos.map((ft) => (
                  <div key={ft.id} className="cq-th">
                    <img src={ft.preview} alt={ft.nombre} />
                    <button type="button" aria-label={"Quitar " + ft.nombre} onClick={() => quitarFoto(ft.id)}>x</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <p className="cq-err" role="alert">{error}</p>}
      <button type="submit" className="cq-btn" disabled={enviando}>{enviando ? "ENVIANDO..." : "SOLICITAR COTIZACIÓN"}</button>
      <p className="cq-legal">Al enviar este formulario, podremos contactarte para conocer los detalles de tu trabajo y preparar una cotización personalizada.</p>
    </form>
  );
}