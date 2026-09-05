const fs = require("fs");
const path = require("path");

function patchFile(filePath, replacements) {
  const backupPath = filePath + ".bak";
  const original = fs.readFileSync(filePath, "utf8");
  let updated = original;

  for (const [oldStr, newStr, label] of replacements) {
    const count = updated.split(oldStr).length - 1;
    if (count === 0) {
      throw new Error(`No se encontro el bloque esperado ("${label}") en ${filePath}. No se modifico nada.`);
    }
    if (count > 1) {
      throw new Error(`El bloque ("${label}") aparece ${count} veces en ${filePath}, se esperaba 1. No se modifico nada.`);
    }
    updated = updated.split(oldStr).join(newStr);
  }

  fs.writeFileSync(backupPath, original, "utf8");
  fs.writeFileSync(filePath, updated, "utf8");
  console.log(`OK: ${filePath} parchado. Backup en ${backupPath}`);
}

const PAGEBUILDER = path.join(__dirname, "app/dashboard/admin/page-builder/page.tsx");
const AIBUILDER = path.join(__dirname, "app/dashboard/admin/ai-builder/page.tsx");

const OLD_PLANTILLAS = [
  'const PLANTILLAS = [',
  '  { id: "restaurante", nombre: "Restaurante", color: "#ef4444", desc: "Menu, reservas y galeria de platos" },',
  '  { id: "inmobiliaria", nombre: "Inmobiliaria", color: "#3b82f6", desc: "Propiedades, contacto y avaluos" },',
  '  { id: "spa", nombre: "Spa y Bienestar", color: "#8b5cf6", desc: "Servicios, precios y reservas" },',
  '  { id: "medico", nombre: "Consultorio Medico", color: "#10b981", desc: "Servicios, equipo y citas" },',
  '  { id: "abogados", nombre: "Firma de Abogados", color: "#1e293b", desc: "Servicios legales y contacto" },',
  '  { id: "gimnasio", nombre: "Gimnasio", color: "#f59e0b", desc: "Planes, clases y equipo" },',
  '  { id: "hotel", nombre: "Hotel", color: "#6366f1", desc: "Habitaciones, servicios y reservas" },',
  '  { id: "tienda", nombre: "Tienda Online", color: "#ec4899", desc: "Productos, categorias y contacto" },',
  '  { id: "agencia", nombre: "Agencia Marketing", color: "#7c3aed", desc: "Servicios, portafolio y equipo" },',
  '];',
].join("\n");

const NEW_PLANTILLAS = [
  'const PLANTILLAS = [',
  '  { id: "restaurante", nombre: "Restaurante", color: "#ef4444", desc: "Menu, reservas y galeria de platos", website_type: "Restaurante", prompt: "Crear sitio web para un restaurante con menu destacado, opcion de reservas y galeria de platos. Tono calido y apetitoso." },',
  '  { id: "inmobiliaria", nombre: "Inmobiliaria", color: "#3b82f6", desc: "Propiedades, contacto y avaluos", website_type: "Inmobiliaria", prompt: "Crear sitio web para una inmobiliaria con propiedades destacadas, formulario de contacto y servicio de avaluos. Tono profesional y confiable." },',
  '  { id: "spa", nombre: "Spa y Bienestar", color: "#8b5cf6", desc: "Servicios, precios y reservas", website_type: "Spa", prompt: "Crear sitio web para un spa de bienestar con servicios, precios y sistema de reservas. Tono relajante y elegante." },',
  '  { id: "medico", nombre: "Consultorio Medico", color: "#10b981", desc: "Servicios, equipo y citas", website_type: "Medicos", prompt: "Crear sitio web para un consultorio medico con servicios, presentacion del equipo medico y agendamiento de citas. Tono profesional y de confianza." },',
  '  { id: "abogados", nombre: "Firma de Abogados", color: "#1e293b", desc: "Servicios legales y contacto", website_type: "Abogados", prompt: "Crear sitio web para una firma de abogados con areas de practica, servicios legales y formulario de contacto. Tono serio y profesional." },',
  '  { id: "gimnasio", nombre: "Gimnasio", color: "#f59e0b", desc: "Planes, clases y equipo", website_type: "Gimnasio", prompt: "Crear sitio web para un gimnasio con planes de membresia, horario de clases y presentacion del equipo de entrenadores. Tono energico y motivador." },',
  '  { id: "hotel", nombre: "Hotel", color: "#6366f1", desc: "Habitaciones, servicios y reservas", website_type: "Hotel", prompt: "Crear sitio web para un hotel con tipos de habitaciones, servicios del hotel y sistema de reservas. Tono acogedor y premium." },',
  '  { id: "tienda", nombre: "Tienda Online", color: "#ec4899", desc: "Productos, categorias y contacto", website_type: "Tienda Online", prompt: "Crear tienda online con productos destacados, categorias claras y formulario de contacto. Tono moderno y atractivo para compras." },',
  '  { id: "agencia", nombre: "Agencia Marketing", color: "#7c3aed", desc: "Servicios, portafolio y equipo", website_type: "Agencia", prompt: "Crear sitio web para una agencia de marketing con servicios, portafolio de trabajos y presentacion del equipo. Tono creativo y profesional." },',
  '];',
].join("\n");

