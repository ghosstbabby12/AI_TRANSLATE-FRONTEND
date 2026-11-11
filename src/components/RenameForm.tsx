import { useState, type FormEvent } from "react";
import { useAsyncAction } from "../hooks/useAsyncAction";
import { useT } from "../i18n";

interface Props {
  currentName: string;
  onSave: (name: string) => Promise<void>;
  onCancel: () => void;
}

/** Rename in place. Enter saves, Escape cancels. */
export function RenameForm({ currentName, onSave, onCancel }: Props) {
  const [name, setName] = useState(currentName);
  const { busy, error, setError, run } = useAsyncAction();
  const t = useT();

  function submit(e: FormEvent) {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) return setError(t("rename.enterName"));
    if (clean === currentName) return onCancel();
    void run(() => onSave(clean));
  }

  return (
    <form className="rename-form" onSubmit={submit} onKeyDown={(e) => e.key === "Escape" && onCancel()}>
      <input
        autoFocus
        aria-label={t("rename.videoName")}
        value={name}
        maxLength={200}
        disabled={busy}
        onChange={(e) => setName(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
      />
      <div className="rename-form-buttons">
        <button type="button" className="secondary" onClick={onCancel} disabled={busy}>
          {t("common.cancel")}
        </button>
        <button type="submit" className="primary" disabled={busy}>
          {busy ? t("common.saving") : t("common.save")}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
