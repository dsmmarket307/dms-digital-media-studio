# Marcadores para HTML personalizado (custom_html)

Este documento describe los marcadores disponibles para construir un sitio
con HTML propio, conectado a los datos reales del sitio (generated_content)
y al formulario de contacto existente.

## Como se activa

En la tabla `generated_websites`, el sitio debe tener:
- `usa_html_personalizado = true`
- `custom_html` = el HTML completo con los marcadores de abajo

## Marcadores de texto simple

| Marcador | Reemplaza con |
|---|---|
| {{hero.titulo}} | Titulo principal del hero |
| {{hero.subtitulo}} | Subtitulo del hero |
| {{hero.badge}} | Texto del badge (si existe) |
| {{hero.cta_principal}} | Texto del boton principal |
| {{hero.cta_secundario}} | Texto del boton secundario |
| {{nosotros.titulo}} | Titulo de la seccion Nosotros |
| {{nosotros.descripcion}} | Descripcion de la empresa |
| {{nosotros.mision}} | Texto de mision |
| {{nosotros.vision}} | Texto de vision |
| {{nosotros.anos_experiencia}} | Anos de experiencia |
| {{nosotros.clientes_atendidos}} | Clientes atendidos |
| {{nosotros.proyectos_completados}} | Proyectos completados |
| {{footer.nombre_empresa}} | Nombre del negocio |
| {{footer.descripcion}} | Descripcion corta para el footer |
| {{contacto.direccion}} | Direccion fisica |
| {{contacto.email}} | Correo de contacto |
| {{contacto.telefono}} | Telefono de contacto |

Un marcador sin dato disponible se reemplaza por texto vacio, no rompe el HTML.
Los marcadores son sensibles a mayusculas y minusculas.

## Listas repetidas

Listas disponibles: productos, servicios, testimonios.

Ejemplo:

{{#each productos}}
  <div class="product-card">
    <h3>{{nombre}}</h3>
    <p>{{precio}}</p>
  </div>
{{/each}}

Dentro del bloque #each, los marcadores usan el nombre de campo del elemento,
sin prefijo (ej: {{nombre}}, {{precio}}, {{precio_anterior}}).

## Formulario de contacto

<form id="dms-contacto">
  <input type="text" name="nombre" required>
  <input type="email" name="correo">
  <input type="text" name="telefono">
  <textarea name="mensaje" required></textarea>
  <button type="submit">Enviar</button>
</form>

El sistema detecta id="dms-contacto" y conecta automaticamente el envio a
/api/formulario-contacto usando site_id, destino_email y nombre_negocio
del sitio.

Los campos del formulario deben usar exactamente estos name:
nombre, correo, telefono, mensaje.

## Archivos relacionados del sistema

- lib/render-custom-html.ts -> motor que procesa los marcadores
- app/demo/[id]/profesional/page.tsx -> punto donde se activa el HTML personalizado
- app/api/formulario-contacto/route.ts -> API que recibe el formulario
