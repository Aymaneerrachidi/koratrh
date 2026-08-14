"use client";

import { ArrowUp, Sparkle } from "@phosphor-icons/react";
import Image from "next/image";
import { FormEvent, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const greeting: Message = {
  role: "assistant",
  content: "Mrrp. I am KORAT, keeper of silver-blue lore. Ask my whiskers about cats, $KORAT, or Robinhood Chain.",
};

const prompts = ["Why is the Korat lucky?", "What makes the breed unique?", "Which chain is $KORAT on?"];

export function KoratChat() {
  const [messages, setMessages] = useState<Message[]>([greeting]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function sendMessage(text: string) {
    const clean = text.trim();
    if (!clean || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user" as const, content: clean }].slice(-12);
    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = (await response.json()) as { answer?: string; error?: string };
      if (!response.ok || !data.answer) throw new Error(data.error || "No answer received.");
      setMessages((current) => [...current, { role: "assistant", content: data.answer! }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "KORAT could not answer just now.");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <div className="chat-shell">
      <div className="chat-header">
        <Image src="/images/korat-avatar.png" width={52} height={52} alt="KORAT, a silver-blue cat with green eyes" />
        <div>
          <strong>KORAT Lore Keeper</strong>
          <span>Breed facts, project lore, chain basics</span>
        </div>
        <Sparkle size={22} weight="fill" aria-hidden="true" />
      </div>

      <div className="chat-log" aria-live="polite">
        {messages.map((message, index) => (
          <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
            {message.content}
          </div>
        ))}
        {loading && (
          <div className="message assistant chat-loading" aria-label="KORAT is thinking">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>

      <div className="prompt-row" aria-label="Suggested questions">
        {prompts.map((prompt) => (
          <button type="button" key={prompt} onClick={() => void sendMessage(prompt)} disabled={loading}>
            {prompt}
          </button>
        ))}
      </div>

      {error && <p className="chat-error" role="alert">{error}</p>}

      <form className="chat-form" onSubmit={handleSubmit}>
        <label htmlFor="korat-question">Ask the lore keeper</label>
        <div>
          <input
            ref={inputRef}
            id="korat-question"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={2000}
            placeholder="What does Si-Sawat mean?"
            autoComplete="off"
          />
          <button type="submit" aria-label="Send question" disabled={!input.trim() || loading}>
            <ArrowUp size={22} weight="bold" />
          </button>
        </div>
        <span className="form-helper">Educational answers only. No price predictions or financial advice.</span>
      </form>
    </div>
  );
}
