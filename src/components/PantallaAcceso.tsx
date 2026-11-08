import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../auth";
import { useT } from "../i18n";
import { BotonTema } from "./BotonTema";
import { IconoCandado, IconoCorreo, IconoFlecha, IconoOjo, IconoOjoTachado, IconoUsuario } from "./Iconos";
import { LogoSimbolo } from "./Logo";
import { SelectorIdioma } from "./SelectorIdioma";

type Modo = "login" | "registro";

export function PantallaAcceso() {
  const { iniciarSesion, registrarse } = useAuth();
  const [modo, setModo] = useState<Modo>("login");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lento, setLento] = useState(false);
  const [recordar, setRecordar] = useState(true);
  const t = useT();

  const esRegistro = modo === "registro";

  // Si el envío tarda, lo más probable es que la API esté despertando.
  useEffect(() => {
    if (!enviando) return setLento(false);
    const temporizador = setTimeout(() => setLento(true), 5_000);
    return () => clearTimeout(temporizador);
  }, [enviando]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      if (esRegistro) await registrarse(nombre.trim(), email.trim(), password, recordar);
      else await iniciarSesion(email.trim(), password, recordar);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setEnviando(false);
    }
  }

  function cambiarModo(nuevo: Modo) {
    setModo(nuevo);
    setError(null);
  }

  return (
    <main className="acceso">
      <div className="acceso-tema">
        <SelectorIdioma />
        <BotonTema />
      </div>

      <div className="acceso-contenido">
        <div className="logo-baldosa">
          <LogoSimbolo tamano={88} />
        </div>
        <h1 className="acceso-titulo">{esRegistro ? t("acceso.creaCuenta") : t("acceso.bienvenida")}</h1>
        <p className="acceso-subtitulo">{esRegistro ? t("acceso.subtituloRegistro") : t("acceso.subtituloLogin")}</p>

        <form className="acceso-formulario" onSubmit={enviar}>
          {esRegistro && (
            <label className="campo-icono">
              <IconoUsuario />
              <input
                aria-label={t("acceso.nombre")}
                placeholder={t("acceso.nombre")}
                autoComplete="name"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                maxLength={100}
              />
            </label>
          )}

          <label className="campo-icono">
            <IconoCorreo />
            <input
              type="email"
              aria-label={t("acceso.email")}
              placeholder={t("acceso.email")}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="campo-icono">
            <IconoCandado />
            <input
              type={verPassword ? "text" : "password"}
              aria-label={t("acceso.contrasena")}
              placeholder={esRegistro ? t("acceso.contrasenaRegistro") : t("acceso.contrasena")}
              autoComplete={esRegistro ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={esRegistro ? 8 : undefined}
              required
            />
            <button
              type="button"
              className="boton-ojo"
              onClick={() => setVerPassword((v) => !v)}
              aria-label={verPassword ? t("acceso.ocultarContrasena") : t("acceso.mostrarContrasena")}
            >
              {verPassword ? <IconoOjoTachado /> : <IconoOjo />}
            </button>
          </label>

          <label className="recordarme">
            <input type="checkbox" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} />
            <span>{t("acceso.recordarme")}</span>
          </label>

          {error && <p className="error">{error}</p>}
          {lento && (
            <p className="aviso-suave">{t("acceso.despertando")}</p>
          )}

          <button type="submit" className="primario boton-acceso" disabled={enviando}>
            <span>{enviando ? t("acceso.unMomento") : esRegistro ? t("acceso.crearCuenta") : t("acceso.entrar")}</span>
            <span className="boton-acceso-flecha" aria-hidden>
              <IconoFlecha />
            </span>
          </button>
        </form>

        <p className="acceso-cambiar">
          {esRegistro ? t("acceso.yaTienesCuenta") : t("acceso.noTienesCuenta")}{" "}
          <button type="button" className="boton-texto" onClick={() => cambiarModo(esRegistro ? "login" : "registro")}>
            {esRegistro ? t("acceso.iniciaSesion") : t("acceso.registrate")}
          </button>
        </p>

        <p className="acceso-lema">{t("acceso.lema")}</p>
      </div>
    </main>
  );
}
