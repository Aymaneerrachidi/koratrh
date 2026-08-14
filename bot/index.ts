import "dotenv/config";
import { createKoratBot, KORAT_COMMANDS } from "../lib/korat-bot";

/**
 * Local development only: long polling.
 * Production runs the same bot through the webhook at app/api/telegram/route.ts.
 * Never run both against the same token at once, Telegram will reject one.
 */
async function main() {
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!telegramToken) throw new Error("TELEGRAM_BOT_TOKEN is missing.");

  const bot = createKoratBot(telegramToken);

  // A webhook left over from a deploy would block polling, so clear it first.
  await bot.api.deleteWebhook({ drop_pending_updates: false });
  await bot.api.setMyCommands(KORAT_COMMANDS);

  process.once("SIGINT", () => bot.stop());
  process.once("SIGTERM", () => bot.stop());

  console.log("KORAT Telegram bot is listening (long polling, local dev).");
  await bot.start({ allowed_updates: ["message"] });
}

void main().catch((error) => {
  console.error("KORAT bot failed to start", error);
  process.exitCode = 1;
});
