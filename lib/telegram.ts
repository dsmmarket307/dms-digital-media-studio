export async function sendTelegramMessage(message: string): Promise<void> {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
      console.error("Telegram: faltan variables de entorno");
      return;
    }
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("Telegram error:", res.status, errText);
    }
  } catch (e) {
    console.error("Telegram error:", e);
  }
}