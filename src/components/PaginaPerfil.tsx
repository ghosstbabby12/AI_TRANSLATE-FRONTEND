import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { api, type CambiosPerfil } from "../api";
import { useAuth } from "../auth";
import { idiomaActual, useIdioma, useT, type IdiomaUi } from "../i18n";
import { Avatar } from "./Avatar";
import {
  IconoCamara,
  IconoCandado,
  IconoCorreo,
  IconoEliminar,
  IconoEscudo,
  IconoGlobo,
  IconoOjo,
  IconoOjoTachado,
  IconoTelefono,
  IconoUsuario,
} from "./Iconos";

const MAX_FOTO = 5 * 1024 * 1024;

type Aviso = { tipo: "ok" | "error"; texto: string } | null;

function mensaje(e: unknown) {
  return e instanceof Error ? e.message : String(e);
}

function MensajeEstado({ aviso }: { aviso: Aviso }) {
  if (!aviso) return null;
  return (
    <p className={aviso.tipo === "ok" ? "exito" : "error"} role={aviso.tipo === "ok" ? "status" : "alert"}>
      {aviso.texto}
    </p>
  );
}

/** Campo con icono a la izquierda y botón de ojo opcional (para contraseñas). */
function Campo({ etiqueta, icono, extra, children }: { etiqueta: ReactNode; icono: ReactNode; extra?: ReactNode; children: ReactNode }) {
  return (
    <label className="campo campo-perfil">
      <span>{etiqueta}</span>
      <span className="campo-icono campo-icono-compacto">
        {icono}
        {children}
        {extra}
      </span>
    </label>
  );
}

function CampoContrasena({ etiqueta, valor, onCambio, autoComplete, minimo }: {
  etiqueta: string;
  valor: string;
  onCambio: (v: string) => void;
  autoComplete: string;
  minimo?: number;
}) {
  const [ver, setVer] = useState(false);
  const t = useT();
  return (
    <Campo
      etiqueta={etiqueta}
      icono={<IconoCandado />}
      extra={
        <button
          type="button"
          className="boton-ojo"
          onClick={() => setVer((v) => !v)}
          aria-label={ver ? t("acceso.ocultarContrasena") : t("acceso.mostrarContrasena")}
        >
          {ver ? <IconoOjoTachado /> : <IconoOjo />}
        </button>
      }
    >
      <input
        type={ver ? "text" : "password"}
        value={valor}
        autoComplete={autoComplete}
        minLength={minimo}
        maxLength={200}
        required
        onChange={(e) => onCambio(e.target.value)}
      />
    </Campo>
  );
}

