import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../auth";
import { BotonTema } from "./BotonTema";
import { IconoCandado, IconoCorreo, IconoFlecha, IconoOjo, IconoOjoTachado, IconoUsuario } from "./Iconos";
import { LogoSimbolo } from "./Logo";

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

  const esRegistro = modo === "registro";

  // Si el envío tarda, lo más probable es que la API esté despertando.
  useEffect(() => {
    if (!enviando) return setLento(false);
    const t = setTimeout(() => setLento(true), 5_000);
    return () => clearTimeout(t);
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
        <BotonTema />
      </div>

      <div className="acceso-contenido">
        <div className="logo-baldosa">
          <LogoSimbolo tamano={88} />
        </div>
        <h1 className="acceso-titulo">{esRegistro ? "Crea tu cuenta" : "Bienvenido de nuevo"}</h1>
        <p className="acceso-subtitulo">{esRegistro ? "Empieza a traducir tus videos" : "Inicia sesión para continuar"}</p>

        <form className="acceso-formulario" onSubmit={enviar}>
          {esRegistro && (
            <label className="campo-icono">
              <IconoUsuario />
              <input
                aria-label="Nombre"
                placeholder="Tu nombre"
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
              aria-label="Email"
              placeholder="Email"
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
              aria-label="Contraseña"
              placeholder={esRegistro ? "Contraseña (mínimo 8 caracteres)" : "Contraseña"}
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
              aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {verPassword ? <IconoOjoTachado /> : <IconoOjo />}
            </button>
          </label>

          <label className="recordarme">
            <input type="checkbox" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} />
            <span>Recordarme en este equipo</span>
          </label>

          {error && <p className="error">{error}</p>}
          {lento && (
            <p className="aviso-suave">El servidor está despertando; la primera vez puede tardar hasta un minuto.</p>
          )}

          <button type="submit" className="primario boton-acceso" disabled={enviando}>
            <span>{enviando ? "Un momento…" : esRegistro ? "Crear cuenta" : "Entrar"}</span>
            <span className="boton-acceso-flecha" aria-hidden>
              <IconoFlecha />
            </span>
          </button>
        </form>

        <p className="acceso-cambiar">
          {esRegistro ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
          <button type="button" className="boton-texto" onClick={() => cambiarModo(esRegistro ? "login" : "registro")}>
            {esRegistro ? "Inicia sesión" : "Regístrate"}
          </button>
        </p>

        <p className="acceso-lema">Transcribe · Traduce · Comparte</p>
      </div>
    </main>
  );
}
