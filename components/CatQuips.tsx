"use client";

import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useState } from "react";

const quips = [
  "Nine lives, zero interest in your homework. Ask me about cats or don't waste the whiskers.",
  "Every cat is elite. I just came pre-installed with a silver coat, green eyes, and the good luck cat job title.",
  "Robinhood Chain is where my paws live. ETH pays the gas. I still refuse to drive.",
  "I do not do price predictions. I do naps, lore, and staring at you until you scroll.",
];

export function CatQuips() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % quips.length), 6000);
    return () => window.clearInterval(timer);
  }, []);

  const change = (direction: number) => {
    setActive((value) => (value + direction + quips.length) % quips.length);
  };

  return (
    <section className="quips-section section" aria-label="KORAT says" data-reveal>
      <div className="quips-avatars" aria-hidden="true">
        <span><Image src="/images/korat-avatar.png" alt="" fill sizes="96px" /></span>
        <span><Image src="/images/korat-hero.png" alt="" fill sizes="96px" /></span>
      </div>
      <blockquote key={active}>{quips[active]}</blockquote>
      <div className="quips-controls">
        <button type="button" onClick={() => change(-1)} aria-label="Previous KORAT quote">
          <ArrowLeft size={20} weight="bold" />
        </button>
        <span>{active + 1} / {quips.length}</span>
        <button type="button" onClick={() => change(1)} aria-label="Next KORAT quote">
          <ArrowRight size={20} weight="bold" />
        </button>
      </div>
    </section>
  );
}
