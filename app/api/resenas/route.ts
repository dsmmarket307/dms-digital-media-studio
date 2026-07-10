import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id");
  const producto_index = searchParams.get("producto_index");
  const supabase = await createClient();
  const { data: resenas } = await supabase.from("resenas").select("*").eq("site_id", site_id).eq("producto_index", producto_index).order("created_at", { ascending: false });
  return NextResponse.json({ resenas: resenas ?? [] });
}

import { rateLimit } from "@/lib/ratelimit";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { site_id, producto_index, nombre, calificacion, comentario, foto_url } = body;
    const supabase = await createClient();
    const { error } = await supabase.from("resenas").insert({ site_id, producto_index, nombre, calificacion, comentario, foto_url });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}