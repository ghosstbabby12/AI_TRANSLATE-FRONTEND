import { useRef, useState, type RefObject } from "react";
import { videosApi } from "../../../api/videosApi";
import { useTaskPolling } from "../../../hooks/useTaskPolling";
import { downloadFromUrl } from "../../../lib/browser";
import { errorText } from "../../../lib/format";
import type { VideoDetail } from "../../../models/video";
import { useAudioDub } from "./useAudioDub";

const POLL_MS = 4_000;
// Server error when the process was cut several times (out of memory): retrying will not help
const INTERRUPTED_ERROR = "El servidor se quedó sin memoria o se reinició mientras generaba el audio.";

/** The translation narrated by a synthetic voice: generate, follow progress, listen, download and dub. */
export function useTranslationAudio(video: VideoDetail, videoRef: RefObject<HTMLVideoElement | null>) {
  const [status, setStatus] = useState(video.audio.status);
  const [urls, setUrls] = useState({ listen: video.audio.url, download: video.audio.downloadUrl });
  const [progress, setProgress] = useState(video.audio.progress ?? 0);
  const [serverError, setServerError] = useState(video.audio.error);
  const [error, setError] = useState<string | null>(null);
  const [dubbing, setDubbing] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  useAudioDub(dubbing && status === "ready", videoRef, audioRef);

  useTaskPolling(video.id, status === "processing", POLL_MS, ({ audio }) => {
    setProgress(audio.progress ?? 0);
    if (audio.status === "processing") return;
    setServerError(audio.error);
    setStatus(audio.status);
    setUrls({ listen: audio.url, download: audio.downloadUrl });
  });

  async function generate() {
    setError(null);
    try {
      await videosApi.requestAudio(video.id);
      setProgress(0);
      setStatus("processing");
    } catch (e) {
      setError(errorText(e));
    }
  }

  // The signed URL expires (1 h): if the page stayed open, a new one is requested.
  async function download() {
    setError(null);
    try {
      const { audio } = await videosApi.detail(video.id);
      const url = audio.downloadUrl ?? urls.download;
      if (url) downloadFromUrl(url);
    } catch (e) {
      setError(errorText(e));
    }
  }

  return {
    status,
    progress,
    listenUrl: status === "ready" ? urls.listen : null,
    outOfMemory: Boolean(serverError?.startsWith(INTERRUPTED_ERROR)),
    error,
    dubbing,
    setDubbing,
    audioRef,
    generate,
    download,
  };
}
