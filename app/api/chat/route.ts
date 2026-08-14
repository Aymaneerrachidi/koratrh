import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateKoratReply, NoProviderError } from "@/lib/llm";

export const runtime = "nodejs";

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2000),
      }),
    )
    .min(1)
    .max(12),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "That message is too long for my attention span. Trim it down." }, { status: 400 });
    }

    const reply = await generateKoratReply(parsed.data.messages);
    return NextResponse.json(reply);
  } catch (error) {
    if (error instanceof NoProviderError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("KORAT chat error", error);
    return NextResponse.json(
      { error: "Catnap in progress, brain temporarily offline. Poke me again in a moment." },
      { status: 500 },
    );
  }
}
