import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import NavbarProducto from "../NavbarProducto";
import FormularioPedido from "./FormularioPedido";
import Script from "next/script";

type Props = { params: Promise<{ id: string; productoId: string }>; searchParams: Promise<{ talla?: string; color?: string }> };

export async function generateMetadata({ params }: Props) {
  const { id, productoId } = await params;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: site } = await supabase.from("generated_websites").select("project_name, generated_content, logo_url").eq("id", id).single();
  const nombre = site?.generated_content?.footer?.nombre_empresa ?? site?.project_name ?? "DMS Digital Media Studio";
  const producto = site?.generated_content?.productos?.[parseInt(productoId)];
  const titulo = producto?.nombre ? `Pedido - ${producto.nombre} | ${nombre}` : nombre;
  const logo = site?.logo_url ?? null;
  return {
    title: titulo,
    icons: logo ? { icon: `/api/favicon?id=${id}`, apple: `/api/favicon?id=${id}` } : undefined,
  };
}

export default async function PedidoPage({ params, searchParams }: Props) {
  const { id, productoId } = await params;
  const { talla, color } = await searchParams;
  const supabase = await createClient();
  const { data: site } = await supabase.from("generated_websites").select("*").eq("id", id).maybeSingle();
  if (!site) return notFound();
  const c = site.generated_content;
  const productos = c?.productos ?? [];
  const p = productos[parseInt(productoId)];
  if (!p) return notFound();
  const pr = site.primary_color ?? "#7c3aed";
  const font = site.font_family ?? "'Segoe UI', sans-serif";

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: font }}>
      {site.meta_pixel_id && (
        <Script id="fbq-checkout" strategy="afterInteractive">
          {
            "if(window.fbq){fbq(" + String.fromCharCode(39) + "track" + String.fromCharCode(39) + "," + String.fromCharCode(39) + "InitiateCheckout" + String.fromCharCode(39) + ",{content_name:" + String.fromCharCode(39) + (p.nombre ?? "").replace(/[\x27\x22]/g, "") + String.fromCharCode(39) + "});}"
          }
        </Script>
      )}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "2rem 1rem" }}>
        <NavbarProducto id={id} logoUrl={site.logo_url} primaryColor={pr} />
        <div style={{ background: "#fff", borderRadius: 20, padding: "1.5rem", marginTop: "1.5rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <FormularioPedido producto={p} siteId={id} productoId={productoId} primaryColor={pr} tallaInicial={talla ?? ""} colorInicial={color ?? ""} />
        </div>
      </div>
    </div>
  );
}