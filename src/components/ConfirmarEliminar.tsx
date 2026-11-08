import { useEffect, useState } from "react";
import { IconoEliminar } from "./Iconos";

interface Props {
  nombre: string;
  idioma: string;
  onConfirmar: () => Promise<void>;
  onCancelar: () => void;
}

/** Diálogo de confirmación antes de eliminar (la acción no se puede deshacer). */
export function ConfirmarEliminar({ nombre, idioma, onConfirmar, onCancelar }: Props) {
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const escape = (e: KeyboardEvent) => e.key === "Escape" && !eliminando && onCancelar();
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [eliminando, onCancelar]);

  async function confirmar() {
    setEliminando(true);
    setError(null);
    try {
      await onConfirmar();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setEliminando(false);
    }
  }

  return (
    <div className="fondo-dialogo" onPointerDown={(e) => e.target === e.currentTarget && !eliminando && onCancelar()}>
      <div className="tarjeta dialogo" role="alertdialog" aria-modal="true" aria-labelledby="dialogo-titulo">
        <span className="dialogo-icono" aria-hidden>
          <IconoEliminar />
        </span>
        <h2 id="dialogo-titulo">¿Eliminar este video?</h2>
        <p className="sutil">
          Se eliminará <strong>{nombre}</strong> ({idioma.toUpperCase()}) con sus subtítulos. Las traducciones a otros
          idiomas se conservan. Esta acción no se puede deshacer.
        </p>
        {error && <p className="error">{error}</p>}
        <div className="dialogo-botones">
          <button type="button" className="secundario" onClick={onCancelar} disabled={eliminando} autoFocus>
            Cancelar
          </button>
          <button type="button" className="peligro" onClick={confirmar} disabled={eliminando}>
            {eliminando ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
