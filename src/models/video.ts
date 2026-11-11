/** The app's own data types, in English. The API layer converts the server's JSON into them. */
export type VideoStatus = "pending" | "processing" | "completed" | "failed";
export type SegmentStatus = "pending" | "processing" | "ready" | "failed";
/** State of an on-demand task (subtitled video, summary, audio). */
export type TaskStatus = "processing" | "ready" | "failed";
export type SubtitleFormat = "srt" | "vtt" | "txt";

export interface Language {
  code: string;
  name: string;
}

export interface Video {
  id: string;
  name: string;
  sourceType: "file" | "url";
  sourceUrl: string | null;
  targetLanguage: string;
  sourceLanguage: string | null;
  status: VideoStatus;
  totalSegments: number | null;
  durationSeconds: number | null;
  error: string | null;
  createdAt: string;
}

export interface HistoryVideo extends Video {
  readySegments: number;
  /** A frame of the video (temporary URL); null until it exists. */
  thumbnailUrl: string | null;
}

export interface Translation {
  id: string;
  targetLanguage: string;
  status: VideoStatus;
}

export interface VideoDetail extends Video {
  playbackUrl: string | null;
  thumbnailUrl: string | null;
  /** Every translation of the same file (this one included). */
  translations: Translation[];
  export: { status: TaskStatus | null; error: string | null; url: string | null };
  /** Text format: "## Heading" for sections and "- " for bullets. */
  summary: { status: TaskStatus | null; text: string | null; error: string | null; createdAt: string | null };
  audio: {
    voiceAvailable: boolean;
    status: TaskStatus | null;
    error: string | null;
    /** 0-100 while it is being generated. */
    progress: number | null;
    /** To listen to it (temporary URL). */
    url: string | null;
    /** The same file, downloaded by the browser with its own name. */
    downloadUrl: string | null;
  };
}

export interface SegmentState {
  index: number;
  start: number;
  end: number;
  status: SegmentStatus;
  translatedText: string | null;
  error: string | null;
}

export interface VideoProgress {
  total: number;
  ready: number;
  pending: number;
  processing: number;
  failed: number;
  percent: number;
}

export interface VideoStatusReport {
  id: string;
  status: VideoStatus;
  error: string | null;
  sourceLanguage: string | null;
  targetLanguage: string;
  progress: VideoProgress;
  segments: SegmentState[];
}

export const isFinished = (status: VideoStatus) => status === "completed" || status === "failed";
export const isBusy = (status: VideoStatus) => status === "pending" || status === "processing";
