// Cliente de la API del backend. Los tipos reflejan las respuestas de
// backend/src/api/routes/videos.routes.ts.
import { traducir, traducirMensajeServidor, type IdiomaUi } from "./i18n";

const BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

export type EstadoVideo = "pendiente" | "procesando" | "completo" | "error";
export type EstadoSegmento = "pendiente" | "procesando" | "listo" | "error";
export type FormatoSubtitulos = "srt" | "vtt" | "txt";
export type EstadoExportacion = "procesando" | "listo" | "error";

export interface Idioma {
  codigo: string;
  nombre: string;
}

export interface Video {
  id: string;
  nombre: string;
  origen_tipo: "archivo" | "url";
  origen_url: string | null;
  idioma_destino: string;
  idioma_origen: string | null;
  estado: EstadoVideo;
  total_segmentos: number | null;
  duracion_seg: number | null;
  error: string | null;
  creado_en: string;
}

export interface VideoHistorial extends Video {
  segmentos_listos: number;
  /** Fotograma del video (URL temporal); null si aún no se generó. */
  url_miniatura: string | null;
}

export interface TraduccionResumen {
  id: string;
  idioma_destino: string;
  estado: EstadoVideo;
}

export interface VideoDetalle extends Video {
  url_reproduccion: string | null;
  url_miniatura: string | null;
  /** Todas las traducciones del mismo archivo (incluida esta). */
  traducciones: TraduccionResumen[];
  /** Video con subtítulos incrustados (se genera bajo demanda). */
  export_estado: EstadoExportacion | null;
  export_error: string | null;
  url_exportacion: string | null;
  /** Resumen con IA (se genera bajo demanda, en el idioma de la traducción). */
  resumen_estado: EstadoExportacion | null;
  /** Formato: "## Título" para secciones y "- " para viñetas. */
  resumen_texto: string | null;
  resumen_error: string | null;
  resumen_en: string | null;
  /** Audio de la traducción con voz sintética (se genera bajo demanda). */
  voz_disponible: boolean;
  audio_estado: EstadoExportacion | null;
  audio_error: string | null;
  /** Avance (0-100) mientras se genera el audio. */
  audio_progreso: number | null;
  /** Para escucharlo (URL temporal). */
  url_audio: string | null;
  /** La misma, pero el navegador la descarga con nombre propio. */
  url_audio_descarga: string | null;
}

export interface SegmentoEstado {
  indice: number;
  tiempo_inicio: number;
  tiempo_fin: number;
  estado: EstadoSegmento;
  texto_traducido: string | null;
  error: string | null;
}

