import { Bot } from "grammy";
import { generateKoratReply } from "./llm";

type Message = { role: "user" | "assistant"; content: string };

/**
 * Conversation memory. On a long-polling process this survives for the life of
 * the process. On serverless it only survives while an instance stays warm, so
 * treat it as a bonus rather than a guarantee.
 */
const histories = new Map<number, Message[]>();
const lastRequest = new Map<number, number>();

export const KORAT_COMMANDS = [
  { command: "start", description: "Meet the good luck cat" },
  { command: "lore", description: "The origin story, short version" },
  { command: "chain", description: "Robinhood Chain basics" },
  { command: "ca", description: "Show the confirmed contract address" },
  { command: "reset", description: "Wipe my memory" },
];

export function createKoratBot(token: string) {
  const bot = new Bot(token);

  bot.command("start", async (ctx) => {
    histories.delete(ctx.chat.id);
    await ctx.reply(
      "Mrrp. KORAT here. Silver coat, green eyes, good luck cat, absolutely no work ethic.\n\nAsk me about cats, Si-Sawat, the good luck tradition, $KORAT, or Robinhood Chain. Ask me anything else and you get a hiss.\n\nNo price calls, no financial advice. I am a cat.",
    );
  });

  bot.command("lore", async (ctx) => {
    await ctx.reply(
      "Short version: I am the good luck cat, Si-Sawat to my friends. Silver-tipped blue coat, green eyes, heart-shaped face, all documented in the historic Cat-Book Poems. Korats were never sold, only gifted, because handing someone a Korat meant handing them good fortune. Yes, I am a present. No, you cannot return me.",
    );
  });

  bot.command("chain", async (ctx) => {
    await ctx.reply(
      "Robinhood Chain, EVM compatible Layer 2. Chain ID 4663, gas paid in ETH. That is the litter box my paws live in.\n\nVerify every network detail and the $KORAT contract through official project links. Trust nothing a stranger sends you in a DM.",
    );
  });

  bot.command(["contract", "ca"], async (ctx) => {
    const contract = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.trim();
    await ctx.reply(
      contract
        ? `Confirmed $KORAT CA:\n${contract}\n\nCheck it character by character. Fake CAs are built to match the first and last few, so a quick glance is how wallets die.`
        : "No CA announced here yet. Anyone sliding one into your DMs is not me, is not good luck, and is after your lunch money.\n\nWhen it is real it comes from official links only. Verify before you ape.",
    );
  });

  bot.command("reset", async (ctx) => {
    histories.delete(ctx.chat.id);
    await ctx.reply("Memory wiped. Whatever you said, I have already forgotten it. Classic cat behaviour. Fresh paws, ask again.");
  });

  bot.on("message:text", async (ctx) => {
    const chatId = ctx.chat.id;
    const now = Date.now();
    if (now - (lastRequest.get(chatId) || 0) < 1500) {
      await ctx.reply("One paw at a time. I am a cat, not a server farm. Give it a second.");
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
      console.log(`Telegram reply served by ${response.provider}.`);
      histories.set(
        chatId,
        [...nextHistory, { role: "assistant" as const, content: response.answer }].slice(-10),
      );

      if (histories.size > 1000) {
        const oldest = histories.keys().next().value;
        if (typeof oldest === "number") histories.delete(oldest);
      }

      await ctx.reply(response.answer, { link_preview_options: { is_disabled: true } });
    } catch (error) {
      console.error("Telegram response error", error);
      await ctx.reply("Catnap in progress, brain temporarily offline. Poke me again in a moment.");
    }
  });

  bot.catch((error) => console.error("Telegram bot error", error.error));

  return bot;
}
