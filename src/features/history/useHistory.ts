import { useEffect, useState } from "react";
import { videosApi } from "../../api/videosApi";
import { errorText } from "../../lib/format";
import { isBusy, type HistoryVideo, type SubtitleFormat } from "../../models/video";

const REFRESH_MS = 5000;

/** The user's videos. Refreshes by itself only while some video is still being processed. */
export function useHistory() {
  const [videos, setVideos] = useState<HistoryVideo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let alive = true;
    async function load() {
      try {
        const list = await videosApi.list();
        if (!alive) return;
        setVideos(list);
        setError(null);
        if (list.some((v) => isBusy(v.status))) timer = setTimeout(load, REFRESH_MS);
      } catch (e) {
        if (alive) setError(errorText(e));
      }
    }
    load();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, []);

  /** The name also changes in the other translations of the same video, so the list is reloaded. */
  async function rename(id: string, name: string) {
    await videosApi.rename(id, name);
    setVideos(await videosApi.list());
  }

  async function remove(video: HistoryVideo) {
    await videosApi.remove(video.id);
    setVideos((list) => list?.filter((v) => v.id !== video.id) ?? null);
  }

  const download = (id: string, format: SubtitleFormat) => videosApi.downloadSubtitles(id, format).catch((e) => setError(errorText(e)));

  return { videos, error, rename, remove, download };
}
