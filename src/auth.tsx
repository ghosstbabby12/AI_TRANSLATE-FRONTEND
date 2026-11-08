import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, configurarSesion, ErrorApi, type Sesion, type Usuario } from "./api";

const CLAVE_TOKEN = "traductor.token";

interface ContextoAuth {
  usuario: Usuario | null;
  /** true mientras se valida el token guardado al abrir la app */
  cargando: boolean;
  /** El servidor no respondió al validar la sesión guardada (la sesión sigue guardada). */
  errorConexion: string | null;
  reintentarConexion: () => void;
  iniciarSesion: (email: string, password: string, recordar?: boolean) => Promise<void>;
  registrarse: (nombre: string, email: string, password: string, recordar?: boolean) => Promise<void>;
  cerrarSesion: () => void;
}

const Contexto = createContext<ContextoAuth | null>(null);

// Con "Recordarme" el token va a localStorage (persiste); sin él, a
// sessionStorage (se borra al cerrar el navegador).
function leerToken(): string | null {
  try {
    return localStorage.getItem(CLAVE_TOKEN) ?? sessionStorage.getItem(CLAVE_TOKEN);
  } catch {
    return null;
  }
}

function guardarToken(token: string | null, recordar = true) {
  try {
    localStorage.removeItem(CLAVE_TOKEN);
    sessionStorage.removeItem(CLAVE_TOKEN);
    if (token) (recordar ? localStorage : sessionStorage).setItem(CLAVE_TOKEN, token);
  } catch {
    /* sin almacenamiento: la sesión dura lo que la pestaña */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorConexion, setErrorConexion] = useState<string | null>(null);
  const [ciclo, setCiclo] = useState(0); // incrementarlo repite la validación

  const cerrarSesion = useCallback(() => {
    guardarToken(null);
    configurarSesion(null);
    setUsuario(null);
    setErrorConexion(null);
  }, []);

  // Al abrir la app: si hay un token guardado, se valida con /auth/yo.
  useEffect(() => {
    const token = leerToken();
    configurarSesion(token, cerrarSesion);
    if (!token) {
      setCargando(false);
      return;
    }
    setCargando(true);
    setErrorConexion(null);
    // Un 401 cierra la sesión por sí solo (ver pedir() en api.ts). Un fallo de
    // red o del servidor no borra el token: se ofrece reintentar.
    api
      .yo()
      .then(setUsuario, (err) => {
        if (!(err instanceof ErrorApi && err.status === 401)) {
          setErrorConexion(err instanceof Error ? err.message : String(err));
        }
      })
      .finally(() => setCargando(false));
  }, [cerrarSesion, ciclo]);

  const abrir = useCallback(({ token, usuario }: Sesion, recordar = true) => {
    guardarToken(token, recordar);
    configurarSesion(token);
    setUsuario(usuario);
  }, []);

  const valor = useMemo<ContextoAuth>(
    () => ({
      usuario,
      cargando,
      errorConexion,
      reintentarConexion: () => setCiclo((c) => c + 1),
      iniciarSesion: async (email, password, recordar) => abrir(await api.login(email, password), recordar),
      registrarse: async (nombre, email, password, recordar) =>
        abrir(await api.registro(nombre, email, password), recordar),
      cerrarSesion,
    }),
    [usuario, cargando, errorConexion, abrir, cerrarSesion],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth(): ContextoAuth {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
