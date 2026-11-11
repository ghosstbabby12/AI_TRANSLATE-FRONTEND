import { useDelayedFlag } from "../hooks/useUiHelpers";
import { useT } from "../i18n";
import { Logo } from "./Logo";

const SLOW_AFTER_MS = 4_000;

/** "Loading…" that explains a long wait: the free plan puts the API to sleep (up to a minute to wake up). */
export function LoadingScreen() {
  const slow = useDelayedFlag(true, SLOW_AFTER_MS);
  const t = useT();
  return (
    <main className="auth">
      <div className="card status-screen">
        <Logo />
        <span className="spinner spinner-accent" aria-hidden />
        <p>{slow ? t("connection.wakingUp") : t("app.loading")}</p>
        {slow && <p className="muted">{t("connection.wakingUpDetail")}</p>}
      </div>
    </main>
  );
}

interface OfflineProps {
  message: string;
  onRetry: () => void;
  onSwitchAccount: () => void;
}

/** The server did not answer when the app opened: the session is kept and can be retried. */
export function OfflineScreen({ message, onRetry, onSwitchAccount }: OfflineProps) {
  const t = useT();
  return (
    <main className="auth">
      <div className="card status-screen">
        <Logo />
        <h1>{t("connection.offlineTitle")}</h1>
        <p className="muted">{message}</p>
        <button type="button" className="primary large" onClick={onRetry}>
          {t("connection.retry")}
        </button>
        <button type="button" className="text-button" onClick={onSwitchAccount}>
          {t("connection.otherAccount")}
        </button>
      </div>
    </main>
  );
}
