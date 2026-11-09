import { useEffect, useState, type ReactNode } from "react";
import { api, type EstadoExportacion, type VideoDetalle } from "../api";
import { idiomaActual, nombreIdioma, useT } from "../i18n";
import { IconoCheck, IconoChispa, IconoCopiar, IconoDescargar, IconoReintentar } from "./Iconos";

interface Props {
  video: Pick<VideoDetalle, "id" | "idioma_destino" | "resumen_estado" | "resumen_texto" | "resumen_en">;
  /** Solo se puede resumir cuando la traducción terminó. */
  disponible: boolean;
  onBuscar: (segundos: number) => void;
}

const INTERVALO_MS = 4_000;

/** "01:23" o "1:02:03" → segundos */
function aSegundos(marca: string): number {
  return marca.split(":").reduce((total, parte) => total * 60 + Number(parte), 0);
}

/**
 * Pinta el formato del resumen: "## Título", "- viñeta" y "- [mm:ss] momento"
 * (la marca de tiempo lleva el reproductor a ese momento). Se construye con
 * elementos de React, nunca con HTML: el texto viene de un modelo de IA.
 */
function ContenidoResumen({ texto, onBuscar }: { texto: string; onBuscar: (s: number) => void }) {
  const t = useT();
  const bloques: ReactNode[] = [];
  let lista: ReactNode[] = [];
  const cerrarLista = () => {
    if (lista.length) bloques.push(<ul key={`l${bloques.length}`}>{lista}</ul>);
    lista = [];
  };

  texto.split("\n").forEach((cruda, i) => {
    const linea = cruda.trim().replace(/\*\*(.+?)\*\*/g, "$1"); // por si el modelo añade negritas
    if (!linea) return cerrarLista();
    const titulo = /^#{1,6}\s+(.+)$/.exec(linea)?.[1];
    if (titulo) {
      cerrarLista();
      bloques.push(<h3 key={i}>{titulo}</h3>);
      return;
    }
    const vineta = /^[-*•]\s+(.+)$/.exec(linea)?.[1];
    if (vineta) {
      const momento = /^\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*(.*)$/.exec(vineta);
      lista.push(
        <li key={i} className={momento ? "momento" : undefined}>
          {momento ? (
            <>
              <button type="button" className="marca-tiempo" title={t("resumen.ir", { tiempo: momento[1]! })} onClick={() => onBuscar(aSegundos(momento[1]!))}>
                {momento[1]}
              </button>
              <span>{momento[2]}</span>
            </>
          ) : (
            vineta
          )}
        </li>,
      );
      return;
    }
    cerrarLista();
    bloques.push(<p key={i}>{linea}</p>);
  });
  cerrarLista();
  return <div className="resumen-contenido">{bloques}</div>;
}

export function ResumenVideo({ video, disponible, onBuscar }: Props) {
  const t = useT();
  const [estado, setEstado] = useState<EstadoExportacion | null>(video.resumen_estado);
  const [texto, setTexto] = useState(video.resumen_texto);
  const [fecha, setFecha] = useState(video.resumen_en);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Mientras se genera, se consulta el estado (también si se recargó la página).
  useEffect(() => {
    if (estado !== "procesando") return;
    const control = new AbortController();
    const temporizador = setInterval(async () => {
      try {
        const det = await api.obtenerVideo(video.id, control.signal);
        if (det.resumen_estado === "procesando") return;
        setEstado(det.resumen_estado);
        setTexto(det.resumen_texto);
        setFecha(det.resumen_en);
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
      await api.generarResumen(video.id);
      setEstado("procesando");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function descargar() {
    setError(null);
    try {
      await api.descargarResumen(video.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function copiar() {
    if (!texto) return;
    try {
      await navigator.clipboard.writeText(texto.replace(/^#{1,6}\s+/gm, ""));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      /* sin permiso de portapapeles: se puede descargar */
    }
  }

  const generando = estado === "procesando";
  const detalle = generando
    ? t("resumen.generandoDetalle")
    : !disponible && !texto
      ? t("resumen.esperando")
      : t("resumen.detalle", { idioma: nombreIdioma(video.idioma_destino) });

  return (
    <div className="resumen">
      <div className="resumen-cabecera">
        <span className="ventaja-icono" aria-hidden>
          <IconoChispa />
        </span>
        <div className="resumen-cabecera-texto">
          <strong>{t("resumen.titulo")}</strong>
          <span className="sutil">{detalle}</span>
        </div>
        <div className="resumen-acciones">
          {texto && !generando && (
            <>
              <button type="button" className="boton-icono" data-tip={copiado ? t("resumen.copiado") : t("resumen.copiar")} aria-label={t("resumen.copiar")} onClick={copiar}>
                {copiado ? <IconoCheck /> : <IconoCopiar />}
              </button>
              <button type="button" className="boton-icono" data-tip={t("resumen.regenerar")} aria-label={t("resumen.regenerar")} onClick={generar} disabled={!disponible}>
                <IconoReintentar />
              </button>
              <button type="button" className="primario" onClick={descargar}>
                <IconoDescargar />
                {t("resumen.descargar")}
              </button>
            </>
          )}
          {!texto && (
            <button type="button" className={estado === "error" ? "secundario" : "primario"} onClick={generar} disabled={!disponible || generando}>
              {generando ? <span className="cargador cargador-boton" aria-hidden /> : estado === "error" ? <IconoReintentar /> : <IconoChispa />}
              {generando ? t("resumen.generando") : estado === "error" ? t("resumen.reintentar") : t("resumen.generar")}
            </button>
          )}
          {texto && generando && <span className="cargador" aria-label={t("resumen.generando")} />}
        </div>
      </div>

      {estado === "error" && <p className="error">{t("resumen.error")}</p>}
      {error && <p className="error">{error}</p>}

      {texto && (
        <div className={generando ? "resumen-cuerpo regenerando" : "resumen-cuerpo"}>
          <ContenidoResumen texto={texto} onBuscar={onBuscar} />
          {fecha && (
            <p className="resumen-fecha">
              {t("resumen.generadoEl", {
                fecha: new Intl.DateTimeFormat(idiomaActual(), { dateStyle: "medium", timeStyle: "short" }).format(new Date(fecha)),
              })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
