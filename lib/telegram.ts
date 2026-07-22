export async function sendTelegramMessage(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("Telegram: faltan variables de entorno");
    return;
  }

  const url = "https://api.telegram.org/bot" + token + "/sendMessage";
  const maxIntentos = 3;

  for (let intento = 1; intento <= maxIntentos; intento++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) return;
      const errText = await res.text();
      console.error("Telegram error (intento " + intento + "):", res.status, errText);
    } catch (e) {
      clearTimeout(timeoutId);
      console.error("Telegram error (intento " + intento + "):", e);
    }
    if (intento < maxIntentos) {
      await new Promise(resolve => setTimeout(resolve, 500 * intento));
    }
  }
}