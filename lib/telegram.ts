export async function sendTelegramMessage(message: string): Promise<void> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      console.error("Telegram: faltan variables de Supabase");
      return;
    }
    const res = await fetch(supabaseUrl + "/functions/v1/notify-telegram", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + supabaseKey,
      },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("Telegram error:", res.status, errText);
    }
  } catch (e) {
    console.error("Telegram error:", e);
  }
}