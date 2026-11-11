import type { ReactNode } from "react";
import { useT } from "../../i18n";
import { formatTime } from "../../lib/format";
import type { SegmentState } from "../../models/video";

interface Props {
  segments: SegmentState[];
  currentTime: number;
  onSeek: (seconds: number) => void;
  /** Shown above the list (the "other languages" controls). */
  header: ReactNode;
}

/** Side panel with the translated segments; the one playing now is highlighted. */
export function TranscriptPanel({ segments, currentTime, onSeek, header }: Props) {
  const t = useT();
  const ready = segments.filter((s) => s.status === "ready" && s.translatedText);

  return (
    <aside className="card transcript">
      {header}
      <h2>{t("video.liveTranslation")}</h2>
      {ready.length === 0 ? (
        <p className="muted">{t("video.segmentsWillAppear")}</p>
      ) : (
        <ol>
          {ready.map((s) => (
            <li key={s.index} className={currentTime >= s.start && currentTime < s.end ? "is-active" : ""}>
              <button type="button" onClick={() => onSeek(s.start)}>
                <time>{formatTime(s.start)}</time>
                <span>{s.translatedText}</span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
