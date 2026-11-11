import type { SubtitleFormat } from "../models/video";
import type { HistoryVideoDto, LanguageDto, StatusReportDto, VideoDetailDto, VideoDto } from "./dto";
import { downloadFromApi, getJson, request, sendJson } from "./http";
import { toHistoryVideo, toLanguage, toStatusReport, toVideo, toVideoDetail } from "./mappers";
import { uploadVideoFile } from "./upload";

const post = (path: string) => getJson<unknown>(path, { method: "POST" });

export const videosApi = {
  languages: async () => (await getJson<LanguageDto[]>("/idiomas")).map(toLanguage),
  list: async () => (await getJson<HistoryVideoDto[]>("/videos")).map(toHistoryVideo),
  detail: async (id: string, signal?: AbortSignal) => toVideoDetail(await getJson<VideoDetailDto>(`/videos/${id}`, { signal })),
  status: async (id: string, signal?: AbortSignal) => toStatusReport(await getJson<StatusReportDto>(`/videos/${id}/estado`, { signal })),
  subtitlesVtt: async (id: string, signal?: AbortSignal) => (await request(`/videos/${id}/subtitulos?formato=vtt`, { signal })).text(),

  uploadFile: uploadVideoFile,
  createFromUrl: async (url: string, targetLanguage: string) =>
    toVideo(await sendJson<VideoDto>("/videos", "POST", { url, idioma_destino: targetLanguage })),

  /** Also renames the other translations of the same video. */
  rename: (id: string, name: string) => sendJson<unknown>(`/videos/${id}`, "PATCH", { nombre: name }),
  /** Deletes this translation (answers 204, no body). */
  remove: async (id: string) => {
    await request(`/videos/${id}`, { method: "DELETE" });
  },
  /** Translates the existing subtitles into another language (reuses the transcript). */
  translateTo: async (id: string, targetLanguage: string) => {
    const result = await sendJson<{ id: string; existente: boolean }>(`/videos/${id}/traducir`, "POST", { idioma_destino: targetLanguage });
    return { id: result.id, existing: result.existente };
  },
  retry: async (id: string) => {
    const result = await getJson<{ reencolados: number; video?: boolean }>(`/videos/${id}/reintentar`, { method: "POST" });
    return { requeued: result.reencolados, wholeVideo: Boolean(result.video) };
  },

  // Background tasks: the app polls the detail until they are ready.
  requestExport: (id: string) => post(`/videos/${id}/exportar`),
  requestSummary: (id: string) => post(`/videos/${id}/resumen`),
  requestAudio: (id: string) => post(`/videos/${id}/audio`),

  downloadSubtitles: (id: string, format: SubtitleFormat) =>
    downloadFromApi(`/videos/${id}/subtitulos?formato=${format}&descargar=1`, `subtitulos.${format}`),
  downloadSummary: (id: string) => downloadFromApi(`/videos/${id}/resumen?descargar=1`, "resumen.txt"),
};
