import { useState } from "react";
import { useT } from "../i18n";
import { IconoAbrir, IconoCheck, IconoCopiar, IconoEnlace } from "./Iconos";

/** Botón "Ver URL": la URL de origen queda oculta hasta que se pide. */
export function VerUrl({ url }: { url: string }) {
  const [abierto, setAbierto] = useState(false);
  const [copiada, setCopiada] = useState(false);
  const t = useT();

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
        {abierto ? t("video.ocultarUrl") : t("video.verUrl")}
      </button>

      {abierto && (
        <div className="panel-url">
          <code title={url}>{url}</code>
          <div className="barra-flotante compacta-linea">
            <button
              type="button"
              className="boton-icono"
              data-tip={copiada ? t("video.urlCopiada") : t("video.copiarUrl")}
              aria-label={t("video.copiarUrl")}
              onClick={copiar}
            >
              {copiada ? <IconoCheck /> : <IconoCopiar />}
            </button>
            <a
              className="boton-icono"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              data-tip={t("video.abrirOtraPestana")}
              aria-label={t("video.abrirOtraPestana")}
            >
              <IconoAbrir />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
