import { translateServerMessage, useT } from "../../i18n";
import { OtherLanguages } from "./languages/OtherLanguages";
import { PlayerActions } from "./player/PlayerActions";
import { SubtitledPlayer } from "./player/SubtitledPlayer";
import { ProgressPanel } from "./ProgressPanel";
import { AudioCard } from "./tasks/AudioCard";
import { ExportCard } from "./tasks/ExportCard";
import { SummaryCard } from "./tasks/SummaryCard";
import { TranscriptPanel } from "./TranscriptPanel";
import { useVideoPage } from "./useVideoPage";
import { VideoHeader } from "./VideoHeader";

/** Page of one translated video: player, extras (export, audio, summary), progress and transcript. */
export function VideoPage({ id }: { id: string }) {
  const page = useVideoPage(id);
  const { detail, report } = page;
  const t = useT();

  if (!report || !detail) return <p className="muted centered">{page.error ?? t("app.loading")}</p>;

  const tasksAvailable = page.finished && !page.noSubtitles;

  return (
    <section className="video-page">
      <VideoHeader title={page.title} report={report} sourceUrl={detail.sourceUrl} onRename={page.rename} onDelete={page.remove} />

      {report.status === "failed" && report.error && <p className="error">{translateServerMessage(report.error)}</p>}
      {page.error && <p className="warning">{t("connection.retryingNotice", { error: page.error })}</p>}

      <div className="video-body">
        <div className="main-column">
          <SubtitledPlayer
            url={detail.playbackUrl}
            poster={detail.thumbnailUrl}
            cues={page.cues}
            segments={report.segments}
            videoRef={page.videoRef}
            onTime={page.setTime}
            finished={page.finished}
            actions={
              <PlayerActions
                disabled={page.noSubtitles}
                retry={page.canRetry ? (report.progress.total === 0 ? "video" : "segments") : null}
                onDownload={page.downloadSubtitles}
                onRetry={page.retry}
              />
            }
          />
          {detail.playbackUrl && (
            <div className="card export-card">
              <ExportCard videoId={id} initialStatus={detail.export.status} disabled={page.noSubtitles} />
            </div>
          )}
          <div className="card task-card">
            <AudioCard video={detail} available={tasksAvailable} videoRef={page.videoRef} />
          </div>
          <div className="card task-card">
            <SummaryCard video={detail} available={tasksAvailable} onSeek={page.seekAndShow} />
          </div>
          <div className="card progress-card">
            <ProgressPanel report={report} currentTime={page.time} onSeek={page.seek} />
          </div>
          {page.notice && <p className="muted">{page.notice}</p>}
        </div>

        <TranscriptPanel
          segments={report.segments}
          currentTime={page.time}
          onSeek={page.seek}
          header={
            <OtherLanguages videoId={id} currentLanguage={report.targetLanguage} translations={detail.translations} available={report.progress.total > 0} />
          }
        />
      </div>
    </section>
  );
}
