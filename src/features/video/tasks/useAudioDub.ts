import { useEffect, type RefObject } from "react";

// Drift tolerated between picture and voice before correcting it (seconds)
const MAX_DRIFT = 0.3;

/**
 * Keeps the translation's <audio> in sync with the <video>: the video leads
 * (play, pause, seeking, speed) and its original sound is muted meanwhile.
 */
export function useAudioDub(active: boolean, videoRef: RefObject<HTMLVideoElement | null>, audioRef: RefObject<HTMLAudioElement | null>) {
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!active || !video || !audio) return;

    const wasMuted = video.muted;
    video.muted = true;
    const align = () => {
      if (Math.abs(audio.currentTime - video.currentTime) > MAX_DRIFT) audio.currentTime = video.currentTime;
    };
    const play = () => {
      align();
      audio.playbackRate = video.playbackRate;
      audio.play().catch(() => {});
    };
    const pause = () => audio.pause();
    const speed = () => (audio.playbackRate = video.playbackRate);

    const events: [string, () => void][] = [
      ["play", play],
      ["playing", play],
      ["pause", pause],
      ["waiting", pause],
      ["seeked", align],
      ["timeupdate", align],
      ["ratechange", speed],
      ["ended", pause],
    ];
    events.forEach(([name, handler]) => video.addEventListener(name, handler));
    if (!video.paused) play();
    else align();

    return () => {
      events.forEach(([name, handler]) => video.removeEventListener(name, handler));
      audio.pause();
      video.muted = wasMuted;
    };
  }, [active, videoRef, audioRef]);
}
