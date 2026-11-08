import { useState, type FormEvent } from "react";
import { useT } from "../i18n";

interface Props {
  nombreActual: string;
  onGuardar: (nombre: string) => Promise<void>;
  onCancelar: () => void;
}

/** Campo para renombrar en el mismo lugar. Enter guarda, Escape cancela. */
export function EditarNombre({ nombreActual, onGuardar, onCancelar }: Props) {
  const [nombre, setNombre] = useState(nombreActual);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useT();

  async function guardar(e: FormEvent) {
    e.preventDefault();
    const limpio = nombre.trim();
    if (!limpio) return setError(t("editar.escribeNombre"));
    if (limpio === nombreActual) return onCancelar();
    setGuardando(true);
    setError(null);
    try {
      await onGuardar(limpio);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setGuardando(false);
    }
  }

  return (
    <form className="editar-nombre" onSubmit={guardar} onKeyDown={(e) => e.key === "Escape" && onCancelar()}>
      <input
        autoFocus
        aria-label={t("editar.nombreVideo")}
        value={nombre}
        maxLength={200}
        disabled={guardando}
        onChange={(e) => setNombre(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
      />
      <div className="editar-nombre-botones">
        <button type="button" className="secundario" onClick={onCancelar} disabled={guardando}>
          {t("comun.cancelar")}
        </button>
        <button type="submit" className="primario" disabled={guardando}>
          {guardando ? t("comun.guardando") : t("comun.guardar")}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
