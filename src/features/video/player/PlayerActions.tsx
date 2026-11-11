import { DownloadIcon, RetryIcon } from "../../../components/icons";
import { useT } from "../../../i18n";
import type { SubtitleFormat } from "../../../models/video";

const FORMATS: SubtitleFormat[] = ["srt", "vtt", "txt"];

interface Props {
  disabled: boolean;
  /** Show the retry button, and whether it retries the whole video or the failed segments. */
  retry: null | "video" | "segments";
  onDownload: (format: SubtitleFormat) => void;
  onRetry: () => void;
}

/** Buttons of the player's floating bar: subtitle downloads and retry. */
export function PlayerActions({ disabled, retry, onDownload, onRetry }: Props) {
  const t = useT();
  const retryLabel = retry === "video" ? t("video.retryVideo") : t("video.retrySegments");
  return (
    <>
      {FORMATS.map((format) => {
        const label = format === "txt" ? t("video.downloadTxt") : t("video.downloadSubtitles", { format });
        return (
          <button key={format} type="button" className="icon-button with-text" data-tip={label} aria-label={label} disabled={disabled} onClick={() => onDownload(format)}>
            <DownloadIcon />
            <span>{format.toUpperCase()}</span>
          </button>
        );
      })}
      {retry && (
        <button type="button" className="icon-button" data-tip={retryLabel} aria-label={retryLabel} onClick={onRetry}>
          <RetryIcon />
        </button>
      )}
      <span className="divider" aria-hidden />
    </>
  );
}
