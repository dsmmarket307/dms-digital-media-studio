import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { domain } = await req.json();
    if (!domain) return NextResponse.json({ error: "Dominio requerido" }, { status: 400 });

    const token = process.env.VERCEL_API_TOKEN;
    const projectId = process.env.VERCEL_PROJECT_ID;

    const res = await fetch(`https://api.vercel.com/v9/projects/${projectId}/domains`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: domain.trim() }),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data }, { status: 500 });
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}