const OLD_BOTON = '                  <button onClick={() => alert("Proximamente \u2014 usar plantilla " + p.nombre)} style={{ width: "100%", background: p.color, color: "#fff", border: "none", borderRadius: 8, padding: "8px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>\n                    Usar plantilla\n                  </button>';

const NEW_BOTON = '                  <button onClick={() => router.push(`/dashboard/admin/ai-builder?website_type=${encodeURIComponent(p.website_type)}&prompt=${encodeURIComponent(p.prompt)}&primary_color=${encodeURIComponent(p.color)}`)} style={{ width: "100%", background: p.color, color: "#fff", border: "none", borderRadius: 8, padding: "8px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>\n                    Usar plantilla\n                  </button>';

patchFile(PAGEBUILDER, [
  [OLD_PLANTILLAS, NEW_PLANTILLAS, "array PLANTILLAS"],
  [OLD_BOTON, NEW_BOTON, "boton Usar plantilla"],
]);

const OLD_CHECK_EFFECT = [
  '  useEffect(() => {',
  '    async function check() {',
  '      const { data: { user } } = await supabase.auth.getUser();',
  '      if (!user) { router.push("/auth/login"); return; }',
  '      const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();',
  '      if (prof?.role !== "admin") { router.push("/dashboard/client"); return; }',
  '      const { data: cl } = await supabase.from("profiles").select("id, name, email").eq("role", "client").order("name");',
  '      setClientes(cl ?? []);',
  '      loadWebsites();',
  '      setLoading(false);',
  '    }',
  '    check();',
  '  }, []);',
].join("\n");

const NEW_CHECK_EFFECT = [
  '  useEffect(() => {',
  '    async function check() {',
  '      const { data: { user } } = await supabase.auth.getUser();',
  '      if (!user) { router.push("/auth/login"); return; }',
  '      const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();',
  '      if (prof?.role !== "admin") { router.push("/dashboard/client"); return; }',
  '      const { data: cl } = await supabase.from("profiles").select("id, name, email").eq("role", "client").order("name");',
  '      setClientes(cl ?? []);',
  '      loadWebsites();',
  '      setLoading(false);',
  '    }',
  '    check();',
  '',
  '    const params = new URLSearchParams(window.location.search);',
  '    const qWebsiteType = params.get("website_type");',
  '    const qPrompt = params.get("prompt");',
  '    const qColor = params.get("primary_color");',
  '    if (qWebsiteType || qPrompt || qColor) {',
  '      setForm(f => ({',
  '        ...f,',
  '        website_type: qWebsiteType ?? f.website_type,',
  '        prompt: qPrompt ?? f.prompt,',
  '        primary_color: qColor ?? f.primary_color,',
  '      }));',
  '    }',
  '  }, []);',
].join("\n");

patchFile(AIBUILDER, [
  [OLD_CHECK_EFFECT, NEW_CHECK_EFFECT, "useEffect de verificacion admin"],
]);

console.log("Listo: ambos archivos parchados correctamente.");
