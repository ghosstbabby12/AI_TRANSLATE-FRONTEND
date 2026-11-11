import { useEffect, useMemo, useState } from "react";
import { videosApi } from "../../../api/videosApi";
import { navigate, paths } from "../../../hooks/useRoute";
import { translate } from "../../../i18n";
import { errorText } from "../../../lib/format";
import type { Language, Translation } from "../../../models/video";

/**
 * Translating the existing transcript into another language: loads the
 * language list when the panel opens and picks the first one not translated yet.
 */
export function useOtherLanguages(videoId: string, translations: Translation[]) {
  const [open, setOpen] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [chosen, setChosen] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const translated = useMemo(() => new Set(translations.map((t) => t.targetLanguage)), [translations]);

  useEffect(() => {
    if (!open || languages.length) return;
    videosApi.languages().then(setLanguages, () => setError(translate("otherLanguages.languagesError")));
  }, [open, languages.length]);

  useEffect(() => {
    if (!chosen && languages.length) setChosen(languages.find((l) => !translated.has(l.code))?.code ?? "");
  }, [languages, chosen, translated]);

  async function translateNow() {
    if (!chosen) return;
    setError(null);
    setSending(true);
    try {
      const result = await videosApi.translateTo(videoId, chosen);
      navigate(paths.video(result.id));
    } catch (e) {
      setError(errorText(e));
      setSending(false);
    }
  }

  return {
    open,
    toggle: () => setOpen((o) => !o),
    close: () => setOpen(false),
    languages,
    chosen,
    setChosen,
    sending,
    error,
    translated,
    others: translations.filter((t) => t.id !== videoId),
    translateNow,
  };
}
