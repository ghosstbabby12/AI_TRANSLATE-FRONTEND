import { translate } from "../i18n";
import type { Video } from "../models/video";

// Path parts that say nothing about the video (youtube.com/watch?v=…, /embed/…)
const GENERIC_PARTS = new Set(["watch", "embed", "video", "videos", "v", "shorts", "file"]);

/**
 * Repairs names uploaded before a backend fix: UTF-8 text read as Latin-1
 * ("1.58â\u0080¯p.m." instead of "1.58 p.m."). Only touched when it has that
 * shape and the repair gives valid UTF-8.
 */
function repairEncoding(text: string): string {
  if (!/[Â-ô][\u0080-¿]/.test(text)) return text;
  // A character outside Latin-1 means the text is not one byte per character.
  if (/[^\u0000-ÿ]/.test(text)) return text;
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(text, (c) => c.charCodeAt(0)));
  } catch {
    return text;
  }
}

/** Turns the last part of a URL into words: "File:WIKITONGUES-_Gereon_speaking.webm" → "WIKITONGUES: Gereon speaking". */
function wordsFromPath(url: URL): string {
  const last = url.pathname.split("/").filter(Boolean).pop() ?? "";
  let text = last;
  try {
    text = decodeURIComponent(last);
  } catch {
    /* badly encoded part: used as it is */
  }
  return text
    .replace(/^(file|archivo):/i, "") // Wikimedia Commons pages
    .replace(/\.[a-z0-9]{2,4}$/i, "") // extension (.webm, .mp4…)
    .split(/[_\s]+/)
    .join(" ")
    .replace(/(\S)-\s/g, "$1: ")
    .trim();
}

/**
 * Name to show. A video created from a link without its own name has the URL
 * as its name; here it becomes something readable:
 *   https://www.youtube.com/watch?v=abc → "Video de youtube.com"
 */
export function videoTitle(video: Pick<Video, "name" | "sourceUrl">): string {
  if (!video.sourceUrl || video.name !== video.sourceUrl) return repairEncoding(video.name);

  let url: URL;
  try {
    url = new URL(video.sourceUrl);
  } catch {
    return video.name;
  }
  const site = url.hostname.replace(/^www\./, "");
  const text = wordsFromPath(url);
  // An identifier (youtu.be/Szox9wD4HRU, vimeo.com/123456) is not a title
  const isId = !/\s/.test(text) && /\d/.test(text);
  const useful = text.length >= 3 && !isId && !GENERIC_PARTS.has(text.toLowerCase());
  return useful ? text : translate("video.fromSite", { site });
}
