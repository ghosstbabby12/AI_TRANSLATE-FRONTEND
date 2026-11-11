import { TranslateIcon } from "../../../components/icons";
import { STATUS_LABEL } from "../../../components/StatusBadge";
import { languageName, useT } from "../../../i18n";
import { flagOf } from "../../../lib/format";
import type { Translation } from "../../../models/video";
import { useOtherLanguages } from "./useOtherLanguages";

interface Props {
  videoId: string;
  currentLanguage: string;
  translations: Translation[];
  /** Only possible once the video has been split into segments. */
  available: boolean;
}

/**
 * Top of the translation panel: "Translate the transcript into another
 * language" and links to the other translations. The picker unfolds inside
 * the panel, which scrolls on its own and would clip a floating menu.
 */
export function OtherLanguages({ videoId, currentLanguage, translations, available }: Props) {
  const state = useOtherLanguages(videoId, translations);
  const t = useT();

  return (
    <div className="other-languages">
      <button
        type="button"
        className="translate-other-button"
        aria-expanded={state.open}
        disabled={!available}
        title={available ? undefined : t("otherLanguages.unavailable")}
        onClick={state.toggle}
      >
        <TranslateIcon />
        {t("otherLanguages.button")}
      </button>

      {state.open && (
        <div className="translate-panel" onKeyDown={(e) => e.key === "Escape" && state.close()}>
          <select aria-label={t("otherLanguages.selectAria")} value={state.chosen} onChange={(e) => state.setChosen(e.target.value)} disabled={state.sending}>
            {state.languages.map((l) => (
              <option key={l.code} value={l.code} disabled={l.code === currentLanguage}>
                {flagOf(l.code)} {languageName(l.code)}
                {l.code === currentLanguage ? t("otherLanguages.current") : state.translated.has(l.code) ? t("otherLanguages.alreadyTranslated") : ""}
              </option>
            ))}
          </select>
          <span className="muted">{t("otherLanguages.note")}</span>
          {state.error && <p className="error">{state.error}</p>}
          <div className="translate-panel-buttons">
            <button type="button" className="secondary" onClick={state.close} disabled={state.sending}>
              {t("common.cancel")}
            </button>
            <button type="button" className="primary" onClick={state.translateNow} disabled={!state.chosen || state.sending}>
              {state.sending
                ? t("auth.oneMoment")
                : state.translated.has(state.chosen)
                  ? t("otherLanguages.viewTranslation")
                  : t("otherLanguages.translate")}
            </button>
          </div>
        </div>
      )}

      {state.others.length > 0 && (
        <div className="other-translations">
          <span>{t("otherLanguages.alsoIn")}</span>
          {state.others.map((tr) => (
            <a
              key={tr.id}
              href={`#/video/${tr.id}`}
              className="chip chip-link"
              title={t("otherLanguages.viewTitle", { status: t(STATUS_LABEL[tr.status]).toLowerCase() })}
            >
              {flagOf(tr.targetLanguage)} {tr.targetLanguage.toUpperCase()}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
