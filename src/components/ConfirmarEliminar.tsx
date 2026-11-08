import { useEffect, useState } from "react";
import { useT } from "../i18n";
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
  const t = useT();

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

  // El nombre va en negrita: se parte el texto traducido alrededor de él
  const [antes, despues = ""] = t("eliminar.mensaje", { nombre: "\u0000", idioma: idioma.toUpperCase() }).split("\u0000");

  return (
    <div className="fondo-dialogo" onPointerDown={(e) => e.target === e.currentTarget && !eliminando && onCancelar()}>
      <div className="tarjeta dialogo" role="alertdialog" aria-modal="true" aria-labelledby="dialogo-titulo">
        <span className="dialogo-icono" aria-hidden>
          <IconoEliminar />
        </span>
        <h2 id="dialogo-titulo">{t("eliminar.titulo")}</h2>
        <p className="sutil">
          {antes}
          <strong>{nombre}</strong>
          {despues}
        </p>
        {error && <p className="error">{error}</p>}
        <div className="dialogo-botones">
          <button type="button" className="secundario" onClick={onCancelar} disabled={eliminando} autoFocus>
            {t("comun.cancelar")}
          </button>
          <button type="button" className="peligro" onClick={confirmar} disabled={eliminando}>
            {eliminando ? t("eliminar.eliminando") : t("eliminar.eliminar")}
          </button>
        </div>
      </div>
    </div>
  );
}
