import { DownloadIcon, EditIcon, ExternalIcon, PlayIcon, TrashIcon, VideoIcon } from "../../components/icons";
import { RenameForm } from "../../components/RenameForm";
import { StatusBadge } from "../../components/StatusBadge";
import { navigate, paths } from "../../hooks/useRoute";
import { formatDate, useT } from "../../i18n";
import { formatTime } from "../../lib/format";
import { videoTitle } from "../../lib/videoTitle";
import type { HistoryVideo, SubtitleFormat } from "../../models/video";

interface Props {
  video: HistoryVideo;
  renaming: boolean;
  onStartRename: () => void;
  onRename: (name: string) => Promise<void>;
  onCancelRename: () => void;
  onDelete: () => void;
  onDownload: (format: SubtitleFormat) => void;
}

const QUICK_FORMATS = ["srt", "vtt"] as const;

/** One video in the history: thumbnail, name, progress and quick actions. */
export function HistoryCard({ video, renaming, onStartRename, onRename, onCancelRename, onDelete, onDownload }: Props) {
  const t = useT();
  const title = videoTitle(video);
  const total = video.totalSegments ?? 0;
  const percent = total ? Math.round((video.readySegments / total) * 100) : 0;
  const open = () => navigate(paths.video(video.id));

  return (
    <li className="card video-card">
      <button type="button" className="video-card-body" onClick={open}>
        <span className="thumbnail" aria-hidden>
          <VideoIcon />
          {video.thumbnailUrl && (
            // If the URL expired or fails, the background gradient remains
            <img src={video.thumbnailUrl} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.display = "none")} />
          )}
          <span className="thumbnail-play">
            <PlayIcon />
          </span>
          <span className="chip chip-accent">{video.targetLanguage.toUpperCase()}</span>
          {video.durationSeconds != null && <span className="thumbnail-duration">{formatTime(video.durationSeconds)}</span>}
        </span>
        <strong title={title}>{title}</strong>
        <span className="muted">
          {formatDate(video.createdAt)}
          {total > 0 && ` · ${t("history.segments", { ready: video.readySegments, total })}`}
        </span>
        {video.status === "processing" && total > 0 && (
          <div className="progress-bar thin">
            <div className="progress-fill" style={{ width: `${percent}%` }} />
          </div>
        )}
      </button>

      <div className="video-card-footer">
        {renaming ? (
          <RenameForm currentName={title} onSave={onRename} onCancel={onCancelRename} />
        ) : (
          <>
            <StatusBadge status={video.status} />
            <span className="spacer" />
            <button type="button" className="icon-button" data-tip={t("video.rename")} aria-label={t("history.renameAria", { name: title })} onClick={onStartRename}>
              <EditIcon />
            </button>
            <button
              type="button"
              className="icon-button danger-icon"
              data-tip={t("delete.confirm")}
              aria-label={t("history.deleteAria", { name: title })}
              onClick={onDelete}
            >
              <TrashIcon />
            </button>
          </>
        )}
      </div>

      {/* Floating actions over the thumbnail */}
      <div className="floating-bar compact">
        {QUICK_FORMATS.map((format) => (
          <button
            key={format}
            type="button"
            className="icon-button with-text"
            data-tip={t("history.downloadFormat", { format })}
            aria-label={t("history.downloadAria", { format, name: title })}
            disabled={video.readySegments === 0}
            onClick={() => onDownload(format)}
          >
            <DownloadIcon />
            <span>{format.toUpperCase()}</span>
          </button>
        ))}
        <button type="button" className="icon-button" data-tip={t("history.open")} aria-label={t("history.openAria", { name: title })} onClick={open}>
          <ExternalIcon />
        </button>
      </div>
    </li>
  );
}
