import type { Video } from "./api";
import { traducir } from "./i18n";

// Segmentos de ruta que no dicen nada del video (youtube.com/watch?v=…, /embed/…)
const GENERICOS = new Set(["watch", "embed", "video", "videos", "v", "shorts", "file"]);

/**
 * Nombre para mostrar. Si el video vino de un link y no tiene nombre propio,
 * el backend guarda la URL como nombre: aquí se convierte en algo legible.
 *   https://commons.wikimedia.org/wiki/File:WIKITONGUES-_Gereon_speaking_German.webm
 *     → "WIKITONGUES: Gereon speaking German"
 *   https://www.youtube.com/watch?v=abc → "Video de youtube.com"
 *   https://youtu.be/Szox9wD4HRU       → "Video de youtu.be"
 */
/**
 * Repara nombres subidos antes de corregir el backend: el texto UTF-8 se leyó
 * como Latin-1 ("1.58â\u0080¯p.m." en vez de "1.58 p.m."). Solo se toca si
 * tiene esa forma y la reparación da UTF-8 válido.
 */
function repararCodificacion(texto: string): string {
  if (!/[\u00C2-\u00F4][\u0080-\u00BF]/.test(texto)) return texto;
  // Un carácter fuera de Latin-1 significa que el texto no es un byte por carácter.
  if (/[^\u0000-\u00FF]/.test(texto)) return texto;
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(texto, (c) => c.charCodeAt(0)));
  } catch {
    return texto;
  }
}

export function tituloVideo(video: Pick<Video, "nombre" | "origen_url">): string {
  if (!video.origen_url || video.nombre !== video.origen_url) return repararCodificacion(video.nombre);

  let url: URL;
  try {
    url = new URL(video.origen_url);
  } catch {
    return video.nombre;
  }
  const sitio = url.hostname.replace(/^www\./, "");
  const ultimo = url.pathname.split("/").filter(Boolean).pop() ?? "";

  let texto = ultimo;
  try {
    texto = decodeURIComponent(ultimo);
  } catch {
    /* segmento mal codificado: se usa tal cual */
  }
  texto = texto
    .replace(/^(file|archivo):/i, "") // páginas de Wikimedia Commons
    .replace(/\.[a-z0-9]{2,4}$/i, "") // extensión (.webm, .mp4…)
    .split(/[_\s]+/)
    .join(" ")
    .replace(/(\S)-\s/g, "$1: ") // "WIKITONGUES- Gereon" → "WIKITONGUES: Gereon"
    .trim();

  // Un identificador (youtu.be/Szox9wD4HRU, vimeo.com/123456) no es un título
  const esId = !/\s/.test(texto) && /\d/.test(texto);
  return texto.length >= 3 && !esId && !GENERICOS.has(texto.toLowerCase()) ? texto : traducir("video.deSitio", { sitio });
}
