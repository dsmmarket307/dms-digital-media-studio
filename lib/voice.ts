import { createClient } from "@supabase/supabase-js";
import Retell from "retell-sdk";
import { NextRequest } from "next/server";

export const db = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

export async function verifiedBody(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("x-retell-signature") ?? "";
  const ok = await Retell.verify(raw, process.env.RETELL_API_KEY!, sig);
  return ok ? JSON.parse(raw) : null;
}

export async function userForAgent(agentId: string) {
  const { data, error } = await db()
    .from("voice_agents")
    .select("user_id")
    .eq("provider_agent_id", agentId)
    .eq("activo", true)
    .maybeSingle();
  if (error) console.error("voice-webhook error buscando agente:", error.message);
  return data?.user_id as string | undefined;
}