import { useState, type FormEvent } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { useDelayedFlag } from "../../hooks/useUiHelpers";
import { errorText } from "../../lib/format";

export type AuthMode = "login" | "register";

// If sending takes this long, the API is most likely waking up.
const SLOW_AFTER_MS = 5_000;

/** State and actions of the sign-in / sign-up form. */
export function useAuthForm() {
  const { signIn, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slow = useDelayedFlag(sending, SLOW_AFTER_MS);
  const isRegister = mode === "register";

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      if (isRegister) await register(name.trim(), email.trim(), password, remember);
      else await signIn(email.trim(), password, remember);
    } catch (err) {
      setError(errorText(err));
      setSending(false);
    }
  }

  function switchMode() {
    setMode(isRegister ? "login" : "register");
    setError(null);
  }

  return {
    isRegister,
    fields: { name, email, password, showPassword, remember },
    set: { name: setName, email: setEmail, password: setPassword, remember: setRemember },
    togglePassword: () => setShowPassword((v) => !v),
    sending,
    slow,
    error,
    submit,
    switchMode,
  };
}
