import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const SITE_ID = "e3d015d2-02d6-4356-81b6-501675297e60";
const BUCKET = "cotizaciones-cm";
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
const MAX_FOTO_BYTES = 2 * 1024 * 1024;
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function txt(v: FormDataEntryValue | null, max: number) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}
function fail(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();
    if (txt(fd.get("sitio_web"), 100)) return NextResponse.json({ ok: true });
    if (txt(fd.get("site_id"), 60) !== SITE_ID) return fail("Solicitud no valida.", 403);

    const tipo = txt(fd.get("tipo_inmueble"), 40);
    const tipoOtro = txt(fd.get("tipo_otro"), 80);
    const areaTxt = txt(fd.get("area_m2"), 12).replace(",", ".");
    const servicio = txt(fd.get("servicio"), 60);
    const humedad = txt(fd.get("humedad"), 3);
    const ciudad = txt(fd.get("ciudad"), 40);
    const ciudadOtra = txt(fd.get("ciudad_otra"), 80);
    const direccion = txt(fd.get("direccion"), 200);
    const visita = txt(fd.get("visita"), 3);
    const nombre = txt(fd.get("nombre"), 100);
    const celular = txt(fd.get("celular"), 25);
    const correo = txt(fd.get("correo"), 120);
    const mensaje = txt(fd.get("mensaje"), 2000);

    if (!TIPOS.includes(tipo)) return fail("Selecciona el tipo de inmueble.");
    if (tipo === "Otro" && !tipoOtro) return fail("Indica el tipo de inmueble.");
    if (!SERVICIOS.includes(servicio)) return fail("Selecciona el servicio que necesitas.");
    if (humedad !== "si" && humedad !== "no") return fail("Indica si hay problemas de humedad.");
    if (!CIUDADES.includes(ciudad)) return fail("Selecciona la ciudad.");
    if (ciudad === "Otra" && !ciudadOtra) return fail("Indica la ciudad.");
    if (direccion.length < 5) return fail("Escribe la direccion del inmueble.");
    if (visita !== "si" && visita !== "no") return fail("Indica si deseas una visita de diagnostico.");
    if (nombre.length < 3) return fail("Escribe tu nombre y apellido.");
    const digitos = celular.replace(/\D/g, "");
    if (digitos.length < 7 || digitos.length > 15) return fail("Escribe un numero de celular valido.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return fail("Escribe un correo valido.");

    let area: number | null = null;
    if (areaTxt) {
      const n = Number(areaTxt);
      if (!isFinite(n) || n <= 0 || n > 100000) return fail("El area debe ser un numero valido.");
      area = n;
    }

    const fotos = fd.getAll("fotos").filter((x): x is File => typeof x !== "string" && x.size > 0);
    if (fotos.length > MAX_FOTOS) return fail("Puedes adjuntar hasta " + MAX_FOTOS + " fotografias.");
    for (const f of fotos) {
      if (!EXT[f.type]) return fail("Las fotografias deben ser JPG, PNG o WEBP.");
      if (f.size > MAX_FOTO_BYTES) return fail("Cada fotografia debe pesar menos de 2 MB.");
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { data: site } = await supabase
      .from("generated_websites")
      .select("project_name, generated_content")
      .eq("id", SITE_ID)
      .single();
    if (!site) return fail("Sitio no encontrado.", 404);
    const gc: any = site.generated_content;
    const destino: string = gc?.contacto?.email || "";
    const negocio: string = gc?.footer?.nombre_empresa || site.project_name || "CM Pinturas y Mantenimiento";

    const urls: string[] = [];
    const subidos: string[] = [];
    for (const f of fotos) {
      const path = randomUUID() + "." + EXT[f.type];
      const buf = Buffer.from(await f.arrayBuffer());
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buf, { contentType: f.type, upsert: false });
      if (upErr) {
        if (subidos.length) await supabase.storage.from(BUCKET).remove(subidos);
        console.error("cotizacion-cm upload:", upErr);
        return fail("No se pudieron subir las fotografias. Intenta de nuevo.", 500);
      }
      subidos.push(path);
      urls.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
    }

    const { error: insErr } = await supabase.from("cotizaciones_cm").insert({
      site_id: SITE_ID,
      tipo_inmueble: tipo,
      tipo_otro: tipo === "Otro" ? tipoOtro : null,
      area_m2: area,
      servicio,
      humedad: humedad === "si",
      ciudad,
      ciudad_otra: ciudad === "Otra" ? ciudadOtra : null,
      direccion,
      visita_diagnostico: visita === "si",
      nombre,
      celular,
      correo,
      mensaje: mensaje || null,
      fotos: urls,
    });
    if (insErr) {
      if (subidos.length) await supabase.storage.from(BUCKET).remove(subidos);
      console.error("cotizacion-cm insert:", insErr);
      return fail("No se pudo guardar la solicitud. Intenta de nuevo.", 500);
    }

    if (destino && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fila = (k: string, v: string) => "<p><strong>" + k + ":</strong> " + (esc(v) || "---") + "</p>";
        const fotosHtml = urls.length
          ? "<p><strong>Fotografias:</strong> " + urls.map((u, i) => '<a href="' + u + '">Foto ' + (i + 1) + "</a>").join(" | ") + "</p>"
          : "";
        await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: destino,
          replyTo: correo,
          subject: "Nueva solicitud de cotizacion - " + negocio,
          html:
            "<h2>Nueva solicitud de cotizacion</h2>" +
            fila("Nombre", nombre) +
            fila("Celular / WhatsApp", celular) +
            fila("Correo", correo) +
            fila("Tipo de inmueble", tipo === "Otro" ? "Otro: " + tipoOtro : tipo) +
            fila("Area aproximada (m2)", area === null ? "" : String(area)) +
            fila("Servicio", servicio) +
            fila("Problemas de humedad", humedad === "si" ? "Si" : "No") +
            fila("Ciudad", ciudad === "Otra" ? "Otra: " + ciudadOtra : ciudad) +
            fila("Direccion", direccion) +
            fila("Visita de diagnostico", visita === "si" ? "Si, desea visita" : "No, prefiere cotizacion inicial") +
            fila("Detalle del trabajo", mensaje) +
            fotosHtml,
        });
      } catch (mailErr) {
        console.error("cotizacion-cm email:", mailErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("cotizacion-cm:", e);
    return fail("Error procesando la solicitud.", 500);
  }
}