import type { ReactNode } from "react";
import { useAuth } from "../auth/AuthProvider";
import { prefersDark, useTheme, type Theme } from "../hooks/useTheme";
import { useLanguage, useT, type TranslationKey } from "../i18n";
import type { InterfaceLanguage } from "../models/user";
import { MonitorIcon, MoonIcon, SunIcon } from "./icons";

const THEMES: { value: Theme; label: TranslationKey; icon: ReactNode }[] = [
  { value: "light", label: "theme.light", icon: <SunIcon /> },
  { value: "dark", label: "theme.dark", icon: <MoonIcon /> },
  { value: "system", label: "theme.system", icon: <MonitorIcon /> },
];

const LANGUAGES: { value: InterfaceLanguage; short: string; name: string }[] = [
  { value: "es", short: "ES", name: "Español" },
  { value: "en", short: "EN", name: "English" },
];

/** Pill-shaped segmented control. `withLabels` shows the text next to the icon. */
export function ThemePicker({ withLabels = false }: { withLabels?: boolean }) {
  const [theme, setTheme] = useTheme();
  const t = useT();
  return (
    <div className={`segmented ${withLabels ? "with-labels" : ""}`} role="group" aria-label={t("menu.theme")}>
      {THEMES.map((option) => {
        const label = t(option.label);
        const name = t("theme.label", { name: label.toLowerCase() });
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={theme === option.value}
            aria-label={name}
            title={withLabels ? undefined : name}
            onClick={() => setTheme(option.value)}
          >
            {option.icon}
            {withLabels && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Round button that toggles light/dark ("system" stays in the account menu). */
export function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  const t = useT();
  const darkNow = theme === "dark" || (theme === "system" && prefersDark());
  const label = darkNow ? t("theme.switchToLight") : t("theme.switchToDark");
  return (
    <button type="button" className="theme-toggle" aria-label={label} title={label} onClick={() => setTheme(darkNow ? "light" : "dark")}>
      {darkNow ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

/** ES / EN pill. When signed in, the language is also saved in the profile. */
export function LanguagePicker({ withLabels = false }: { withLabels?: boolean }) {
  const { language } = useLanguage();
  const { changeLanguage } = useAuth();
  const t = useT();
  return (
    <div className={`segmented language-picker ${withLabels ? "with-labels" : ""}`} role="group" aria-label={t("language.change")}>
      {LANGUAGES.map((option) => (
        <button
          key={option.value}
          type="button"
          lang={option.value}
          aria-pressed={language === option.value}
          aria-label={option.name}
          title={option.name}
          onClick={() => changeLanguage(option.value)}
        >
          <span className="language-code">{option.short}</span>
          {withLabels && <span>{option.name}</span>}
        </button>
      ))}
    </div>
  );
}
