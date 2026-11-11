import { ArrowIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserIcon } from "../../components/icons";
import { LogoSymbol } from "../../components/Logo";
import { LanguagePicker, ThemeToggle } from "../../components/Pickers";
import { useT } from "../../i18n";
import { useAuthForm } from "./useAuthForm";

export function AuthScreen() {
  const form = useAuthForm();
  const { fields, set, isRegister } = form;
  const t = useT();

  return (
    <main className="auth">
      <div className="auth-toolbar">
        <LanguagePicker />
        <ThemeToggle />
      </div>

      <div className="auth-content">
        <div className="logo-tile">
          <LogoSymbol size={88} />
        </div>
        <h1 className="auth-title">{isRegister ? t("auth.createYourAccount") : t("auth.welcomeBack")}</h1>
        <p className="auth-subtitle">{isRegister ? t("auth.registerSubtitle") : t("auth.loginSubtitle")}</p>

        <form className="auth-form" onSubmit={form.submit}>
          {isRegister && (
            <label className="icon-field">
              <UserIcon />
              <input
                aria-label={t("auth.name")}
                placeholder={t("auth.name")}
                autoComplete="name"
                value={fields.name}
                onChange={(e) => set.name(e.target.value)}
                required
                maxLength={100}
              />
            </label>
          )}

          <label className="icon-field">
            <MailIcon />
            <input
              type="email"
              aria-label={t("auth.email")}
              placeholder={t("auth.email")}
              autoComplete="email"
              value={fields.email}
              onChange={(e) => set.email(e.target.value)}
              required
            />
          </label>

          <label className="icon-field">
            <LockIcon />
            <input
              type={fields.showPassword ? "text" : "password"}
              aria-label={t("auth.password")}
              placeholder={isRegister ? t("auth.passwordRegister") : t("auth.password")}
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={fields.password}
              onChange={(e) => set.password(e.target.value)}
              minLength={isRegister ? 8 : undefined}
              required
            />
            <button
              type="button"
              className="eye-button"
              onClick={form.togglePassword}
              aria-label={fields.showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
            >
              {fields.showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </label>

          <label className="remember-me">
            <input type="checkbox" checked={fields.remember} onChange={(e) => set.remember(e.target.checked)} />
            <span>{t("auth.rememberMe")}</span>
          </label>

          {form.error && <p className="error">{form.error}</p>}
          {form.slow && <p className="soft-notice">{t("auth.wakingUp")}</p>}

          <button type="submit" className="primary auth-submit" disabled={form.sending}>
            <span>{form.sending ? t("auth.oneMoment") : isRegister ? t("auth.createAccount") : t("auth.signIn")}</span>
            <span className="auth-submit-arrow" aria-hidden>
              <ArrowIcon />
            </span>
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? t("auth.haveAccount") : t("auth.noAccount")}{" "}
          <button type="button" className="text-button" onClick={form.switchMode}>
            {isRegister ? t("auth.goToLogin") : t("auth.goToRegister")}
          </button>
        </p>

        <p className="auth-tagline">{t("auth.tagline")}</p>
      </div>
    </main>
  );
}
