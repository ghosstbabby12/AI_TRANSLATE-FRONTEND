import { useEffect, useRef, useState } from "react";
import { api, type EstadoExportacion } from "../api";
import { traducir, useT } from "../i18n";
import { IconoPelicula, IconoReintentar } from "./Iconos";

interface Props {
  id: string;
  estadoInicial: EstadoExportacion | null;
  /** Sin subtítulos listos no hay nada que incrustar. */
  deshabilitado: boolean;
}

const INTERVALO_MS = 5_000;

/** Descarga un archivo desde una URL firmada (el servidor indica "attachment"). */
function descargar(url: string) {
  const a = Object.assign(document.createElement("a"), { href: url, rel: "noopener" });
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Botón "Video con subtítulos". Generarlo implica recodificar el video, así
 * que es un trabajo en segundo plano: se pide, se consulta cada pocos segundos
 * y, al terminar, se descarga solo. Si ya existe, se descarga directamente.
 */
export function DescargaVideo({ id, estadoInicial, deshabilitado }: Props) {
  const [estado, setEstado] = useState<EstadoExportacion | null>(estadoInicial);
  const [error, setError] = useState<string | null>(null);
  // Solo se descarga automáticamente si el usuario lo pidió en esta visita.
  const descargarAlTerminar = useRef(false);
  const t = useT();

  // Mientras se genera, se consulta el estado (también si se recargó la página).
  useEffect(() => {
    if (estado !== "procesando") return;
    const control = new AbortController();
    const temporizador = setInterval(async () => {
      try {
        const det = await api.obtenerVideo(id, control.signal);
        if (det.export_estado === "procesando") return;
        setEstado(det.export_estado);
        if (det.export_estado === "error") setError(det.export_error ?? traducir("descarga.error"));
        if (det.export_estado === "listo" && det.url_exportacion && descargarAlTerminar.current) {
          descargarAlTerminar.current = false;
          descargar(det.url_exportacion);
        }
      } catch {
        /* fallo puntual de red: se reintenta en el siguiente intervalo */
      }
    }, INTERVALO_MS);
    return () => {
      control.abort();
      clearInterval(temporizador);
    };
  }, [estado, id]);

  async function pulsar() {
    setError(null);
    try {
      if (estado === "listo") {
        // La URL firmada caduca: se pide una nueva en el momento de descargar.
        const det = await api.obtenerVideo(id);
        if (det.url_exportacion) return descargar(det.url_exportacion);
      }
      descargarAlTerminar.current = true;
      await api.exportarVideo(id);
      setEstado("procesando");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  const generando = estado === "procesando";
  return (
    <div className="descarga-video">
      <div className="descarga-video-texto">
        <strong>{t("descarga.titulo")}</strong>
        <span className="sutil">
          {generando
            ? t("descarga.generandoDetalle")
            : estado === "listo"
              ? t("descarga.listoDetalle")
              : t("descarga.detalle")}
        </span>
        {error && <span className="error">{error}</span>}
      </div>
      <button
        type="button"
        className={estado === "error" ? "secundario" : "primario"}
        onClick={pulsar}
        disabled={deshabilitado || generando}
      >
        {generando ? (
          <span className="cargador cargador-boton" aria-hidden />
        ) : estado === "error" ? (
          <IconoReintentar />
        ) : (
          <IconoPelicula />
        )}
        {generando ? t("descarga.generando") : estado === "error" ? t("descarga.reintentar") : t("descarga.descargar")}
      </button>
    </div>
  );
}
