// Bandera representativa de cada idioma destino (para el selector).
const BANDERAS: Record<string, string> = {
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

export const bandera = (codigo: string) => BANDERAS[codigo] ?? "🌐";

/** "inglés" → "Inglés" */
export const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);
