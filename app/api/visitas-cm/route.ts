import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const OWNER = "d0ac77a9-ce5a-43bf-aa1c-3158103477ec";
const ESTADOS = ["solicitud_recibida","pago_pendiente","pago_recibido","pendiente_agendamiento","visita_agendada","visita_confirmada","visita_realizada","cotizacion_generada","descontada_cotizacion","servicio_no_contratado","cancelada"];
const SIN_PAGO = ["solicitud_recibida","pago_pendiente","cancelada"];

function fail(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return fail("No autorizado.", 401);
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
    const { data: ud } = await sb.auth.getUser(token);
    if (!ud?.user || ud.user.id !== OWNER) return fail("No autorizado.", 403);

    const body: any = await req.json().catch(() => ({}));
    const accion = String(body.accion || "");

    if (accion === "listar") {
      const { data: vs } = await sb.from("visitas_tecnicas").select("*").eq("user_id", OWNER).order("created_at", { ascending: false });
      const ids = (vs || []).map((v: any) => v.cotizacion_id).filter(Boolean);
      let cs: any[] = [];
      if (ids.length) {
        const r = await sb.from("cotizaciones_cm").select("id,nombre,celular,correo,direccion,ciudad,ciudad_otra,tipo_inmueble,servicio").in("id", ids);
        cs = r.data || [];
      }
      const { data: pr } = await sb.from("precios_cm").select("valor").eq("user_id", OWNER).eq("clave", "visita_tecnica").single();
      return NextResponse.json({ visitas: vs || [], cotizaciones: cs, precio: pr?.valor ?? null });
    }

    if (accion === "precio") {
      const v = Number(body.valor);
      if (!isFinite(v) || v < 0 || v > 100000000) return fail("Valor invalido.");
      const { error } = await sb.from("precios_cm").upsert({ user_id: OWNER, clave: "visita_tecnica", valor: v, updated_at: new Date().toISOString() }, { onConflict: "user_id,clave" });
      if (error) { console.error("visitas-cm precio:", error); return fail("No se pudo guardar el precio.", 500); }
      return NextResponse.json({ ok: true });
    }

    const { data: vis } = await sb.from("visitas_tecnicas").select("*").eq("id", String(body.id || "")).single();
    if (!vis || vis.user_id !== OWNER) return fail("Visita no encontrada.", 404);

    if (accion === "pago") {
      if (vis.pago_fecha) return fail("El pago ya esta registrado.");
      if (vis.estado === "cancelada") return fail("La visita esta cancelada.");
      const valor = Number(body.valor);
      const metodo = String(body.metodo || "").trim().slice(0, 40);
      const referencia = String(body.referencia || "").trim().slice(0, 100);
      if (!isFinite(valor) || valor <= 0) return fail("Valor de pago invalido.");
      if (valor < Number(vis.valor_cobrado)) return fail("El valor pagado es menor al valor de la visita.");
      if (!metodo) return fail("Indica el metodo de pago.");
      const dia = /^\d{4}-\d{2}-\d{2}$/.test(String(body.fecha || "")) ? String(body.fecha) : new Date().toISOString().slice(0, 10);
      const { data: mov, error: me } = await sb.from("movimientos_manuales").insert({
        user_id: OWNER, tipo: "ingreso", concepto: "Visita tecnica y diagnostico", categoria: "Visita tecnica",
        monto: valor, fecha: dia, notas: "Metodo: " + metodo + (referencia ? " | Ref: " + referencia : ""),
      }).select("id").single();
      if (me || !mov) { console.error("visitas-cm movimiento:", me); return fail("No se pudo registrar el ingreso.", 500); }
      const { error: ue } = await sb.from("visitas_tecnicas").update({
        estado: "pendiente_agendamiento", pago_fecha: new Date(dia + "T12:00:00-05:00").toISOString(), pago_valor: valor,
        pago_metodo: metodo, pago_referencia: referencia || null, pago_registrado_por: OWNER, movimiento_id: mov.id,
      }).eq("id", vis.id).is("pago_fecha", null);
      if (ue) {
        console.error("visitas-cm pago:", ue);
        await sb.from("movimientos_manuales").delete().eq("id", mov.id);
        return fail("No se pudo registrar el pago.", 500);
      }
      return NextResponse.json({ ok: true });
    }

    if (accion === "estado") {
      const e = String(body.estado || "");
      if (!ESTADOS.includes(e)) return fail("Estado invalido.");
      if (e === "descontada_cotizacion") return fail("Usa la accion de descuento.");
      if (vis.descuento_aplicado) return fail("La visita ya fue descontada de una cotizacion.");
      if (!SIN_PAGO.includes(e) && !vis.pago_fecha) return fail("Registra el pago antes de avanzar la visita.");
      if (vis.pago_fecha && (e === "pago_pendiente" || e === "solicitud_recibida")) return fail("La visita ya tiene pago registrado.");
      const upd: any = { estado: e };
      if (e === "visita_agendada" || e === "visita_confirmada") {
        const fv = body.fecha_visita ? new Date(String(body.fecha_visita)) : null;
        if (fv && !isNaN(fv.getTime())) upd.fecha_visita = fv.toISOString();
        else if (!vis.fecha_visita) return fail("Indica la fecha de la visita.");
      }
      const { error } = await sb.from("visitas_tecnicas").update(upd).eq("id", vis.id);
      if (error) { console.error("visitas-cm estado:", error); return fail("No se pudo cambiar el estado.", 500); }
      return NextResponse.json({ ok: true });
    }

    if (accion === "descuento") {
      if (!vis.pago_fecha) return fail("La visita no tiene pago registrado.");
      if (vis.descuento_aplicado) return fail("El descuento ya fue aplicado.");
      if (vis.estado === "servicio_no_contratado" || vis.estado === "cancelada") return fail("Esta visita no admite descuento.");
      const c = Number(body.cotizacion_valor);
      const d = Number(vis.valor_cobrado);
      if (!isFinite(c) || c <= 0) return fail("Valor de cotizacion invalido.");
      if (c < d) return fail("La cotizacion es menor al valor de la visita.");
      const { data: act, error } = await sb.from("visitas_tecnicas").update({
        estado: "descontada_cotizacion", cotizacion_valor: c, descuento_aplicado: true, descuento_valor: d, descuento_fecha: new Date().toISOString(),
      }).eq("id", vis.id).eq("descuento_aplicado", false).select("id");
      if (error) { console.error("visitas-cm descuento:", error); return fail("No se pudo aplicar el descuento.", 500); }
      if (!act || !act.length) return fail("El descuento ya fue aplicado.");
      return NextResponse.json({ ok: true, saldo: c - d });
    }

    return fail("Accion invalida.");
  } catch (e) {
    console.error("visitas-cm:", e);
    return fail("Error procesando la solicitud.", 500);
  }
}