export interface EstadoRespuesta {
  id: string;
  estado: EstadoVideo;
  error: string | null;
  idioma_origen: string | null;
  idioma_destino: string;
  progreso: {
    total: number;
    listos: number;
    pendientes: number;
    procesando: number;
    errores: number;
    porcentaje: number;
  };
  segmentos: SegmentoEstado[];
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  idioma_interfaz: IdiomaUi;
  /** Foto de perfil (URL temporal firmada); null si no tiene. */
  url_foto: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface CambiosPerfil {
  nombre?: string;
  email?: string;
  telefono?: string | null;
  idioma_interfaz?: IdiomaUi;
  /** Obligatoria solo si cambia el email. */
  contrasena_actual?: string;
}

export interface Sesion {
  token: string;
  usuario: Usuario;
}

// Token de la sesión actual; lo administra auth.tsx.
let token: string | null = null;
let alExpirar: () => void = () => {};

export function configurarSesion(nuevo: string | null, onExpira?: () => void) {
  token = nuevo;
  if (onExpira) alExpirar = onExpira;
}

const cabeceraAuth = (): Record<string, string> => (token ? { Authorization: `Bearer ${token}` } : {});

/**
 * Id anónimo que usaba la app antes del login. Se envía una vez al iniciar
 * sesión para que los videos subidos sin cuenta pasen a la cuenta.
 */
const CLAVE_ANONIMO = "traductor.usuarioId";
function usuarioAnonimo(): string | undefined {
  try {
    return localStorage.getItem(CLAVE_ANONIMO) ?? undefined;
  } catch {
    return undefined;
  }
}
function olvidarAnonimo() {
  try {
    localStorage.removeItem(CLAVE_ANONIMO);
  } catch {
    /* sin almacenamiento */
  }
}

export class ErrorApi extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

// El plan gratuito de Render duerme la API tras 15 min sin uso y tarda ~50 s
// en despertar: el límite lo cubre, pero ninguna petición espera para siempre.
const TIEMPO_LIMITE_MS = 75_000;
const mensajeSinRespuesta = () => traducir("conexion.sinRespuesta");
const mensajeSinConexion = () => traducir("conexion.sinRed");

/**
 * Mensaje de error legible a partir del cuerpo de la respuesta. Si es un error
 * de validación, se muestra el primer detalle (p. ej. "Teléfono inválido…").
 */
function mensajeDeError(cuerpo: unknown, status: number): string {
  const c = cuerpo as { error?: string; detalles?: Record<string, string[] | undefined> } | null;
  const detalle = c?.detalles ? Object.values(c.detalles).flat().find(Boolean) : undefined;
  const mensaje = detalle ?? c?.error;
  return mensaje ? traducirMensajeServidor(mensaje) : `Error ${status}`;
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Combina la cancelación de quien llama (si hay) con el tiempo límite. */
function senalConLimite(externa?: AbortSignal | null): AbortSignal {
  const limite = AbortSignal.timeout(TIEMPO_LIMITE_MS);
  if (!externa) return limite;
  return "any" in AbortSignal ? AbortSignal.any([externa, limite]) : externa;
}

async function pedir(ruta: string, init: RequestInit = {}): Promise<Response> {
  // Las consultas (GET) se reintentan solas ante fallos transitorios de red o
  // del proxy de Render; las escrituras no, para no repetir una acción.
  const reintentable = (init.method ?? "GET").toUpperCase() === "GET";

  for (let intento = 0; ; intento++) {
    let res: Response;
    try {
      res = await fetch(`${BASE}${ruta}`, {
        ...init,
        headers: { ...cabeceraAuth(), ...init.headers },
        signal: senalConLimite(init.signal),
      });
    } catch (err) {
      if (init.signal?.aborted) throw err; // lo canceló quien llamó (p. ej. al cambiar de vista)
      const porTiempo = err instanceof DOMException && err.name === "TimeoutError";
      if (!porTiempo && reintentable && intento < 2) {
        await esperar(2_000 * (intento + 1));
        continue;
      }
      throw new ErrorApi(porTiempo ? mensajeSinRespuesta() : mensajeSinConexion(), 0);
    }

    if (reintentable && intento < 2 && [502, 503, 504].includes(res.status)) {
      await esperar(2_000 * (intento + 1));
      continue;
    }
    // Token vencido o inválido: se cierra la sesión (salvo en el propio login)
    if (res.status === 401 && token) alExpirar();
    if (!res.ok) {
      const cuerpo = await res.json().catch(() => null);
      throw new ErrorApi(mensajeDeError(cuerpo, res.status), res.status);
    }
    return res;
  }
}

const json = async <T,>(ruta: string, init?: RequestInit) => (await pedir(ruta, init)).json() as Promise<T>;

async function acceder(ruta: string, datos: Record<string, string>): Promise<Sesion> {
  const sesion = await json<Sesion>(ruta, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...datos, usuario_anonimo: usuarioAnonimo() }),
  });
  olvidarAnonimo();
  return sesion;
}

