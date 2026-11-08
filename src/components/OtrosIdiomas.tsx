import { useEffect, useMemo, useState } from "react";
import { api, type Idioma, type TraduccionResumen } from "../api";
import { bandera, capitalizar } from "../banderas";
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

  const otras = traducciones.filter((t) => t.id !== id);
  const yaTraducidos = useMemo(() => new Set(traducciones.map((t) => t.idioma_destino)), [traducciones]);

  useEffect(() => {
    if (!abierto || idiomas.length) return;
    api.idiomas().then(setIdiomas, () => setError("No se pudo cargar la lista de idiomas."));
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
        title={disponible ? undefined : "Disponible cuando el video termine de prepararse"}
        onClick={() => setAbierto((a) => !a)}
      >
        <IconoTraducir />
        Traducir transcripción a otro idioma
      </button>

      {abierto && (
        <div className="panel-traducir" onKeyDown={(e) => e.key === "Escape" && setAbierto(false)}>
          <select
            aria-label="Idioma al que traducir la transcripción"
            value={elegido}
            onChange={(e) => setElegido(e.target.value)}
            disabled={enviando}
          >
            {idiomas.map((i) => (
              <option key={i.codigo} value={i.codigo} disabled={i.codigo === idiomaActual}>
                {bandera(i.codigo)} {capitalizar(i.nombre)}
                {i.codigo === idiomaActual ? " (actual)" : yaTraducidos.has(i.codigo) ? " (ya traducido)" : ""}
              </option>
            ))}
          </select>
          <span className="sutil">Se reutiliza la transcripción: solo se traduce, así que tarda mucho menos.</span>
          {error && <p className="error">{error}</p>}
          <div className="panel-traducir-botones">
            <button type="button" className="secundario" onClick={() => setAbierto(false)} disabled={enviando}>
              Cancelar
            </button>
            <button type="button" className="primario" onClick={traducir} disabled={!elegido || enviando}>
              {enviando ? "Un momento…" : yaTraducidos.has(elegido) ? "Ver traducción" : "Traducir"}
            </button>
          </div>
        </div>
      )}

      {otras.length > 0 && (
        <div className="otras-traducciones">
          <span>También en:</span>
          {otras.map((t) => (
            <a key={t.id} href={`#/video/${t.id}`} className="chip chip-enlace" title={`Ver la traducción (${t.estado})`}>
              {bandera(t.idioma_destino)} {t.idioma_destino.toUpperCase()}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
