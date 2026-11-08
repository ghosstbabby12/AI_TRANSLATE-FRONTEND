import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, configurarSesion, ErrorApi, type Sesion, type Usuario } from "./api";
import { useIdioma, type IdiomaUi } from "./i18n";

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
  /** Reemplaza los datos del usuario tras editar el perfil. */
  actualizarUsuario: (usuario: Usuario) => void;
  /** Cambia el idioma de la interfaz y, con sesión, lo guarda en el perfil. */
  cambiarIdioma: (idioma: IdiomaUi) => void;
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
  const { idioma, setIdioma } = useIdioma();

  // El idioma guardado en el perfil manda: así la cuenta se ve igual en cualquier equipo.
  const recibirUsuario = useCallback(
    (u: Usuario) => {
      setUsuario(u);
      if (u.idioma_interfaz === "es" || u.idioma_interfaz === "en") setIdioma(u.idioma_interfaz);
    },
    [setIdioma],
  );

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
      .then(recibirUsuario, (err) => {
        if (!(err instanceof ErrorApi && err.status === 401)) {
          setErrorConexion(err instanceof Error ? err.message : String(err));
        }
      })
      .finally(() => setCargando(false));
  }, [cerrarSesion, recibirUsuario, ciclo]);

  const abrir = useCallback(
    ({ token, usuario }: Sesion, recordar = true) => {
      guardarToken(token, recordar);
      configurarSesion(token);
      recibirUsuario(usuario);
    },
    [recibirUsuario],
  );

  const cambiarIdioma = useCallback(
    (nuevo: IdiomaUi) => {
      setIdioma(nuevo);
      if (!usuario || usuario.idioma_interfaz === nuevo) return;
      setUsuario({ ...usuario, idioma_interfaz: nuevo });
      // Si falla (p. ej. sin conexión), el cambio sigue aplicado en este equipo
      api.actualizarPerfil({ idioma_interfaz: nuevo }).catch(() => {});
    },
    [usuario, setIdioma],
  );

  const valor = useMemo<ContextoAuth>(
    () => ({
      usuario,
      cargando,
      errorConexion,
      reintentarConexion: () => setCiclo((c) => c + 1),
      iniciarSesion: async (email, password, recordar) => abrir(await api.login(email, password), recordar),
      registrarse: async (nombre, email, password, recordar) => {
        const sesion = await api.registro(nombre, email, password);
        // La cuenta nueva adopta el idioma con el que se registró
        abrir({ ...sesion, usuario: { ...sesion.usuario, idioma_interfaz: idioma } }, recordar);
        if (sesion.usuario.idioma_interfaz !== idioma) {
          api.actualizarPerfil({ idioma_interfaz: idioma }).catch(() => {});
        }
      },
      cerrarSesion,
      actualizarUsuario: recibirUsuario,
      cambiarIdioma,
    }),
    [usuario, cargando, errorConexion, abrir, cerrarSesion, recibirUsuario, cambiarIdioma, idioma],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth(): ContextoAuth {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
