import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { InterfaceLanguage } from "../models/user";
import { en } from "./locales/en";
import { es } from "./locales/es";
import { serverErrorsInEnglish } from "./serverErrors";

export type TranslationKey = keyof typeof es;
type Variables = Record<string, string | number>;

const DICTIONARIES: Record<InterfaceLanguage, Record<TranslationKey, string>> = { es, en };
const STORAGE_KEY = "traductor.idioma";

function initialLanguage(): InterfaceLanguage {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "es" || saved === "en") return saved;
  } catch {
    /* no storage */
  }
  return navigator.language?.toLowerCase().startsWith("en") ? "en" : "es";
}

// Module-level state: also used outside React (API client messages, video titles).
let current: InterfaceLanguage = initialLanguage();

/** Translates a key, replacing {variables}. Usable outside components. */
export function translate(key: TranslationKey, vars?: Variables): string {
  const text = DICTIONARIES[current][key] ?? es[key] ?? key;
  return vars ? text.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`)) : text;
}

export const currentLanguage = () => current;

/** Server error messages arrive in Spanish: the known ones are translated. */
export const translateServerMessage = (message: string) => (current === "en" ? (serverErrorsInEnglish[message] ?? message) : message);

/**
 * "en" → "Inglés" / "English", using the names the browser already knows.
 * `inSentence`: inside a sentence ("en inglés"); in English they stay capitalized.
 */
export function languageName(code: string, { inSentence = false } = {}): string {
  try {
    const name = new Intl.DisplayNames([current], { type: "language" }).of(code) ?? code;
    if (inSentence && current === "es") return name.toLowerCase();
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return code.toUpperCase();
  }
}

/** Date in the interface language. */
export const formatDate = (iso: string, options: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" }) =>
  new Intl.DateTimeFormat(current, options).format(new Date(iso));

interface LanguageContext {
  language: InterfaceLanguage;
  setLanguage: (language: InterfaceLanguage) => void;
  t: typeof translate;
}

const Context = createContext<LanguageContext | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setState] = useState<InterfaceLanguage>(current);

  const setLanguage = useCallback((next: InterfaceLanguage) => {
    current = next;
    setState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* no storage */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = translate("app.tabTitle");
  }, [language]);

  // `t` changes identity with the language, so components using it re-render
  const value = useMemo<LanguageContext>(() => ({ language, setLanguage, t: (key, vars) => translate(key, vars) }), [language, setLanguage]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useLanguage(): LanguageContext {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useLanguage must be used inside <I18nProvider>");
  return ctx;
}

/** Shortcut: const t = useT(); t("key") */
export const useT = () => useLanguage().t;
