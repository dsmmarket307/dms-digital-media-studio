type DataContext = Record<string, any>;

type SiteMeta = {
  siteId: string;
  userId?: string | null;
  destinoEmail: string;
  nombreNegocio: string;
};

function getValue(path: string, context: DataContext): any {
  return path.trim().split(".").reduce((acc, key) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[key];
  }, context as any);
}

function renderEachBlocks(html: string, context: DataContext): string {
  const eachPattern = /\{\{#each\s+([\w.]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;

  return html.replace(eachPattern, (_match, path: string, innerTemplate: string) => {
    const list = getValue(path, context);
    if (!Array.isArray(list)) return "";

    return list
      .map((item) => renderVariables(innerTemplate, { ...context, ...item, this: item }))
      .join("");
  });
}

function renderVariables(html: string, context: DataContext): string {
  const varPattern = /\{\{([\w.]+)\}\}/g;

  return html.replace(varPattern, (_match, path: string) => {
    const value = getValue(path, context);
    if (value === undefined || value === null) return "";
    return String(value);
  });
}

function injectContactFormScript(html: string, meta: SiteMeta): string {
  const hasForm = html.includes('id="dms-contacto"') || html.includes("id='dms-contacto'");
  if (!hasForm) return html;

  const script = `
<script>
(function () {
  var form = document.getElementById("dms-contacto");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var nombre = form.querySelector('[name="nombre"]');
    var correo = form.querySelector('[name="correo"]');
    var telefono = form.querySelector('[name="telefono"]');
    var mensaje = form.querySelector('[name="mensaje"]');

    var payload = {
      nombre: nombre ? nombre.value : "",
      correo: correo ? correo.value : "",
      telefono: telefono ? telefono.value : "",
      mensaje: mensaje ? mensaje.value : "",
      destino_email: ${JSON.stringify(meta.destinoEmail)},
      user_id: ${JSON.stringify(meta.userId ?? null)},
      site_id: ${JSON.stringify(meta.siteId)},
      nombre_negocio: ${JSON.stringify(meta.nombreNegocio)}
    };

    var submitBtn = form.querySelector('button[type="submit"]');
    var originalText = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) { submitBtn.textContent = "Enviando..."; submitBtn.disabled = true; }

    fetch("/api/formulario-contacto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error("error");
        form.innerHTML = "<p style=\\"padding:1rem;\\">Mensaje enviado. Gracias por escribirnos.</p>";
      })
      .catch(function () {
        if (submitBtn) { submitBtn.textContent = originalText; submitBtn.disabled = false; }
        alert("No se pudo enviar el mensaje. Intenta de nuevo.");
      });
  });
})();
</script>
`;

  return html + script;
}

export function renderCustomHtml(customHtml: string, generatedContent: DataContext, siteMeta: SiteMeta): string {
  let output = customHtml;
  output = renderEachBlocks(output, generatedContent);
  output = renderVariables(output, generatedContent);
  output = injectContactFormScript(output, siteMeta);
  return output;
}
