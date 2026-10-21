import { useState } from "react";
import { IconoAbrir, IconoCheck, IconoCopiar, IconoEnlace } from "./Iconos";

/** Botón "Ver URL": la URL de origen queda oculta hasta que se pide. */
export function VerUrl({ url }: { url: string }) {
  const [abierto, setAbierto] = useState(false);
  const [copiada, setCopiada] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiada(true);
      setTimeout(() => setCopiada(false), 1800);
    } catch {
      /* sin permiso de portapapeles: la URL sigue visible para copiarla a mano */
    }
  };

  return (
    <>
      <button
        type="button"
        className="chip chip-boton"
        aria-expanded={abierto}
        onClick={() => setAbierto((a) => !a)}
      >
        <IconoEnlace />
        {abierto ? "Ocultar URL" : "Ver URL"}
      </button>

      {abierto && (
        <div className="panel-url">
          <code title={url}>{url}</code>
          <div className="barra-flotante compacta-linea">
            <button
              type="button"
              className="boton-icono"
              data-tip={copiada ? "¡Copiada!" : "Copiar URL"}
              aria-label="Copiar URL"
              onClick={copiar}
            >
              {copiada ? <IconoCheck /> : <IconoCopiar />}
            </button>
            <a
              className="boton-icono"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              data-tip="Abrir en otra pestaña"
              aria-label="Abrir URL en otra pestaña"
            >
              <IconoAbrir />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
