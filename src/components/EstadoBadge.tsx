import type { EstadoSegmento, EstadoVideo } from "../api";
import { useT, type Clave } from "../i18n";

/** Clave de texto de cada estado (de video o de segmento). */
export const CLAVE_ESTADO: Record<EstadoVideo | EstadoSegmento, Clave> = {
  pendiente: "estado.pendiente",
  procesando: "estado.procesando",
  completo: "estado.completo",
  listo: "estado.listo",
  error: "estado.error",
};

export function EstadoBadge({ estado }: { estado: EstadoVideo }) {
  const t = useT();
  return (
    <span className={`badge badge-${estado}`}>
      {estado === "procesando" && <span className="punto-vivo" aria-hidden />}
      {t(CLAVE_ESTADO[estado])}
    </span>
  );
}
