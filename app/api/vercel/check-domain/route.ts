import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkDomainSSL } from "@/lib/vercel/checkDomainSSL";

export async function POST(req: NextRequest) {
  try {
    const { domainId, domain } = await req.json();
    if (!domainId || !domain) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const result = await checkDomainSSL(domain.trim());

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const nuevoStatus =
      result.sslStatus === "active" ? "active" :
      result.sslStatus === "error" ? "dns_error" : "pending";

    await supabase
      .from("domains")
      .update({
        ssl_status: result.sslStatus,
        dns_verified: result.verified,
        status: nuevoStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", domainId);

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: "Error verificando SSL" }, { status: 500 });
  }
}
