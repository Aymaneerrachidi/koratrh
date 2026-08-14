import { buildKoratInstructions } from "./korat-lore";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ProviderName = "KORAT Guard" | "Cohere" | "Groq";

type Provider = {
  name: ProviderName;
  configured: boolean;
  generate: (messages: ChatMessage[]) => Promise<string>;
};

export type LlmReply = {
  answer: string;
  provider: ProviderName;
};

const CAT_TOPIC = /\b(cat|cats|kitten|kittens|kitty|kitties|feline|felines|korat|si-sawat|breed|breeds|purr|meow|whisker|whiskers|paw|paws|tail|tails|fur|coat|claw|claws|litter|pet|pets|vet|veterinarian|feeding|grooming|eyes?|ears?)\b/i;
const PROJECT_TOPIC = /(?:\$korat|\bkorat\b|robinhood chain|\brobinhood\b|chain id|onchain|token|memecoin|coin|contract|ticker|wallet|gas|network|launch|project|community|telegram)/i;

export class NoProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoProviderError";
  }
}

export function isAllowedKoratTopic(messages: ChatMessage[]) {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  return CAT_TOPIC.test(lastUserMessage) || PROJECT_TOPIC.test(lastUserMessage);
}

export async function generateKoratReply(messages: ChatMessage[]): Promise<LlmReply> {
  if (!isAllowedKoratTopic(messages)) {
    return {
      provider: "KORAT Guard",
      answer:
        "Hiss. My whiskers only handle cats, cat care, $KORAT lore, and our home on Robinhood Chain. Ask me something feline, human.",
    };
  }

  const providers = getProviders().filter((provider) => provider.configured);
  if (providers.length === 0) {
    throw new NoProviderError(
      "No LLM provider is configured. Add COHERE_API_KEY and GROQ_API_KEY to .env.local.",
    );
  }

  const errors: string[] = [];
  for (const provider of providers) {
    try {
      const answer = (await provider.generate(messages)).trim();
      if (!answer) throw new Error("Provider returned an empty response");
      return { answer, provider: provider.name };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown provider error";
      errors.push(`${provider.name}: ${message}`);
      console.warn(`[KORAT] ${provider.name} failed; trying fallback.`, message);
    }
  }

  throw new Error(`Every configured LLM provider failed. ${errors.join(" | ")}`);
}

function getProviders(): Provider[] {
  return [
    {
      name: "Cohere",
      configured: Boolean(process.env.COHERE_API_KEY?.trim()),
      generate: generateWithCohere,
    },
    {
      name: "Groq",
      configured: Boolean(process.env.GROQ_API_KEY?.trim()),
      generate: generateWithGroq,
    },
  ];
}

async function generateWithCohere(messages: ChatMessage[]) {
  const response = await postJson<CohereResponse>(
    "https://api.cohere.com/v2/chat",
    {
      model: process.env.COHERE_MODEL?.trim() || "command-a-plus-05-2026",
      messages: [
        { role: "system", content: buildKoratInstructions() },
        ...messages.map((message) => ({ role: message.role, content: message.content })),
      ],
      max_tokens: 500,
      temperature: 0.3,
    },
    {
      Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
      "X-Client-Name": "korat-onchain",
    },
  );

  return response.message?.content?.find((part) => part.type === "text")?.text ?? "";
}

async function generateWithGroq(messages: ChatMessage[]) {
  const response = await postJson<GroqResponse>(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: process.env.GROQ_MODEL?.trim() || "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: buildKoratInstructions() },
        ...messages.map((message) => ({ role: message.role, content: message.content })),
      ],
      max_completion_tokens: 500,
      temperature: 0.3,
    },
    { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
  );

  return response.choices?.[0]?.message?.content ?? "";
}

async function postJson<T>(url: string, body: unknown, headers: Record<string, string>): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`${response.status} ${response.statusText}: ${detail}`);
  }

  return (await response.json()) as T;
}

type CohereResponse = {
  message?: { content?: Array<{ type: string; text?: string }> };
};

type GroqResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};
