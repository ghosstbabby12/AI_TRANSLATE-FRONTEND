import type { Video } from "./api";

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
export function tituloVideo(video: Pick<Video, "nombre" | "origen_url">): string {
  if (!video.origen_url || video.nombre !== video.origen_url) return video.nombre;

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
  return texto.length >= 3 && !esId && !GENERICOS.has(texto.toLowerCase()) ? texto : `Video de ${sitio}`;
}
