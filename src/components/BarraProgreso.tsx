import type { EstadoRespuesta } from "../api";
import { useT } from "../i18n";
import { formatoTiempo } from "../vtt";
import { CLAVE_ESTADO } from "./EstadoBadge";

interface Props {
  estado: EstadoRespuesta;
  tiempoActual: number;
  onBuscar: (segundos: number) => void;
}

/**
 * Barra de "N de M segmentos" + franja con un bloque por segmento coloreado
 * según su estado, para ver de un vistazo qué tramos del video ya están listos.
 * Hacer clic en un bloque lleva el reproductor a ese tramo.
 */
export function BarraProgreso({ estado, tiempoActual, onBuscar }: Props) {
  const { progreso, segmentos } = estado;
  const duracion = segmentos.at(-1)?.tiempo_fin ?? 0;
  const preparando = progreso.total === 0;
  const t = useT();

  return (
    <div className="progreso">
      <div className="progreso-cabecera">
        <span>
          {preparando
            ? estado.estado === "error"
              ? t("progreso.sinPreparar")
              : t("progreso.dividiendo")
            : t("progreso.listos", { listos: progreso.listos, total: progreso.total })}
        </span>
        {!preparando && <strong>{progreso.porcentaje}%</strong>}
      </div>

      <div
        className={`progreso-barra ${preparando && estado.estado !== "error" ? "indeterminada" : ""}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progreso.porcentaje}
      >
        <div className="progreso-relleno" style={{ width: `${progreso.porcentaje}%` }} />
      </div>

      {segmentos.length > 0 && (
        <div className="franja" aria-label={t("progreso.estadoSegmentos")}>
          {segmentos.map((s) => {
            const activo = tiempoActual >= s.tiempo_inicio && tiempoActual < s.tiempo_fin;
            return (
              <button
                key={s.indice}
                type="button"
                className={`franja-bloque seg-${s.estado} ${activo ? "activo" : ""}`}
                style={{ flexGrow: s.tiempo_fin - s.tiempo_inicio }}
                title={`${formatoTiempo(s.tiempo_inicio)}–${formatoTiempo(s.tiempo_fin)} · ${t(CLAVE_ESTADO[s.estado])}${s.error ? `: ${s.error}` : ""}`}
                onClick={() => onBuscar(s.tiempo_inicio)}
              />
            );
          })}
        </div>
      )}

      {progreso.errores > 0 && (
        <p className="aviso">
          {progreso.errores === 1
            ? t("progreso.errores.uno")
            : t("progreso.errores.otros", { n: progreso.errores })}
        </p>
      )}
      {duracion > 0 && <p className="sutil">{t("progreso.duracion", { duracion: formatoTiempo(duracion) })}</p>}
    </div>
  );
}
