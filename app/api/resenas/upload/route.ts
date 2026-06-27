import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const site_id = formData.get("site_id") as string;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    const supabase = await createClient();
    const ext = file.name.split(".").pop();
    const filename = `resena-${site_id}-${Date.now()}.${ext}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const { error } = await supabase.storage.from("resenas").upload(filename, buffer, { contentType: file.type });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const { data } = supabase.storage.from("resenas").getPublicUrl(filename);
    return NextResponse.json({ url: data.publicUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}