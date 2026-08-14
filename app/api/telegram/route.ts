import { NextRequest, NextResponse } from "next/server";
import { webhookCallback } from "grammy";
import { createKoratBot } from "@/lib/korat-bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();

const handler = token ? webhookCallback(createKoratBot(token), "std/http") : null;

export async function POST(request: NextRequest) {
  // Telegram echoes the secret set via setWebhook. Anything else is not Telegram.
  // Checked first so an unconfigured deployment still rejects strangers.
  if (secret && request.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!handler) {
    console.error("TELEGRAM_BOT_TOKEN is missing, webhook cannot run.");
    return NextResponse.json({ error: "Bot is not configured." }, { status: 500 });
  }

  try {
    return await handler(request);
  } catch (error) {
    // Always 200 back to Telegram: a non-2xx makes it retry the same update
    // forever, which turns one bad message into an infinite loop.
    console.error("Telegram webhook error", error);
    return new Response("ok", { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: Boolean(token),
    secured: Boolean(secret),
  });
}