/** Foto de perfil: subir/cambiar y quitar. */
function TarjetaFoto() {
  const { usuario, actualizarUsuario } = useAuth();
  const t = useT();
  const entrada = useRef<HTMLInputElement>(null);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<Aviso>(null);
  if (!usuario) return null;

  async function ejecutar(accion: () => Promise<void>) {
    setAviso(null);
    setOcupado(true);
    try {
      await accion();
    } catch (e) {
      setAviso({ tipo: "error", texto: mensaje(e) });
    } finally {
      setOcupado(false);
    }
  }

  function elegir(archivo: File | undefined) {
    if (entrada.current) entrada.current.value = ""; // permite volver a elegir el mismo archivo
    if (!archivo) return;
    if (archivo.size > MAX_FOTO) return setAviso({ tipo: "error", texto: t("perfil.fotoGrande") });
    ejecutar(async () => actualizarUsuario(await api.subirFoto(archivo)));
  }

  const miembroDesde = new Intl.DateTimeFormat(idiomaActual(), { dateStyle: "long" }).format(new Date(usuario.creado_en));

  return (
    <section className="tarjeta perfil-tarjeta perfil-identidad">
      <div className="perfil-foto">
        <Avatar usuario={usuario} grande />
        <button
          type="button"
          className="perfil-foto-boton"
          aria-label={usuario.url_foto ? t("perfil.cambiarFoto") : t("perfil.subirFoto")}
          onClick={() => entrada.current?.click()}
          disabled={ocupado}
        >
          {ocupado ? <span className="cargador cargador-boton" aria-hidden /> : <IconoCamara />}
        </button>
      </div>
      <h2>{usuario.nombre}</h2>
      <p className="sutil">{usuario.email}</p>
      <p className="perfil-miembro">{t("perfil.miembroDesde", { fecha: miembroDesde })}</p>

      <input
        ref={entrada}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        hidden
        onChange={(e) => elegir(e.target.files?.[0])}
      />
      <div className="perfil-foto-acciones">
        <button type="button" className="primario" onClick={() => entrada.current?.click()} disabled={ocupado}>
          <IconoCamara />
          {ocupado ? t("perfil.subiendoFoto") : usuario.url_foto ? t("perfil.cambiarFoto") : t("perfil.subirFoto")}
        </button>
        {usuario.url_foto && (
          <button
            type="button"
            className="secundario"
            onClick={() => ejecutar(async () => actualizarUsuario(await api.quitarFoto()))}
            disabled={ocupado}
          >
            <IconoEliminar />
            {t("perfil.quitarFoto")}
          </button>
        )}
      </div>
      <p className="sutil perfil-ayuda">{t("perfil.fotoAyuda")}</p>
      <MensajeEstado aviso={aviso} />
    </section>
  );
}

/** Nombre, email, teléfono e idioma. */
function TarjetaDatos() {
  const { usuario, actualizarUsuario } = useAuth();
  const { setIdioma } = useIdioma();
  const t = useT();
  const [nombre, setNombre] = useState(usuario?.nombre ?? "");
  const [email, setEmail] = useState(usuario?.email ?? "");
  const [telefono, setTelefono] = useState(usuario?.telefono ?? "");
  const [idioma, setIdiomaForm] = useState<IdiomaUi>(usuario?.idioma_interfaz ?? idiomaActual());
  const [contrasena, setContrasena] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<Aviso>(null);
  if (!usuario) return null;

  const emailCambia = email.trim().toLowerCase() !== usuario.email;

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!usuario) return;
    const cambios: CambiosPerfil = {};
    if (nombre.trim() !== usuario.nombre) cambios.nombre = nombre.trim();
    if (emailCambia) {
      cambios.email = email.trim();
      cambios.contrasena_actual = contrasena;
    }
    if (telefono.trim() !== (usuario.telefono ?? "")) cambios.telefono = telefono.trim() || null;
    if (idioma !== usuario.idioma_interfaz) cambios.idioma_interfaz = idioma;
    if (Object.keys(cambios).length === 0) return setAviso({ tipo: "ok", texto: t("perfil.sinCambios") });

    setAviso(null);
    setGuardando(true);
    try {
      const actualizado = await api.actualizarPerfil(cambios);
      actualizarUsuario(actualizado); // aplica también el idioma guardado
      setIdioma(actualizado.idioma_interfaz);
      setNombre(actualizado.nombre);
      setEmail(actualizado.email);
      setTelefono(actualizado.telefono ?? "");
      setContrasena("");
      // El texto se pide después de cambiar el idioma, para mostrarlo ya en el nuevo
      setAviso({ tipo: "ok", texto: "perfil.guardado" });
    } catch (err) {
      setAviso({ tipo: "error", texto: mensaje(err) });
    } finally {
      setGuardando(false);
    }
  }

  const avisoVisible: Aviso =
    aviso?.texto === "perfil.guardado" ? { tipo: "ok", texto: t("perfil.guardado") } : aviso;

  return (
    <section className="tarjeta perfil-tarjeta">
      <header className="perfil-tarjeta-cabecera">
        <span className="ventaja-icono" aria-hidden>
          <IconoUsuario />
        </span>
        <h2>{t("perfil.datos")}</h2>
      </header>
      <form className="perfil-formulario" onSubmit={guardar}>
        <Campo etiqueta={t("perfil.nombre")} icono={<IconoUsuario />}>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" required maxLength={100} />
        </Campo>
        <Campo etiqueta={t("perfil.email")} icono={<IconoCorreo />}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required maxLength={254} />
        </Campo>
        {emailCambia && (
          <CampoContrasena
            etiqueta={t("perfil.confirmaContrasena")}
            valor={contrasena}
            onCambio={setContrasena}
            autoComplete="current-password"
          />
        )}
        <Campo
          etiqueta={
            <>
              {t("perfil.telefono")} <span className="etiqueta-opcional">({t("perfil.opcional")})</span>
            </>
          }
          icono={<IconoTelefono />}
        >
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            autoComplete="tel"
            placeholder={t("perfil.telefonoEjemplo")}
            maxLength={20}
            pattern="\+?[\d\s\-()]{7,20}"
          />
        </Campo>
        <Campo etiqueta={t("perfil.idiomaInterfaz")} icono={<IconoGlobo />}>
          <select value={idioma} onChange={(e) => setIdiomaForm(e.target.value as IdiomaUi)}>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </Campo>
        <MensajeEstado aviso={avisoVisible} />
        <div className="perfil-acciones">
          <button type="submit" className="primario" disabled={guardando}>
            {guardando ? t("comun.guardando") : t("perfil.guardarCambios")}
          </button>
        </div>
      </form>
    </section>
  );
}

