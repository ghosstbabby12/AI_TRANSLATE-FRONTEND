import { STATUS_LABEL } from "../../components/StatusBadge";
import { useT } from "../../i18n";
import { formatTime } from "../../lib/format";
import type { VideoStatusReport } from "../../models/video";

interface Props {
  report: VideoStatusReport;
  currentTime: number;
  onSeek: (seconds: number) => void;
}

/**
 * "N of M segments" bar plus a strip with one block per segment colored by
 * its status, to see at a glance which parts are ready. Clicking a block
 * moves the player there.
 */
export function ProgressPanel({ report, currentTime, onSeek }: Props) {
  const { progress, segments } = report;
  const duration = segments.at(-1)?.end ?? 0;
  const preparing = progress.total === 0;
  const failed = report.status === "failed";
  const t = useT();

  return (
    <div className="progress">
      <div className="progress-header">
        <span>
          {preparing
            ? failed
              ? t("progress.notPrepared")
              : t("progress.splitting")
            : t("progress.ready", { ready: progress.ready, total: progress.total })}
        </span>
        {!preparing && <strong>{progress.percent}%</strong>}
      </div>

      <div
        className={`progress-bar ${preparing && !failed ? "indeterminate" : ""}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.percent}
      >
        <div className="progress-fill" style={{ width: `${progress.percent}%` }} />
      </div>

      {segments.length > 0 && (
        <div className="segment-strip" aria-label={t("progress.segmentStatus")}>
          {segments.map((s) => {
            const active = currentTime >= s.start && currentTime < s.end;
            return (
              <button
                key={s.index}
                type="button"
                className={`segment-block seg-${s.status} ${active ? "is-active" : ""}`}
                style={{ flexGrow: s.end - s.start }}
                title={`${formatTime(s.start)}–${formatTime(s.end)} · ${t(STATUS_LABEL[s.status])}${s.error ? `: ${s.error}` : ""}`}
                onClick={() => onSeek(s.start)}
              />
            );
          })}
        </div>
      )}

      {progress.failed > 0 && (
        <p className="warning">{progress.failed === 1 ? t("progress.failed.one") : t("progress.failed.other", { n: progress.failed })}</p>
      )}
      {duration > 0 && <p className="muted">{t("progress.duration", { duration: formatTime(duration) })}</p>}
    </div>
  );
}
