// Shapes of the server's JSON answers. Field names and values are the public
// API's (in Spanish); mappers.ts turns them into the app's models.

type VideoStatusDto = "pendiente" | "procesando" | "completo" | "error";
type SegmentStatusDto = "pendiente" | "procesando" | "listo" | "error";
type TaskStatusDto = "procesando" | "listo" | "error";

export interface LanguageDto {
  codigo: string;
  nombre: string;
}

export interface VideoDto {
  id: string;
  nombre: string;
  origen_tipo: "archivo" | "url";
  origen_url: string | null;
  idioma_destino: string;
  idioma_origen: string | null;
  estado: VideoStatusDto;
  total_segmentos: number | null;
  duracion_seg: number | null;
  error: string | null;
  creado_en: string;
}

export interface HistoryVideoDto extends VideoDto {
  segmentos_listos: number;
  url_miniatura: string | null;
}

export interface VideoDetailDto extends VideoDto {
  url_reproduccion: string | null;
  url_miniatura: string | null;
  traducciones: { id: string; idioma_destino: string; estado: VideoStatusDto }[];
  export_estado: TaskStatusDto | null;
  export_error: string | null;
  url_exportacion: string | null;
  resumen_estado: TaskStatusDto | null;
  resumen_texto: string | null;
  resumen_error: string | null;
  resumen_en: string | null;
  voz_disponible: boolean;
  audio_estado: TaskStatusDto | null;
  audio_error: string | null;
  audio_progreso: number | null;
  url_audio: string | null;
  url_audio_descarga: string | null;
}

export interface StatusReportDto {
  id: string;
  estado: VideoStatusDto;
  error: string | null;
  idioma_origen: string | null;
  idioma_destino: string;
  progreso: { total: number; listos: number; pendientes: number; procesando: number; errores: number; porcentaje: number };
  segmentos: {
    indice: number;
    tiempo_inicio: number;
    tiempo_fin: number;
    estado: SegmentStatusDto;
    texto_traducido: string | null;
    error: string | null;
  }[];
}

export interface UserDto {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  idioma_interfaz: "es" | "en";
  url_foto: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface SessionDto {
  token: string;
  usuario: UserDto;
}

export type { SegmentStatusDto, TaskStatusDto, VideoStatusDto };
