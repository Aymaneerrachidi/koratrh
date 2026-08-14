"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function AnimatedPage({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from("[data-hero-copy] > *", {
          y: 38,
          opacity: 0,
          duration: 0.85,
          stagger: 0.09,
        })
        .from("[data-hero-cat]", { scale: 1.08, opacity: 0, duration: 1.2 }, 0);

      gsap.to("[data-hero-cat]", {
        scale: 1.045,
        yPercent: 4,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.7,
        },
      });

      gsap.utils.toArray<HTMLElement>("[data-scale-image]").forEach((element) => {
        gsap.from(element, {
          scale: 0.88,
          opacity: 0.25,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            end: "top 42%",
            scrub: 0.6,
          },
        });
      });

      gsap.from("[data-scrub-word]", {
        opacity: 0.13,
        stagger: 0.035,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-scrub-text]",
          start: "top 82%",
          end: "bottom 50%",
          scrub: 0.5,
        },
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.from(element, {
          y: 36,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 88%", once: true },
        });
      });
    },
    { scope: root },
  );

  return <main ref={root}>{children}</main>;
}
