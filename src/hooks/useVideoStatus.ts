import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "../api/http";
import { videosApi } from "../api/videosApi";
import { errorText } from "../lib/format";
import { parseVtt, type Cue } from "../lib/vtt";
import { isBusy, type VideoDetail, type VideoStatusReport } from "../models/video";

const INTERVAL_MS = 2000;
const HIDDEN_INTERVAL_MS = 10_000; // tab in the background: poll less
const MAX_TRIES_WITHOUT_URL = 5;

/**
 * Polls the video status while it is processed. Each time more segments are
 * ready it fetches the VTT again, so new subtitles appear without reloading.
 */
export function useVideoStatus(id: string) {
  const [detail, setDetail] = useState<VideoDetail | null>(null);
  const [report, setReport] = useState<VideoStatusReport | null>(null);
  const [cues, setCues] = useState<Cue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cycle, setCycle] = useState(0); // incrementing it restarts polling
  const seenReady = useRef(-1);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let hasUrl = false;
    let triesWithoutUrl = 0;
    seenReady.current = -1;

    const schedule = () => (timer = setTimeout(tick, document.hidden ? HIDDEN_INTERVAL_MS : INTERVAL_MS));

    async function tick() {
      try {
        const next = await videosApi.status(id, signal);
        setReport(next);
        setError(null);
        if (next.progress.ready !== seenReady.current) {
          seenReady.current = next.progress.ready;
          setCues(parseVtt(await videosApi.subtitlesVtt(id, signal)));
        }
        // A linked video reaches storage only after the worker downloads it, so
        // the detail (with the signed URL) is fetched until the URL exists.
        if (!hasUrl) {
          const nextDetail = await videosApi.detail(id, signal);
          hasUrl = nextDetail.playbackUrl !== null;
          setDetail(nextDetail);
        }
        // Keep polling while there is work or the URL is missing; a finished
        // video without a URL after a few tries will not get one.
        if (isBusy(next.status)) schedule();
        else if (next.status === "completed" && !hasUrl && ++triesWithoutUrl <= MAX_TRIES_WITHOUT_URL) schedule();
      } catch (err) {
        if (signal.aborted) return;
        setError(errorText(err));
        if (err instanceof ApiError && err.status === 404) return;
        schedule(); // a one-off network failure does not stop polling
      }
    }

    tick();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [id, cycle]);

  const restart = useCallback(() => setCycle((c) => c + 1), []);
  return { detail, report, cues, error, restart };
}
