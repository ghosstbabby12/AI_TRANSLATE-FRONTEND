import type { ProfileChanges, Session, User } from "../models/user";
import type {
  HistoryVideo,
  Language,
  SegmentStatus,
  TaskStatus,
  Video,
  VideoDetail,
  VideoStatus,
  VideoStatusReport,
} from "../models/video";
import type {
  HistoryVideoDto,
  LanguageDto,
  SegmentStatusDto,
  SessionDto,
  TaskStatusDto,
  UserDto,
  VideoDetailDto,
  VideoDto,
  VideoStatusDto,
  StatusReportDto,
} from "./dto";

// The server's status values (Spanish) and the app's (English)
const VIDEO_STATUS: Record<VideoStatusDto, VideoStatus> = {
  pendiente: "pending",
  procesando: "processing",
  completo: "completed",
  error: "failed",
};
const SEGMENT_STATUS: Record<SegmentStatusDto, SegmentStatus> = {
  pendiente: "pending",
  procesando: "processing",
  listo: "ready",
  error: "failed",
};
const TASK_STATUS: Record<TaskStatusDto, TaskStatus> = { procesando: "processing", listo: "ready", error: "failed" };
const taskStatus = (s: TaskStatusDto | null) => (s ? TASK_STATUS[s] : null);

export const toLanguage = (d: LanguageDto): Language => ({ code: d.codigo, name: d.nombre });

export const toVideo = (d: VideoDto): Video => ({
  id: d.id,
  name: d.nombre,
  sourceType: d.origen_tipo === "archivo" ? "file" : "url",
  sourceUrl: d.origen_url,
  targetLanguage: d.idioma_destino,
  sourceLanguage: d.idioma_origen,
  status: VIDEO_STATUS[d.estado],
  totalSegments: d.total_segmentos,
  durationSeconds: d.duracion_seg,
  error: d.error,
  createdAt: d.creado_en,
});

export const toHistoryVideo = (d: HistoryVideoDto): HistoryVideo => ({
  ...toVideo(d),
  readySegments: d.segmentos_listos,
  thumbnailUrl: d.url_miniatura,
});

export const toVideoDetail = (d: VideoDetailDto): VideoDetail => ({
  ...toVideo(d),
  playbackUrl: d.url_reproduccion,
  thumbnailUrl: d.url_miniatura,
  translations: (d.traducciones ?? []).map((t) => ({ id: t.id, targetLanguage: t.idioma_destino, status: VIDEO_STATUS[t.estado] })),
  export: { status: taskStatus(d.export_estado), error: d.export_error, url: d.url_exportacion },
  summary: { status: taskStatus(d.resumen_estado), text: d.resumen_texto, error: d.resumen_error, createdAt: d.resumen_en },
  audio: {
    voiceAvailable: d.voz_disponible,
    status: taskStatus(d.audio_estado),
    error: d.audio_error,
    progress: d.audio_progreso,
    url: d.url_audio,
    downloadUrl: d.url_audio_descarga,
  },
});

export const toStatusReport = (d: StatusReportDto): VideoStatusReport => ({
  id: d.id,
  status: VIDEO_STATUS[d.estado],
  error: d.error,
  sourceLanguage: d.idioma_origen,
  targetLanguage: d.idioma_destino,
  progress: {
    total: d.progreso.total,
    ready: d.progreso.listos,
    pending: d.progreso.pendientes,
    processing: d.progreso.procesando,
    failed: d.progreso.errores,
    percent: d.progreso.porcentaje,
  },
  segments: d.segmentos.map((s) => ({
    index: s.indice,
    start: s.tiempo_inicio,
    end: s.tiempo_fin,
    status: SEGMENT_STATUS[s.estado],
    translatedText: s.texto_traducido,
    error: s.error,
  })),
});

export const toUser = (d: UserDto): User => ({
  id: d.id,
  name: d.nombre,
  email: d.email,
  phone: d.telefono,
  interfaceLanguage: d.idioma_interfaz,
  photoUrl: d.url_foto,
  createdAt: d.creado_en,
  updatedAt: d.actualizado_en,
});

export const toSession = (d: SessionDto): Session => ({ token: d.token, user: toUser(d.usuario) });

/** Profile changes in the API's format; only the fields that are set are sent. */
export function toProfileChangesDto(c: ProfileChanges) {
  const dto: Record<string, unknown> = {
    nombre: c.name,
    email: c.email,
    telefono: c.phone,
    idioma_interfaz: c.interfaceLanguage,
    contrasena_actual: c.currentPassword,
  };
  return Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));
}
