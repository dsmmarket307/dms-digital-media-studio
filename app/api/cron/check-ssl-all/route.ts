import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkDomainSSL } from "@/lib/vercel/checkDomainSSL";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: dominios } = await supabase
    .from("domains")
    .select("id, domain")
    .neq("ssl_status", "active");

  const resultados = [];
  for (const d of dominios ?? []) {
    try {
      const result = await checkDomainSSL(d.domain);
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
        .eq("id", d.id);

      resultados.push({ domain: d.domain, sslStatus: result.sslStatus });
    } catch {
      resultados.push({ domain: d.domain, error: true });
    }
  }

  return NextResponse.json({ ok: true, checked: resultados.length, resultados });
}