export const api = {
  login: (email: string, password: string) => acceder("/auth/login", { email, password }),
  registro: (nombre: string, email: string, password: string) =>
    acceder("/auth/registro", { nombre, email, password }),
  yo: () => json<Usuario>("/auth/yo"),

  // Perfil
  perfil: () => json<Usuario>("/perfil"),
  actualizarPerfil: (cambios: CambiosPerfil) =>
    json<Usuario>("/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cambios),
    }),
  /** Responde 204 (sin cuerpo). */
  cambiarContrasena: async (actual: string, nueva: string) => {
    await pedir("/perfil/contrasena", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actual, nueva }),
    });
  },
  subirFoto: (foto: File) => {
    const form = new FormData();
    form.append("foto", foto);
    return json<Usuario>("/perfil/foto", { method: "POST", body: form });
  },
  quitarFoto: () => json<Usuario>("/perfil/foto", { method: "DELETE" }),

  idiomas: () => json<Idioma[]>("/idiomas"),
  listarVideos: () => json<VideoHistorial[]>("/videos"),
  obtenerVideo: (id: string, signal?: AbortSignal) => json<VideoDetalle>(`/videos/${id}`, { signal }),
  estado: (id: string, signal?: AbortSignal) => json<EstadoRespuesta>(`/videos/${id}/estado`, { signal }),
  subtitulosVtt: async (id: string, signal?: AbortSignal) =>
    (await pedir(`/videos/${id}/subtitulos?formato=vtt`, { signal })).text(),
  /** Cambia el nombre (se aplica también a las demás traducciones del mismo video). */
  renombrarVideo: (id: string, nombre: string) =>
    json<{ nombre: string; actualizados: number }>(`/videos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    }),
  /** Elimina esta traducción del video (responde 204, sin cuerpo). */
  eliminarVideo: async (id: string) => {
    await pedir(`/videos/${id}`, { method: "DELETE" });
  },
  /** Traduce los subtítulos ya generados a otro idioma (reutiliza la transcripción). */
  traducirA: (id: string, idiomaDestino: string) =>
    json<{ id: string; existente: boolean }>(`/videos/${id}/traducir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idioma_destino: idiomaDestino }),
    }),
  /** Pide generar el video con subtítulos incrustados (trabajo en segundo plano). */
  exportarVideo: (id: string) => json<{ export_estado: EstadoExportacion }>(`/videos/${id}/exportar`, { method: "POST" }),
  /** Pide generar el audio de la traducción (trabajo en segundo plano). */
  generarAudio: (id: string) => json<{ audio_estado: EstadoExportacion }>(`/videos/${id}/audio`, { method: "POST" }),
  /** Pide generar (o regenerar) el resumen con IA (trabajo en segundo plano). */
  generarResumen: (id: string) =>
    json<{ resumen_estado: EstadoExportacion }>(`/videos/${id}/resumen`, { method: "POST" }),
  descargarResumen: (id: string) => descargar(`/videos/${id}/resumen?descargar=1`, "resumen.txt"),
  reintentar: (id: string) => json<{ reencolados: number; video?: boolean }>(`/videos/${id}/reintentar`, { method: "POST" }),

  crearDesdeUrl: (url: string, idiomaDestino: string) =>
    json<Video>("/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, idioma_destino: idiomaDestino }),
    }),

  /**
   * Subida con XMLHttpRequest porque fetch no informa el progreso del envío,
   * y un video de cientos de MB sin barra parece colgado.
   */
  subirArchivo: (archivo: File, idiomaDestino: string, onProgreso: (fraccion: number) => void) =>
    new Promise<Video>((resolve, reject) => {
      const form = new FormData();
      form.append("idioma_destino", idiomaDestino);
      form.append("video", archivo);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${BASE}/videos`);
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.upload.onprogress = (e) => e.lengthComputable && onProgreso(e.loaded / e.total);
      xhr.onload = () => {
        let cuerpo: unknown = null;
        try {
          cuerpo = JSON.parse(xhr.responseText);
        } catch {
          /* respuesta no JSON */
        }
        if (xhr.status === 401 && token) alExpirar();
        if (xhr.status >= 200 && xhr.status < 300) resolve(cuerpo as Video);
        else reject(new ErrorApi(mensajeDeError(cuerpo, xhr.status), xhr.status));
      };
      xhr.onerror = () => reject(new ErrorApi(mensajeSinConexion(), 0));
      xhr.send(form);
    }),

  /** La descarga lleva la cabecera de usuario, así que no sirve un <a href> directo. */
  descargarSubtitulos: (id: string, formato: FormatoSubtitulos) =>
    descargar(`/videos/${id}/subtitulos?formato=${formato}&descargar=1`, `subtitulos.${formato}`),
};

/** Descarga un archivo de la API con el nombre que indica el servidor. */
async function descargar(ruta: string, nombrePorDefecto: string) {
  const res = await pedir(ruta);
  const nombre = /filename="?([^";]+)"?/.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? nombrePorDefecto;
  const url = URL.createObjectURL(await res.blob());
  const a = Object.assign(document.createElement("a"), { href: url, download: nombre });
  a.click();
  URL.revokeObjectURL(url);
}
