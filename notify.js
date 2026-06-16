// Notificaciones a Telegram. Tolerante a fallo: si no hay config o falla, no rompe la request.
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export const telegramEnabled = !!(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID);

export async function notifyTelegram(text) {
  if (!telegramEnabled) return;
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('⚠️  Telegram notify falló:', res.status, body);
    }
  } catch (err) {
    console.error('⚠️  Telegram notify error:', err.message);
  }
}
