import { useState } from "react";
import { ConfirmDeleteDialog } from "../../components/ConfirmDeleteDialog";
import { VideoIcon } from "../../components/icons";
import { navigate, paths } from "../../hooks/useRoute";
import { useT } from "../../i18n";
import { videoTitle } from "../../lib/videoTitle";
import type { HistoryVideo } from "../../models/video";
import { HistoryCard } from "./HistoryCard";
import { useHistory } from "./useHistory";

export function HistoryPage() {
  const { videos, error, rename, remove, download } = useHistory();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<HistoryVideo | null>(null);
  const t = useT();

  if (error && !videos) return <p className="error centered">{error}</p>;
  if (!videos) return <p className="muted centered">{t("app.loading")}</p>;

  return (
    <section className="history-page">
      <header className="section-title">
        <h1>{t("history.title")}</h1>
        <p className="muted">{videos.length === 1 ? t("history.count.one") : t("history.count.other", { n: videos.length })}</p>
      </header>
      {error && <p className="error">{error}</p>}

      {videos.length === 0 ? (
        <div className="card empty-state">
          <span className="big-icon" aria-hidden>
            <VideoIcon />
          </span>
          <p>{t("history.empty")}</p>
          <button type="button" className="primary" onClick={() => navigate(paths.home)}>
            {t("history.translateFirst")}
          </button>
        </div>
      ) : (
        <ul className="history-grid">
          {videos.map((video) => (
            <HistoryCard
              key={video.id}
              video={video}
              renaming={renamingId === video.id}
              onStartRename={() => setRenamingId(video.id)}
              onRename={async (name) => {
                await rename(video.id, name);
                setRenamingId(null);
              }}
              onCancelRename={() => setRenamingId(null)}
              onDelete={() => setToDelete(video)}
              onDownload={(format) => download(video.id, format)}
            />
          ))}
        </ul>
      )}

      {toDelete && (
        <ConfirmDeleteDialog
          name={videoTitle(toDelete)}
          language={toDelete.targetLanguage}
          onConfirm={async () => {
            await remove(toDelete);
            setToDelete(null);
          }}
          onCancel={() => setToDelete(null)}
        />
      )}
    </section>
  );
}
