/** One subtitle line on screen. */
export interface Cue {
  start: number;
  end: number;
  text: string;
}

const TIMING = /(\d+):(\d{2}):(\d{2})\.(\d{3})\s+-->\s+(\d+):(\d{2}):(\d{2})\.(\d{3})/;

const toSeconds = (h: string, m: string, s: string, ms: string) => +h * 3600 + +m * 60 + +s + +ms / 1000;

/**
 * Minimal parser for the WebVTT the backend produces. The VTT is used (rather
 * than each segment's raw text) because the backend already splits it into short lines.
 */
export function parseVtt(vtt: string): Cue[] {
  const cues: Cue[] = [];
  for (const block of vtt.replace(/\r/g, "").split(/\n{2,}/)) {
    const lines = block.split("\n");
    const i = lines.findIndex((line) => TIMING.test(line));
    if (i === -1) continue;
    const m = TIMING.exec(lines[i])!;
    cues.push({
      start: toSeconds(m[1], m[2], m[3], m[4]),
      end: toSeconds(m[5], m[6], m[7], m[8]),
      text: lines.slice(i + 1).join("\n").trim(),
    });
  }
  return cues;
}

/** Binary search: cues are sorted and never overlap. */
export function cueAt(cues: Cue[], time: number): Cue | null {
  let low = 0;
  let high = cues.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (time < cues[mid].start) high = mid - 1;
    else if (time >= cues[mid].end) low = mid + 1;
    else return cues[mid];
  }
  return null;
}
