import { useEffect, useState } from "react";
import { readStorage, writeStorage } from "../lib/browser";

export type Theme = "light" | "dark" | "system";

// The same key (and values) are read by the script in index.html before painting.
const STORAGE_KEY = "traductor.tema";
const STORED_VALUE: Record<Exclude<Theme, "system">, string> = { light: "claro", dark: "oscuro" };

function readTheme(): Theme {
  const saved = readStorage(() => localStorage, STORAGE_KEY);
  return saved === STORED_VALUE.light ? "light" : saved === STORED_VALUE.dark ? "dark" : "system";
}

/** No attribute = follows the system (resolved by the @media rule in tokens.css). */
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.dataset.theme = theme;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    applyTheme(theme);
    writeStorage(() => localStorage, STORAGE_KEY, theme === "system" ? null : STORED_VALUE[theme]);
  }, [theme]);

  return [theme, setTheme] as const;
}

export const prefersDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
