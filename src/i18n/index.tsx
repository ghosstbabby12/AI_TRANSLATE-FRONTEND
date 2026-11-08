import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en, erroresServidorEn } from "./en";
import { es } from "./es";

export type IdiomaUi = "es" | "en";
export type Clave = keyof typeof es;
type Variables = Record<string, string | number>;

const DICCIONARIOS: Record<IdiomaUi, Record<Clave, string>> = { es, en };
const CLAVE_ALMACEN = "traductor.idioma";

function idiomaInicial(): IdiomaUi {
  try {
    const guardado = localStorage.getItem(CLAVE_ALMACEN);
    if (guardado === "es" || guardado === "en") return guardado;
  } catch {
    /* sin almacenamiento */
  }
  return navigator.language?.toLowerCase().startsWith("en") ? "en" : "es";
}

// Estado a nivel de módulo: lo usan también funciones fuera de React
// (mensajes del cliente de la API, títulos de videos).
let actual: IdiomaUi = idiomaInicial();

/** Traduce una clave, sustituyendo {variables}. Usable fuera de componentes. */
export function traducir(clave: Clave, vars?: Variables): string {
  const texto = DICCIONARIOS[actual][clave] ?? es[clave] ?? clave;
  return vars ? texto.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`)) : texto;
}

export const idiomaActual = () => actual;

/** Los mensajes de error llegan del servidor en español: se traducen los conocidos. */
export function traducirMensajeServidor(mensaje: string): string {
  return actual === "en" ? (erroresServidorEn[mensaje] ?? mensaje) : mensaje;
}

/** "en" → "Inglés" / "English", con los nombres que ya trae el navegador. */
export function nombreIdioma(codigo: string): string {
  try {
    const nombre = new Intl.DisplayNames([actual], { type: "language" }).of(codigo) ?? codigo;
    return nombre.charAt(0).toUpperCase() + nombre.slice(1);
  } catch {
    return codigo.toUpperCase();
  }
}

interface ContextoIdioma {
  idioma: IdiomaUi;
  setIdioma: (idioma: IdiomaUi) => void;
  t: typeof traducir;
}

const Contexto = createContext<ContextoIdioma | null>(null);

export function IdiomaProvider({ children }: { children: ReactNode }) {
  const [idioma, setEstado] = useState<IdiomaUi>(actual);

  const setIdioma = useCallback((nuevo: IdiomaUi) => {
    actual = nuevo;
    setEstado(nuevo);
    try {
      localStorage.setItem(CLAVE_ALMACEN, nuevo);
    } catch {
      /* sin almacenamiento */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = idioma;
    document.title = traducir("app.tituloPestana");
  }, [idioma]);

  // `t` cambia de identidad con el idioma: los componentes que lo usan se vuelven a pintar
  const valor = useMemo<ContextoIdioma>(
    () => ({ idioma, setIdioma, t: (clave, vars) => traducir(clave, vars) }),
    [idioma, setIdioma],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useIdioma(): ContextoIdioma {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useIdioma debe usarse dentro de <IdiomaProvider>");
  return ctx;
}

/** Atajo: const t = useT(); t("clave") */
export const useT = () => useIdioma().t;
