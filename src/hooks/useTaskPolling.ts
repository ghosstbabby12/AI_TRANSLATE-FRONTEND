import { useEffect, useRef } from "react";
import { videosApi } from "../api/videosApi";
import type { VideoDetail } from "../models/video";

/**
 * While `active`, fetches the video detail every `intervalMs` and hands it to
 * `onDetail`. Used by the background tasks (export, summary, audio) to notice
 * when they finish, also after reloading the page.
 */
export function useTaskPolling(videoId: string, active: boolean, intervalMs: number, onDetail: (detail: VideoDetail) => void) {
  const callback = useRef(onDetail);
  callback.current = onDetail;

  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    const timer = setInterval(async () => {
      try {
        callback.current(await videosApi.detail(videoId, controller.signal));
      } catch {
        /* one-off network failure: tried again on the next interval */
      }
    }, intervalMs);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [videoId, active, intervalMs]);
}
