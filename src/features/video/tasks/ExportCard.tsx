import { FilmIcon, RetryIcon } from "../../../components/icons";
import { useT } from "../../../i18n";
import type { TaskStatus } from "../../../models/video";
import { useVideoExport } from "./useVideoExport";

interface Props {
  videoId: string;
  initialStatus: TaskStatus | null;
  /** Without ready subtitles there is nothing to burn in. */
  disabled: boolean;
}

/** "Video with subtitles" card. */
export function ExportCard({ videoId, initialStatus, disabled }: Props) {
  const { status, error, start } = useVideoExport(videoId, initialStatus);
  const t = useT();
  const generating = status === "processing";
  const failed = status === "failed";

  return (
    <div className="video-export">
      <div className="video-export-text">
        <strong>{t("export.title")}</strong>
        <span className="muted">
          {generating ? t("export.generatingDetail") : status === "ready" ? t("export.readyDetail") : t("export.detail")}
        </span>
        {error && <span className="error">{error}</span>}
      </div>
      <button type="button" className={failed ? "secondary" : "primary"} onClick={start} disabled={disabled || generating}>
        {generating ? <span className="spinner spinner-button" aria-hidden /> : failed ? <RetryIcon /> : <FilmIcon />}
        {generating ? t("export.generating") : failed ? t("export.retry") : t("export.download")}
      </button>
    </div>
  );
}
