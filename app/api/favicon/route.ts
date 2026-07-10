import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return new NextResponse(null, { status: 404 });
    const supabase = await createClient();
    const { data: site } = await supabase.from("generated_websites").select("logo_url").eq("id", id).single();
    if (!site?.logo_url) return new NextResponse(null, { status: 404 });
    const res = await fetch(site.logo_url);
    if (!res.ok) return new NextResponse(null, { status: 404 });
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "image/png";
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}