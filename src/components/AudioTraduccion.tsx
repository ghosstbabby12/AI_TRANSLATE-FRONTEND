import { useEffect, useRef, useState, type RefObject } from "react";
import { api, type EstadoExportacion, type VideoDetalle } from "../api";
import { nombreIdioma, useT } from "../i18n";
import { IconoAltavoz, IconoDescargar, IconoReintentar } from "./Iconos";

interface Props {
  video: Pick<VideoDetalle, "id" | "idioma_destino" | "voz_disponible" | "audio_estado" | "url_audio" | "url_audio_descarga">;
  /** Solo se puede generar cuando la traducción terminó. */
  disponible: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
}

const INTERVALO_MS = 5_000;
// Desfase tolerado entre la imagen y la voz antes de corregirlo (segundos)
const DESFASE_MAXIMO = 0.3;

/**
 * Mantiene el <audio> de la traducción sincronizado con el <video>: el video
 * manda (play, pausa, saltos, velocidad) y su audio original se silencia.
 */
function useDoblaje(activo: boolean, videoRef: RefObject<HTMLVideoElement | null>, audioRef: RefObject<HTMLAudioElement | null>) {
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!activo || !video || !audio) return;

    const mutedAntes = video.muted;
    video.muted = true;
    const alinear = () => {
      if (Math.abs(audio.currentTime - video.currentTime) > DESFASE_MAXIMO) audio.currentTime = video.currentTime;
    };
    const reproducir = () => {
      alinear();
      audio.playbackRate = video.playbackRate;
      audio.play().catch(() => {});
    };
    const pausar = () => audio.pause();
    const velocidad = () => (audio.playbackRate = video.playbackRate);

    const eventos: [string, () => void][] = [
      ["play", reproducir],
      ["playing", reproducir],
      ["pause", pausar],
      ["waiting", pausar],
      ["seeked", alinear],
      ["timeupdate", alinear],
      ["ratechange", velocidad],
      ["ended", pausar],
    ];
    eventos.forEach(([e, f]) => video.addEventListener(e, f));
    if (!video.paused) reproducir();
    else alinear();

    return () => {
      eventos.forEach(([e, f]) => video.removeEventListener(e, f));
      audio.pause();
      video.muted = mutedAntes;
    };
  }, [activo, videoRef, audioRef]);
}

export function AudioTraduccion({ video, disponible, videoRef }: Props) {
  const t = useT();
  const [estado, setEstado] = useState<EstadoExportacion | null>(video.audio_estado);
  const [urls, setUrls] = useState({ audio: video.url_audio, descarga: video.url_audio_descarga });
  const [error, setError] = useState<string | null>(null);
  const [doblaje, setDoblaje] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  useDoblaje(doblaje && estado === "listo", videoRef, audioRef);

  // Mientras se genera, se consulta el estado (también si se recargó la página).
  useEffect(() => {
    if (estado !== "procesando") return;
    const control = new AbortController();
    const temporizador = setInterval(async () => {
      try {
        const det = await api.obtenerVideo(video.id, control.signal);
        if (det.audio_estado === "procesando") return;
        setEstado(det.audio_estado);
        setUrls({ audio: det.url_audio, descarga: det.url_audio_descarga });
      } catch {
        /* fallo puntual de red: se reintenta en el siguiente intervalo */
      }
    }, INTERVALO_MS);
    return () => {
      control.abort();
      clearInterval(temporizador);
    };
  }, [estado, video.id]);

  async function generar() {
    setError(null);
    try {
      await api.generarAudio(video.id);
      setEstado("procesando");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  // La URL firmada caduca (1 h): si la página quedó abierta, se pide una nueva al descargar.
  async function descargar() {
    setError(null);
    try {
      const det = await api.obtenerVideo(video.id);
      const url = det.url_audio_descarga ?? urls.descarga;
      if (!url) return;
      const a = Object.assign(document.createElement("a"), { href: url, rel: "noopener" });
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  const idioma = nombreIdioma(video.idioma_destino, { enFrase: true });
  const listo = estado === "listo" && urls.audio;
  const generando = estado === "procesando";
  const detalle = !video.voz_disponible
    ? t("audio.noDisponible", { idioma })
    : generando
      ? t("audio.generandoDetalle")
      : !disponible && !listo
        ? t("audio.esperando")
        : t("audio.detalle", { idioma });

  return (
    <div className="audio-traduccion">
      <div className="resumen-cabecera">
        <span className="ventaja-icono" aria-hidden>
          <IconoAltavoz />
        </span>
        <div className="resumen-cabecera-texto">
          <strong>{t("audio.titulo")}</strong>
          <span className="sutil">{detalle}</span>
        </div>
        <div className="resumen-acciones">
          {listo ? (
            <button type="button" className="primario" onClick={descargar}>
              <IconoDescargar />
              {t("audio.descargar")}
            </button>
          ) : (
            video.voz_disponible && (
              <button
                type="button"
                className={estado === "error" ? "secundario" : "primario"}
                onClick={generar}
                disabled={!disponible || generando}
              >
                {generando ? (
                  <span className="cargador cargador-boton" aria-hidden />
                ) : estado === "error" ? (
                  <IconoReintentar />
                ) : (
                  <IconoAltavoz />
                )}
                {generando ? t("audio.generando") : estado === "error" ? t("audio.reintentar") : t("audio.generar")}
              </button>
            )
          )}
        </div>
      </div>

      {estado === "error" && <p className="error">{t("audio.error")}</p>}
      {error && <p className="error">{error}</p>}

      {listo && (
        <div className="audio-cuerpo">
          <audio ref={audioRef} src={urls.audio!} controls preload="metadata" aria-label={t("audio.reproductor")} />
          <label className="interruptor" title={t("audio.sobreVideoDetalle")}>
            <input type="checkbox" role="switch" checked={doblaje} onChange={(e) => setDoblaje(e.target.checked)} />
            <span className="interruptor-pista" aria-hidden />
            <span>
              <strong>{t("audio.sobreVideo")}</strong>
              <span className="sutil">{t("audio.sobreVideoDetalle")}</span>
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
