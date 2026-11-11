import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { CollapseIcon, ExpandIcon } from "../../../components/icons";
import { useT } from "../../../i18n";
import { cueAt, type Cue } from "../../../lib/vtt";
import type { SegmentState } from "../../../models/video";

interface Props {
  url: string | null;
  /** Frame shown before pressing play. */
  poster?: string | null;
  cues: Cue[];
  segments: SegmentState[];
  videoRef: RefObject<HTMLVideoElement | null>;
  onTime: (seconds: number) => void;
  /** Extra buttons for the floating bar (downloads, retry…). */
  actions?: ReactNode;
  /** Processing finished: if there is no URL yet, none will come. */
  finished?: boolean;
}

/** Fullscreen on a container (the native video fullscreen would hide the subtitle layer). */
function useFullscreen() {
  const container = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === container.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const toggle = () => (document.fullscreenElement ? document.exitFullscreen() : container.current?.requestFullscreen());
  return { container, fullscreen, toggle };
}

/**
 * Subtitles are drawn on their own layer over the <video> instead of a <track>:
 * they update the moment new segments arrive (a <track> never re-reads its file)
 * and it can say which part is still being translated.
 */
export function SubtitledPlayer({ url, poster, cues, segments, videoRef, onTime, actions, finished }: Props) {
  const { container, fullscreen, toggle } = useFullscreen();
  const [time, setTime] = useState(0);
  const t = useT();

  if (!url) return <EmptyPlayer finished={finished} />;

  const cue = cueAt(cues, time);
  const slice = segments.find((s) => time >= s.start && time < s.end);
  const translating = !cue && slice && (slice.status === "pending" || slice.status === "processing");
  const update = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setTime(e.currentTarget.currentTime);
    onTime(e.currentTarget.currentTime);
  };
  const fullscreenLabel = fullscreen ? t("video.exitFullscreen") : t("video.fullscreen");

  return (
    <div ref={container} className={`player ${fullscreen ? "fullscreen" : ""}`}>
      <video ref={videoRef} src={url} poster={poster ?? undefined} controls controlsList="nofullscreen" playsInline onTimeUpdate={update} onSeeked={update} />
      <div className="subtitle-overlay" aria-live="polite">
        {cue ? <span>{cue.text}</span> : translating ? <span className="translating">{t("video.translatingSlice")}</span> : null}
      </div>

      {/* Floating action bar over the video */}
      <div className="floating-bar" role="toolbar" aria-label={t("video.actions")}>
        {actions}
        <button type="button" className="icon-button" data-tip={fullscreenLabel} aria-label={fullscreenLabel} onClick={toggle}>
          {fullscreen ? <CollapseIcon /> : <ExpandIcon />}
        </button>
      </div>
    </div>
  );
}

function EmptyPlayer({ finished }: { finished?: boolean }) {
  const t = useT();
  return (
    <div className="player player-empty">
      {finished ? (
        <>
          <p>{t("video.unavailable")}</p>
          <p className="player-note">{t("video.unavailableNote")}</p>
        </>
      ) : (
        <>
          <span className="spinner" aria-hidden />
          <p>{t("video.preparing")}</p>
        </>
      )}
    </div>
  );
}
