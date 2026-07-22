Deno.serve(async (req) => {
  try {
    const { message } = await req.json()
    const token = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID')
    if (!token || !chatId) {
      return new Response(JSON.stringify({ error: 'Missing env vars' }), { status: 500 })
    }
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
    })
    const data = await res.json()
    return new Response(JSON.stringify(data), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
