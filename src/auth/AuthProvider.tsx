import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi, profileApi } from "../api/authApi";
import { ApiError, setSessionToken } from "../api/http";
import { useLanguage } from "../i18n";
import { errorText } from "../lib/format";
import type { InterfaceLanguage, Session, User } from "../models/user";
import { readToken, saveToken } from "./tokenStorage";

interface AuthContext {
  user: User | null;
  /** True while the saved token is checked when the app opens. */
  loading: boolean;
  /** The server did not answer when checking the saved session (the session is kept). */
  connectionError: string | null;
  retryConnection: () => void;
  signIn: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string, remember?: boolean) => Promise<void>;
  signOut: () => void;
  /** Replaces the user's data after editing the profile. */
  updateUser: (user: User) => void;
  /** Changes the interface language and, when signed in, saves it in the profile. */
  changeLanguage: (language: InterfaceLanguage) => void;
}

const Context = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [cycle, setCycle] = useState(0); // incrementing it checks the session again
  const { language, setLanguage } = useLanguage();

  // The language saved in the profile wins: the account looks the same on any device.
  const receiveUser = useCallback(
    (next: User) => {
      setUser(next);
      if (next.interfaceLanguage === "es" || next.interfaceLanguage === "en") setLanguage(next.interfaceLanguage);
    },
    [setLanguage],
  );

  const signOut = useCallback(() => {
    saveToken(null);
    setSessionToken(null);
    setUser(null);
    setConnectionError(null);
  }, []);

  // When the app opens, a saved token is checked with /auth/yo. A 401 signs out
  // by itself (see http.ts); a network or server failure keeps the token and offers a retry.
  useEffect(() => {
    const token = readToken();
    setSessionToken(token, signOut);
    if (!token) return setLoading(false);
    setLoading(true);
    setConnectionError(null);
    authApi
      .me()
      .then(receiveUser, (err) => {
        if (!(err instanceof ApiError && err.status === 401)) setConnectionError(errorText(err));
      })
      .finally(() => setLoading(false));
  }, [signOut, receiveUser, cycle]);

  const open = useCallback(
    ({ token, user: next }: Session, remember = true) => {
      saveToken(token, remember);
      setSessionToken(token);
      receiveUser(next);
    },
    [receiveUser],
  );

  const changeLanguage = useCallback(
    (next: InterfaceLanguage) => {
      setLanguage(next);
      if (!user || user.interfaceLanguage === next) return;
      setUser({ ...user, interfaceLanguage: next });
      // If it fails (e.g. offline), the change still applies on this device
      profileApi.update({ interfaceLanguage: next }).catch(() => {});
    },
    [user, setLanguage],
  );

  const value = useMemo<AuthContext>(
    () => ({
      user,
      loading,
      connectionError,
      retryConnection: () => setCycle((c) => c + 1),
      signIn: async (email, password, remember) => open(await authApi.login(email, password), remember),
      register: async (name, email, password, remember) => {
        const session = await authApi.register(name, email, password);
        // A new account takes the language it was created with
        open({ ...session, user: { ...session.user, interfaceLanguage: language } }, remember);
        if (session.user.interfaceLanguage !== language) profileApi.update({ interfaceLanguage: language }).catch(() => {});
      },
      signOut,
      updateUser: receiveUser,
      changeLanguage,
    }),
    [user, loading, connectionError, open, signOut, receiveUser, changeLanguage, language],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAuth(): AuthContext {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
