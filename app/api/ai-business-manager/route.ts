import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { section } = await req.json()
    const mes = new Date().toLocaleString('es-CO', { month: 'long', year: 'numeric' })

    const prompts: Record<string, string> = {
      metas: `Eres experto en agencias digitales colombianas. Genera 5 metas para ${mes} para DMS Digital Studio sin asteriscos ni markdown.\nMETAS DEL MES\n1. [meta]\n2. [meta]\n3. [meta]\n4. [meta]\n5. [meta]`,
      estrategias: `Eres experto en crecimiento de agencias. Crea plan semanal para DMS Digital Studio sin asteriscos ni markdown.\nSEMANA 1\n[accion 1]\n[accion 2]\nSEMANA 2\n[accion 1]\n[accion 2]\nSEMANA 3\n[accion 1]\n[accion 2]\nSEMANA 4\n[accion 1]\n[accion 2]`,
      contenido: `Eres experto en contenido digital. Crea calendario semanal para DMS Digital Studio sin asteriscos ni markdown.\nLUNES\nPlataforma: [red social]\nTema: [tema]\nMIERCOLES\nPlataforma: [red social]\nTema: [tema]\nVIERNES\nPlataforma: [red social]\nTema: [tema]`,
      proyecciones: `Eres analista financiero. Genera proyecciones para DMS Digital Studio sin asteriscos ni markdown.\nPROYECCION 6 MESES\nClientes: [numero]\nIngresos: [monto COP]\nPROYECCION 1 ANO\nClientes: [numero]\nIngresos: [monto COP]\nRECOMENDACION CLAVE\n[accion]`,
      clientes: `Eres experto en retencion de clientes. Genera plan para DMS Digital Studio sin asteriscos ni markdown.\nESTRATEGIAS\n1. [estrategia]\n2. [estrategia]\n3. [estrategia]\n4. [estrategia]\n5. [estrategia]\nACCION INMEDIATA\n[accion hoy]`,
    }

    const prompt = prompts[section] ?? prompts.metas

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const groqData = await groqRes.json()
    const resultado = groqData.choices?.[0]?.message?.content ?? 'No se pudo generar.'

    return NextResponse.json({ resultado })
  } catch (error) {
    console.error('ai-business-manager error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
