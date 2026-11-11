import { useEffect } from "react";
import { useAsyncAction } from "../hooks/useAsyncAction";
import { useT } from "../i18n";
import { TrashIcon } from "./icons";

interface Props {
  name: string;
  language: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

/** Confirmation before deleting (it cannot be undone). */
export function ConfirmDeleteDialog({ name, language, onConfirm, onCancel }: Props) {
  const { busy, error, run } = useAsyncAction();
  const t = useT();

  useEffect(() => {
    const escape = (e: KeyboardEvent) => e.key === "Escape" && !busy && onCancel();
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [busy, onCancel]);

  // The name is shown in bold: the translated text is split around it
  const [before, after = ""] = t("delete.message", { name: "\u0000", language: language.toUpperCase() }).split("\u0000");

  return (
    <div className="dialog-backdrop" onPointerDown={(e) => e.target === e.currentTarget && !busy && onCancel()}>
      <div className="card dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title">
        <span className="dialog-icon" aria-hidden>
          <TrashIcon />
        </span>
        <h2 id="dialog-title">{t("delete.title")}</h2>
        <p className="muted">
          {before}
          <strong>{name}</strong>
          {after}
        </p>
        {error && <p className="error">{error}</p>}
        <div className="dialog-buttons">
          <button type="button" className="secondary" onClick={onCancel} disabled={busy} autoFocus>
            {t("common.cancel")}
          </button>
          <button type="button" className="danger" onClick={() => run(onConfirm)} disabled={busy}>
            {busy ? t("delete.deleting") : t("delete.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
