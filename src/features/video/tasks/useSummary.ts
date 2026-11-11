import { useState } from "react";
import { videosApi } from "../../../api/videosApi";
import { useTaskPolling } from "../../../hooks/useTaskPolling";
import { useClipboard } from "../../../hooks/useUiHelpers";
import { errorText } from "../../../lib/format";
import { summaryAsPlainText } from "../../../lib/summaryFormat";
import type { VideoDetail } from "../../../models/video";

const POLL_MS = 4_000;

/** AI summary of the transcript: generate (or regenerate), copy and download. */
export function useSummary(video: VideoDetail) {
  const [status, setStatus] = useState(video.summary.status);
  const [text, setText] = useState(video.summary.text);
  const [createdAt, setCreatedAt] = useState(video.summary.createdAt);
  const [error, setError] = useState<string | null>(null);
  const clipboard = useClipboard();

  useTaskPolling(video.id, status === "processing", POLL_MS, ({ summary }) => {
    if (summary.status === "processing") return;
    setStatus(summary.status);
    setText(summary.text);
    setCreatedAt(summary.createdAt);
  });

  const attempt = async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(errorText(e));
    }
  };

  return {
    status,
    text,
    createdAt,
    error,
    copied: clipboard.copied,
    generate: () =>
      attempt(async () => {
        await videosApi.requestSummary(video.id);
        setStatus("processing");
      }),
    download: () => attempt(() => videosApi.downloadSummary(video.id)),
    copy: () => text && clipboard.copy(summaryAsPlainText(text)),
  };
}
