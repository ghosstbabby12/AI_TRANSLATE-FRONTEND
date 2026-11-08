import { useEffect, useMemo, useState } from "react";
import { api, type Idioma, type TraduccionResumen } from "../api";
import { bandera } from "../banderas";
import { CLAVE_ESTADO } from "./EstadoBadge";
import { nombreIdioma, useT } from "../i18n";
import { navegar } from "../hooks/useRuta";
import { IconoTraducir } from "./Iconos";

interface Props {
  id: string;
  idiomaActual: string;
  traducciones: TraduccionResumen[];
  /** Solo se puede traducir a otro idioma cuando el video ya está dividido en segmentos. */
  disponible: boolean;
}

/**
 * Encabezado del panel de traducción: botón "Traducir transcripción a otro
 * idioma" (reutiliza la transcripción y solo corre el paso de traducir) y
 * enlaces a las demás traducciones del mismo video. El selector se despliega
 * dentro del panel, que tiene scroll propio y recortaría un menú flotante.
 */
export function OtrosIdiomas({ id, idiomaActual, traducciones, disponible }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [idiomas, setIdiomas] = useState<Idioma[]>([]);
  const [elegido, setElegido] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useT();

  const otras = traducciones.filter((tr) => tr.id !== id);
  const yaTraducidos = useMemo(() => new Set(traducciones.map((tr) => tr.idioma_destino)), [traducciones]);

  useEffect(() => {
    if (!abierto || idiomas.length) return;
    api.idiomas().then(setIdiomas, () => setError(t("otros.errorIdiomas")));
  }, [abierto, idiomas.length]);

  // Por defecto, el primer idioma que aún no tiene traducción
  useEffect(() => {
    if (!elegido && idiomas.length) setElegido(idiomas.find((i) => !yaTraducidos.has(i.codigo))?.codigo ?? "");
  }, [idiomas, elegido, yaTraducidos]);

  async function traducir() {
    if (!elegido) return;
    setError(null);
    setEnviando(true);
    try {
      const r = await api.traducirA(id, elegido);
      navegar(`/video/${r.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setEnviando(false);
    }
  }

  return (
    <div className="otros-idiomas">
      <button
        type="button"
        className="boton-traducir-otro"
        aria-expanded={abierto}
        disabled={!disponible}
        title={disponible ? undefined : t("otros.noDisponible")}
        onClick={() => setAbierto((a) => !a)}
      >
        <IconoTraducir />
        {t("otros.boton")}
      </button>

      {abierto && (
        <div className="panel-traducir" onKeyDown={(e) => e.key === "Escape" && setAbierto(false)}>
          <select
            aria-label={t("otros.selectorAria")}
            value={elegido}
            onChange={(e) => setElegido(e.target.value)}
            disabled={enviando}
          >
            {idiomas.map((i) => (
              <option key={i.codigo} value={i.codigo} disabled={i.codigo === idiomaActual}>
                {bandera(i.codigo)} {nombreIdioma(i.codigo)}
                {i.codigo === idiomaActual ? t("otros.actual") : yaTraducidos.has(i.codigo) ? t("otros.yaTraducido") : ""}
              </option>
            ))}
          </select>
          <span className="sutil">{t("otros.nota")}</span>
          {error && <p className="error">{error}</p>}
          <div className="panel-traducir-botones">
            <button type="button" className="secundario" onClick={() => setAbierto(false)} disabled={enviando}>
              {t("comun.cancelar")}
            </button>
            <button type="button" className="primario" onClick={traducir} disabled={!elegido || enviando}>
              {enviando ? t("acceso.unMomento") : yaTraducidos.has(elegido) ? t("otros.verTraduccion") : t("otros.traducir")}
            </button>
          </div>
        </div>
      )}

      {otras.length > 0 && (
        <div className="otras-traducciones">
          <span>{t("otros.tambienEn")}</span>
          {otras.map((tr) => (
            <a
              key={tr.id}
              href={`#/video/${tr.id}`}
              className="chip chip-enlace"
              title={t("otros.verTitulo", { estado: t(CLAVE_ESTADO[tr.estado]).toLowerCase() })}
            >
              {bandera(tr.idioma_destino)} {tr.idioma_destino.toUpperCase()}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