/** Cambio de contraseña: actual + nueva + confirmación. */
function TarjetaContrasena() {
  const t = useT();
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState<Aviso>(null);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (nueva.length < 8) return setAviso({ tipo: "error", texto: t("perfil.muyCorta") });
    if (nueva !== confirmar) return setAviso({ tipo: "error", texto: t("perfil.noCoinciden") });
    setAviso(null);
    setGuardando(true);
    try {
      await api.cambiarContrasena(actual, nueva);
      setActual("");
      setNueva("");
      setConfirmar("");
      setAviso({ tipo: "ok", texto: t("perfil.contrasenaActualizada") });
    } catch (err) {
      setAviso({ tipo: "error", texto: mensaje(err) });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="tarjeta perfil-tarjeta">
      <header className="perfil-tarjeta-cabecera">
        <span className="ventaja-icono" aria-hidden>
          <IconoEscudo />
        </span>
        <h2>{t("perfil.seguridad")}</h2>
      </header>
      <form className="perfil-formulario" onSubmit={guardar}>
        {/* Ayuda a los gestores de contraseñas a asociar la cuenta */}
        <input type="text" autoComplete="username" hidden readOnly value="" />
        <CampoContrasena etiqueta={t("perfil.contrasenaActual")} valor={actual} onCambio={setActual} autoComplete="current-password" />
        <CampoContrasena etiqueta={t("perfil.contrasenaNueva")} valor={nueva} onCambio={setNueva} autoComplete="new-password" minimo={8} />
        <CampoContrasena etiqueta={t("perfil.contrasenaConfirmar")} valor={confirmar} onCambio={setConfirmar} autoComplete="new-password" minimo={8} />
        <MensajeEstado aviso={aviso} />
        <div className="perfil-acciones">
          <button type="submit" className="primario" disabled={guardando}>
            {guardando ? t("comun.guardando") : t("perfil.actualizarContrasena")}
          </button>
        </div>
      </form>
    </section>
  );
}

export function PaginaPerfil() {
  const t = useT();
  return (
    <section className="perfil-vista">
      <header className="titulo-seccion">
        <h1>{t("perfil.titulo")}</h1>
        <p className="sutil">{t("perfil.subtitulo")}</p>
      </header>
      <div className="perfil-rejilla">
        <TarjetaFoto />
        <div className="perfil-columna">
          <TarjetaDatos />
          <TarjetaContrasena />
        </div>
      </div>
    </section>
  );
}
