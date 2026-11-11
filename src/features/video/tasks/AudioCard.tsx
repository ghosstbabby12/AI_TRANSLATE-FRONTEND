import type { RefObject } from "react";
import { DownloadIcon, RetryIcon, SpeakerIcon } from "../../../components/icons";
import { languageName, useT } from "../../../i18n";
import type { VideoDetail } from "../../../models/video";
import { useTranslationAudio } from "./useTranslationAudio";

interface Props {
  video: VideoDetail;
  /** It can only be generated once the translation has finished. */
  available: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
}

/** "Translation audio" card. */
export function AudioCard({ video, available, videoRef }: Props) {
  const audio = useTranslationAudio(video, videoRef);
  const t = useT();
  const language = languageName(video.targetLanguage, { inSentence: true });
  const generating = audio.status === "processing";
  const failed = audio.status === "failed";
  const voiceAvailable = video.audio.voiceAvailable;
  const detail = !voiceAvailable
    ? t("audio.unavailable", { language })
    : generating
      ? t("audio.generatingDetail")
      : !available && !audio.listenUrl
        ? t("audio.waiting")
        : t("audio.detail", { language });

  return (
    <div className="translation-audio">
      <div className="summary-header">
        <span className="feature-icon" aria-hidden>
          <SpeakerIcon />
        </span>
        <div className="summary-header-text">
          <strong>{t("audio.title")}</strong>
          <span className="muted">{detail}</span>
        </div>
        <div className="summary-actions">
          {audio.listenUrl ? (
            <button type="button" className="primary" onClick={audio.download}>
              <DownloadIcon />
              {t("audio.download")}
            </button>
          ) : (
            voiceAvailable && (
              <button type="button" className={failed ? "secondary" : "primary"} onClick={audio.generate} disabled={!available || generating}>
                {generating ? <span className="spinner spinner-button" aria-hidden /> : failed ? <RetryIcon /> : <SpeakerIcon />}
                {generating ? t("audio.generating", { progress: audio.progress }) : failed ? t("audio.retry") : t("audio.generate")}
              </button>
            )
          )}
        </div>
      </div>

      {failed && <p className="error">{t(audio.outOfMemory ? "audio.outOfMemory" : "audio.error")}</p>}
      {audio.error && <p className="error">{audio.error}</p>}

      {audio.listenUrl && (
        <div className="audio-body">
          <audio ref={audio.audioRef} src={audio.listenUrl} controls preload="metadata" aria-label={t("audio.player")} />
          <label className="switch" title={t("audio.overVideoDetail")}>
            <input type="checkbox" role="switch" checked={audio.dubbing} onChange={(e) => audio.setDubbing(e.target.checked)} />
            <span className="switch-track" aria-hidden />
            <span>
              <strong>{t("audio.overVideo")}</strong>
              <span className="muted">{t("audio.overVideoDetail")}</span>
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
