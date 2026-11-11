import { CheckIcon, CopyIcon, DownloadIcon, RetryIcon, SparkleIcon } from "../../../components/icons";
import { formatDate, languageName, useT } from "../../../i18n";
import type { VideoDetail } from "../../../models/video";
import { SummaryContent } from "./SummaryContent";
import { useSummary } from "./useSummary";

interface Props {
  video: VideoDetail;
  /** It can only be summarized once the translation has finished. */
  available: boolean;
  onSeek: (seconds: number) => void;
}

/** "AI summary" card. */
export function SummaryCard({ video, available, onSeek }: Props) {
  const summary = useSummary(video);
  const t = useT();
  const generating = summary.status === "processing";
  const failed = summary.status === "failed";
  const detail = generating
    ? t("summary.generatingDetail")
    : !available && !summary.text
      ? t("summary.waiting")
      : t("summary.detail", { language: languageName(video.targetLanguage, { inSentence: true }) });

  return (
    <div className="summary">
      <div className="summary-header">
        <span className="feature-icon" aria-hidden>
          <SparkleIcon />
        </span>
        <div className="summary-header-text">
          <strong>{t("summary.title")}</strong>
          <span className="muted">{detail}</span>
        </div>
        <div className="summary-actions">
          {summary.text && !generating && (
            <>
              <button
                type="button"
                className="icon-button"
                data-tip={summary.copied ? t("summary.copied") : t("summary.copy")}
                aria-label={t("summary.copy")}
                onClick={summary.copy}
              >
                {summary.copied ? <CheckIcon /> : <CopyIcon />}
              </button>
              <button type="button" className="icon-button" data-tip={t("summary.regenerate")} aria-label={t("summary.regenerate")} onClick={summary.generate} disabled={!available}>
                <RetryIcon />
              </button>
              <button type="button" className="primary" onClick={summary.download}>
                <DownloadIcon />
                {t("summary.download")}
              </button>
            </>
          )}
          {!summary.text && (
            <button type="button" className={failed ? "secondary" : "primary"} onClick={summary.generate} disabled={!available || generating}>
              {generating ? <span className="spinner spinner-button" aria-hidden /> : failed ? <RetryIcon /> : <SparkleIcon />}
              {generating ? t("summary.generating") : failed ? t("summary.retry") : t("summary.generate")}
            </button>
          )}
          {summary.text && generating && <span className="spinner" aria-label={t("summary.generating")} />}
        </div>
      </div>

      {failed && <p className="error">{t("summary.error")}</p>}
      {summary.error && <p className="error">{summary.error}</p>}

      {summary.text && (
        <div className={generating ? "summary-body regenerating" : "summary-body"}>
          <SummaryContent text={summary.text} onSeek={onSeek} />
          {summary.createdAt && <p className="summary-date">{t("summary.generatedOn", { date: formatDate(summary.createdAt) })}</p>}
        </div>
      )}
    </div>
  );
}
