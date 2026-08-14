"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem("korat-theme") as Theme | null;
    const initial = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("korat-theme", next);
  }

  const label = theme === "light" ? "Use dark theme" : "Use light theme";

  return (
    <button className="icon-button" type="button" onClick={toggle} aria-label={label} title={label}>
      {theme === "light" ? <Moon size={19} weight="bold" /> : <Sun size={19} weight="bold" />}
    </button>
  );
}
