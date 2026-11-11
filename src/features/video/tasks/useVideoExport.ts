import { useRef, useState } from "react";
import { videosApi } from "../../../api/videosApi";
import { useTaskPolling } from "../../../hooks/useTaskPolling";
import { translate } from "../../../i18n";
import { downloadFromUrl } from "../../../lib/browser";
import { errorText } from "../../../lib/format";
import type { TaskStatus } from "../../../models/video";

const POLL_MS = 5_000;

/**
 * The MP4 with burned-in subtitles. Creating it means re-encoding, so it runs
 * in the background: requested, polled, and downloaded by itself when ready.
 * If it already exists, it is downloaded right away.
 */
export function useVideoExport(videoId: string, initialStatus: TaskStatus | null) {
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState<string | null>(null);
  // Downloads automatically only if the user asked for it during this visit.
  const downloadWhenReady = useRef(false);

  useTaskPolling(videoId, status === "processing", POLL_MS, ({ export: task }) => {
    if (task.status === "processing") return;
    setStatus(task.status);
    if (task.status === "failed") setError(task.error ?? translate("export.error"));
    if (task.status === "ready" && task.url && downloadWhenReady.current) {
      downloadWhenReady.current = false;
      downloadFromUrl(task.url);
    }
  });

  async function start() {
    setError(null);
    try {
      if (status === "ready") {
        // The signed URL expires: a fresh one is requested at download time.
        const { export: task } = await videosApi.detail(videoId);
        if (task.url) return downloadFromUrl(task.url);
      }
      downloadWhenReady.current = true;
      await videosApi.requestExport(videoId);
      setStatus("processing");
    } catch (e) {
      setError(errorText(e));
    }
  }

  return { status, error, start };
}
