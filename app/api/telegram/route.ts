import { NextRequest, NextResponse } from "next/server";
import { webhookCallback } from "grammy";
import { createKoratBot, recentUpdates } from "@/lib/korat-bot";

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

/**
 * Temporary diagnostic key for the group-delivery investigation.
 * Remove this and the recentUpdates buffer once the issue is resolved.
 */
const DIAG_KEY = "korat-diag-7f3a91c4";

export async function GET(request: NextRequest) {
  const status = {
    ok: true,
    configured: Boolean(token),
    secured: Boolean(secret),
    // So you can tell which build is actually live instead of guessing.
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local",
    groupMentionGate: true,
  };

  // Update metadata is only returned to whoever holds the diagnostic key, so a
  // public health check cannot be used to watch group activity.
  if (request.nextUrl.searchParams.get("diag") === DIAG_KEY) {
    return NextResponse.json({ ...status, recentUpdates: recentUpdates() });
  }

  return NextResponse.json(status);
}
