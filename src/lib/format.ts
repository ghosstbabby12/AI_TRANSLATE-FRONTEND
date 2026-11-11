/** "1:05" or "1:02:03" */
export function formatTime(seconds: number): string {
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const mm = String(Math.floor((total % 3600) / 60)).padStart(h ? 2 : 1, "0");
  const ss = String(total % 60).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** "01:23" or "1:02:03" → seconds */
export const timestampToSeconds = (timestamp: string) =>
  timestamp.split(":").reduce((total, part) => total * 60 + Number(part), 0);

export const formatMegabytes = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/** A readable message from any thrown value. */
export const errorText = (err: unknown) => (err instanceof Error ? err.message : String(err));

// Representative flag of each target language (for the pickers)
const FLAGS: Record<string, string> = {
  es: "🇪🇸",
  en: "🇬🇧",
  pt: "🇧🇷",
  fr: "🇫🇷",
  de: "🇩🇪",
  it: "🇮🇹",
  ja: "🇯🇵",
  ko: "🇰🇷",
  zh: "🇨🇳",
};

export const flagOf = (code: string) => FLAGS[code] ?? "🌐";
