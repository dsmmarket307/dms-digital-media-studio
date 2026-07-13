import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const mainDomain = "dms-digital-media-studio.vercel.app";
  const isCustomDomain = hostname !== mainDomain && !hostname.includes("vercel.app") && !hostname.includes("localhost");

  if (isCustomDomain) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/domains?domain=eq.${hostname}&select=site_id,status&limit=1`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });
      const data = await res.json();
      if (data?.length > 0 && data[0].status === "active") {
        const siteId = data[0].site_id;
        const pathname = request.nextUrl.pathname;
        const url = request.nextUrl.clone();
        if (pathname === "/" || pathname === "") {
          url.pathname = `/demo/${siteId}`;
        } else {
          url.pathname = `/demo/${siteId}${pathname}`;
        }
        return NextResponse.rewrite(url);
      }
    } catch (e) {
      console.error("Error en middleware de dominio:", e);
    }
  }

  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  const publicRoutes = ["/", "/auth/login", "/auth/register", "/demo", "/planes", "/api", "/servicios", "/portafolio", "/contacto", "/politica-de-privacidad", "/terminos-y-condiciones", "/tratamiento-de-datos"];
  const isPublic = publicRoutes.some(r => pathname.startsWith(r));
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }
  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};