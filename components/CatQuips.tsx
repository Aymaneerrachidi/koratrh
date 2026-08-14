"use client";

import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useState } from "react";

const quips = [
  "Ask me about cats. I have nine lives and zero interest in doing your homework.",
  "All cats are excellent. Korats simply arrive with silver coats, green eyes, and better luck.",
  "Robinhood Chain is where my paws are. ETH pays the gas. I still refuse to drive.",
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
