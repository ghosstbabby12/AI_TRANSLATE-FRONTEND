import { useEffect, useRef, useState } from "react";
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
 * Enlaces a las otras traducciones del mismo video y botón "Traducir a otro
 * idioma", que reutiliza la transcripción y solo corre el paso de traducir.
 */
export function OtrosIdiomas({ id, idiomaActual, traducciones, disponible }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [idiomas, setIdiomas] = useState<Idioma[]>([]);
  const [elegido, setElegido] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const raiz = useRef<HTMLDivElement>(null);

  const otras = traducciones.filter((t) => t.id !== id);
  const yaTraducidos = new Set(traducciones.map((t) => t.idioma_destino));

  useEffect(() => {
    if (!abierto || idiomas.length) return;
    api.idiomas().then(setIdiomas, () => setError("No se pudo cargar la lista de idiomas."));
  }, [abierto, idiomas.length]);

  // Primer idioma que aún no tiene traducción
  useEffect(() => {
    if (!elegido && idiomas.length) setElegido(idiomas.find((i) => !yaTraducidos.has(i.codigo))?.codigo ?? "");
  }, [idiomas, elegido, yaTraducidos]);

  // Se cierra al hacer clic fuera o con Escape
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => !raiz.current?.contains(e.target as Node) && setAbierto(false);
    const escape = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      document.removeEventListener("keydown", escape);
    };
  }, [abierto]);

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
    <>
      {otras.length > 0 && (
        <span className="otras-traducciones">
          También en:
          {otras.map((t) => (
            <a key={t.id} href={`#/video/${t.id}`} className="chip chip-enlace" title={`Ver la traducción (${t.estado})`}>
              {bandera(t.idioma_destino)} {t.idioma_destino.toUpperCase()}
            </a>
          ))}
        </span>
      )}

      <div className="menu-idiomas" ref={raiz}>
        <button
          type="button"
          className="chip chip-boton"
          aria-expanded={abierto}
          aria-haspopup="dialog"
          disabled={!disponible}
          title={disponible ? undefined : "Disponible cuando el video termine de prepararse"}
          onClick={() => setAbierto((a) => !a)}
        >
          <IconoTraducir />
          Traducir a otro idioma
        </button>

        {abierto && (
          <div className="popover popover-izq" role="dialog" aria-label="Traducir a otro idioma">
            <div className="popover-seccion">
              <span className="popover-titulo">Traducir los subtítulos a</span>
              <select value={elegido} onChange={(e) => setElegido(e.target.value)} disabled={enviando}>
                {idiomas.map((i) => (
                  <option key={i.codigo} value={i.codigo} disabled={i.codigo === idiomaActual}>
                    {bandera(i.codigo)} {capitalizar(i.nombre)}
                    {i.codigo === idiomaActual ? " (actual)" : yaTraducidos.has(i.codigo) ? " (ya traducido)" : ""}
                  </option>
                ))}
              </select>
              <span className="sutil">
                Se reutiliza la transcripción: solo se traduce, así que tarda mucho menos.
              </span>
            </div>
            {error && <p className="error">{error}</p>}
            <button type="button" className="primario ancho" onClick={traducir} disabled={!elegido || enviando}>
              {enviando ? "Un momento…" : yaTraducidos.has(elegido) ? "Ver esa traducción" : "Traducir"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
