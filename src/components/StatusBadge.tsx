import { useT, type TranslationKey } from "../i18n";
import type { SegmentStatus, VideoStatus } from "../models/video";

/** Text key of each status (video or segment). */
export const STATUS_LABEL: Record<VideoStatus | SegmentStatus, TranslationKey> = {
  pending: "status.pending",
  processing: "status.processing",
  completed: "status.completed",
  ready: "status.ready",
  failed: "status.failed",
};

export function StatusBadge({ status }: { status: VideoStatus }) {
  const t = useT();
  return (
    <span className={`badge badge-${status}`}>
      {status === "processing" && <span className="live-dot" aria-hidden />}
      {t(STATUS_LABEL[status])}
    </span>
  );
}
