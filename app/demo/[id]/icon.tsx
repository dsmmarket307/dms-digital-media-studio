import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: site } = await supabase.from("generated_websites").select("logo_url, primary_color").eq("id", id).single();
  const color = site?.primary_color ?? "#7c3aed";
  if (site?.logo_url) {
    return new ImageResponse(
      <img src={site.logo_url} width={32} height={32} style={{ borderRadius: 4 }} />,
      { ...size }
    );
  }
  return new ImageResponse(
    <div style={{ width: 32, height: 32, background: color, borderRadius: 4 }} />,
    { ...size }
  );
}