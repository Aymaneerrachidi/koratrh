import { Bot } from "grammy";
import { generateKoratReply } from "./llm";

type Message = { role: "user" | "assistant"; content: string };

/**
 * Conversation memory. On a long-polling process this survives for the life of
 * the process. On serverless it only survives while an instance stays warm, so
 * treat it as a bonus rather than a guarantee.
 */
const histories = new Map<string, Message[]>();
const lastRequest = new Map<string, number>();


/** Per-person key in groups, per-chat in DMs, so group members keep separate threads. */
function memoryKey(ctx: { chat?: { id: number; type: string }; from?: { id: number } }) {
  const chatId = ctx.chat?.id ?? 0;
  const isGroup = ctx.chat?.type === "group" || ctx.chat?.type === "supergroup";
  return isGroup ? `${chatId}:${ctx.from?.id ?? 0}` : `${chatId}`;
}

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
    histories.delete(memoryKey(ctx));
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
    histories.delete(memoryKey(ctx));
    await ctx.reply("Memory wiped. Whatever you said, I have already forgotten it. Classic cat behaviour. Fresh paws, ask again.");
  });

  bot.on("message:text", async (ctx) => {
    const chatId = ctx.chat.id;
    const isGroup = ctx.chat.type === "group" || ctx.chat.type === "supergroup";
    const raw = ctx.message.text;
    let question = raw.trim();

    if (isGroup) {
      const username = ctx.me.username;
      const mentionPattern = new RegExp(`@${username}\\b`, "i");
      const mentioned = mentionPattern.test(raw);
      const repliedToBot = ctx.message.reply_to_message?.from?.id === ctx.me.id;

      // In a group, stay silent unless spoken to. No mention, no reply, no answer.
      if (!mentioned && !repliedToBot) return;

      question = raw.replace(new RegExp(`@${username}`, "gi"), " ").replace(/\s+/g, " ").trim();

      if (!question) {
        await ctx.reply("you rang?", {
          reply_parameters: { message_id: ctx.message.message_id },
        });
        return;
      }
    }

    // Rate limit per person, not per chat, so one chatty member cannot block a whole group.
    const rateKey = memoryKey(ctx);
    const now = Date.now();
    if (now - (lastRequest.get(rateKey) || 0) < 1500) {
      await ctx.reply("One paw at a time. I am a cat, not a server farm. Give it a second.", {
        reply_parameters: isGroup ? { message_id: ctx.message.message_id } : undefined,
      });
      return;
    }
    lastRequest.set(rateKey, now);

    question = question.slice(0, 2000);
    if (!question) return;

    // Separate history per person in a group so members do not read each other's threads.
    const historyKey = rateKey;

    await ctx.api.sendChatAction(chatId, "typing");
    const history = histories.get(historyKey) || [];
    const nextHistory = [...history, { role: "user" as const, content: question }].slice(-10);

    try {
      const response = await generateKoratReply(nextHistory);
      console.log(`Telegram reply served by ${response.provider}.`);
      histories.set(
        historyKey,
        [...nextHistory, { role: "assistant" as const, content: response.answer }].slice(-10),
      );

      if (histories.size > 1000) {
        const oldest = histories.keys().next().value;
        if (oldest !== undefined) histories.delete(oldest);
      }

      await ctx.reply(response.answer, {
        link_preview_options: { is_disabled: true },
        reply_parameters: isGroup ? { message_id: ctx.message.message_id } : undefined,
      });
    } catch (error) {
      console.error("Telegram response error", error);
      await ctx.reply("Catnap in progress, brain temporarily offline. Poke me again in a moment.", {
        reply_parameters: isGroup ? { message_id: ctx.message.message_id } : undefined,
      });
    }
  });

  bot.catch((error) => console.error("Telegram bot error", error.error));

  return bot;
}
