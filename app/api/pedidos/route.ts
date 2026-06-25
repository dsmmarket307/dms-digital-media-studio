import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { site_id, producto_nombre, producto_precio, nombre, telefono, ciudad, barrio, direccion, talla, cantidad, notas } = body;

    if (!site_id || !nombre || !telefono || !direccion) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase.from("pedidos").insert({
      site_id,
      producto_nombre,
      producto_precio,
      nombre,
      telefono,
      ciudad,
      barrio,
      direccion,
      talla,
      cantidad: cantidad ?? 1,
      notas,
      estado: "pendiente"
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}