import { useState, type ReactNode } from "react";
import { EyeIcon, EyeOffIcon, LockIcon } from "../../components/icons";
import { useT } from "../../i18n";

export type Notice = { kind: "ok" | "error"; text: string } | null;

/** Success or error message under a form. */
export function NoticeMessage({ notice }: { notice: Notice }) {
  if (!notice) return null;
  const ok = notice.kind === "ok";
  return (
    <p className={ok ? "success" : "error"} role={ok ? "status" : "alert"}>
      {notice.text}
    </p>
  );
}

/** Field with an icon on the left and an optional extra (e.g. the eye button). */
export function Field({ label, icon, extra, children }: { label: ReactNode; icon: ReactNode; extra?: ReactNode; children: ReactNode }) {
  return (
    <label className="field profile-field">
      <span>{label}</span>
      <span className="icon-field icon-field-compact">
        {icon}
        {children}
        {extra}
      </span>
    </label>
  );
}

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  minLength?: number;
}

export function PasswordField({ label, value, onChange, autoComplete, minLength }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const t = useT();
  const eye = (
    <button type="button" className="eye-button" onClick={() => setVisible((v) => !v)} aria-label={visible ? t("auth.hidePassword") : t("auth.showPassword")}>
      {visible ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  );
  return (
    <Field label={label} icon={<LockIcon />} extra={eye}>
      <input
        type={visible ? "text" : "password"}
        value={value}
        autoComplete={autoComplete}
        minLength={minLength}
        maxLength={200}
        required
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}
