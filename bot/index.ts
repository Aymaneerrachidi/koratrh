import "dotenv/config";
import { Bot } from "grammy";
import { generateKoratReply } from "../lib/llm";

const telegramToken = process.env.TELEGRAM_BOT_TOKEN;

if (!telegramToken) throw new Error("TELEGRAM_BOT_TOKEN is missing.");

const bot = new Bot(telegramToken);
const histories = new Map<number, Array<{ role: "user" | "assistant"; content: string }>>();
const lastRequest = new Map<number, number>();

bot.command("start", async (ctx) => {
  histories.delete(ctx.chat.id);
  await ctx.reply(
    "Mrrp. I am KORAT, your silver-blue lore keeper. Ask my whiskers about cats, Si-Sawat, Thai good-luck tradition, $KORAT, or Robinhood Chain. Unrelated questions get a polite hiss.\n\nI do not predict prices or give financial advice.",
  );
});

bot.command("lore", async (ctx) => {
  await ctx.reply(
    "The Korat is Thailand's silver-blue good luck cat, traditionally called Si-Sawat. Its story appears in the historic Cat-Book Poems, and Korats were treasured as gifts for prosperity and happy beginnings.",
  );
});

bot.command("chain", async (ctx) => {
  await ctx.reply(
    "Robinhood Chain is an EVM-compatible Layer 2. Mainnet chain ID: 4663. Gas token: ETH. Always verify network details and the $KORAT contract through official project links.",
  );
});

bot.command("contract", async (ctx) => {
  const contract = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.trim();
  await ctx.reply(contract ? `Confirmed $KORAT contract:\n${contract}` : "The $KORAT contract has not been announced here yet. Never trust an address from an unverified reply or DM.");
});

bot.command("reset", async (ctx) => {
  histories.delete(ctx.chat.id);
  await ctx.reply("Memory cleared. Fresh paws, fresh question.");
});

bot.on("message:text", async (ctx) => {
  const chatId = ctx.chat.id;
  const now = Date.now();
  if (now - (lastRequest.get(chatId) || 0) < 1500) {
    await ctx.reply("One paw at a time. Please wait a moment before asking again.");
    return;
  }
  lastRequest.set(chatId, now);

  const question = ctx.message.text.trim().slice(0, 2000);
  if (!question) return;

  await ctx.api.sendChatAction(chatId, "typing");
  const history = histories.get(chatId) || [];
  const nextHistory = [...history, { role: "user" as const, content: question }].slice(-10);

  try {
    const response = await generateKoratReply(nextHistory);
    const answer = response.answer;
    console.log(`Telegram reply served by ${response.provider}.`);
    histories.set(chatId, [...nextHistory, { role: "assistant" as const, content: answer }].slice(-10));

    if (histories.size > 1000) {
      const oldest = histories.keys().next().value;
      if (typeof oldest === "number") histories.delete(oldest);
    }

    await ctx.reply(answer, { link_preview_options: { is_disabled: true } });
  } catch (error) {
    console.error("Telegram response error", error);
    await ctx.reply("The lore keeper is taking a short catnap. Please try again soon.");
  }
});

bot.catch((error) => console.error("Telegram bot error", error.error));

await bot.api.setMyCommands([
  { command: "start", description: "Meet KORAT" },
  { command: "lore", description: "Read the short origin story" },
  { command: "chain", description: "Get Robinhood Chain basics" },
  { command: "contract", description: "Show the confirmed contract" },
  { command: "reset", description: "Clear conversation memory" },
]);

console.log("KORAT Telegram bot is listening.");
await bot.start({ allowed_updates: ["message"] });
