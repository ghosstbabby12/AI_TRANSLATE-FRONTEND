import { useRef, useState } from "react";
import { videosApi } from "../../api/videosApi";
import { navigate, paths } from "../../hooks/useRoute";
import { useVideoStatus } from "../../hooks/useVideoStatus";
import { translate } from "../../i18n";
import { errorText } from "../../lib/format";
import { videoTitle } from "../../lib/videoTitle";
import { isFinished, type SubtitleFormat } from "../../models/video";

/** Everything the video page does: status polling, player position and the user's actions. */
export function useVideoPage(id: string) {
  const status = useVideoStatus(id);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [time, setTime] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  // Name changed during this visit (the detail is not fetched again once finished)
  const [renamed, setRenamed] = useState<string | null>(null);
  const { detail, report } = status;

  const seek = (seconds: number) => {
    if (videoRef.current) videoRef.current.currentTime = seconds;
  };

  /** Seeks and scrolls the player into view (used from the summary). */
  const seekAndShow = (seconds: number) => {
    seek(seconds);
    videoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  async function downloadSubtitles(format: SubtitleFormat) {
    setNotice(null);
    try {
      await videosApi.downloadSubtitles(id, format);
    } catch (e) {
      setNotice(errorText(e));
    }
  }

  async function retry() {
    try {
      const { wholeVideo, requeued } = await videosApi.retry(id);
      setNotice(
        wholeVideo
          ? translate("video.requeued")
          : requeued === 1
            ? translate("video.segmentsRequeued.one")
            : translate("video.segmentsRequeued.other", { n: requeued }),
      );
    } catch (e) {
      setNotice(errorText(e));
    }
    status.restart();
  }

  async function rename(name: string) {
    await videosApi.rename(id, name);
    setRenamed(name);
  }

  async function remove() {
    await videosApi.remove(id);
    navigate(paths.history);
  }

  const progress = report?.progress;
  const noSubtitles = progress?.ready === 0;
  const canRetry =
    !!report && ((report.status === "failed" && progress!.total === 0) || (progress!.failed > 0 && report.status !== "processing"));

  return {
    ...status,
    videoRef,
    time,
    setTime,
    notice,
    title: renamed ?? (detail ? videoTitle(detail) : ""),
    finished: report ? isFinished(report.status) : false,
    noSubtitles,
    canRetry,
    seek,
    seekAndShow,
    downloadSubtitles,
    retry,
    rename,
    remove,
  };
}

export type VideoPageState = ReturnType<typeof useVideoPage>;
