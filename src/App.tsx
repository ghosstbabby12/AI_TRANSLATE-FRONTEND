import { useAuth } from "./auth";
import { FormularioNuevo } from "./components/FormularioNuevo";
import { Historial } from "./components/Historial";
import { IconoHistorial, IconoMas, IconoTraducir } from "./components/Iconos";
import { Logo } from "./components/Logo";
import { MenuUsuario } from "./components/MenuUsuario";
import { PantallaAcceso } from "./components/PantallaAcceso";
import { PantallaEspera, PantallaSinConexion } from "./components/PantallaEspera";
import { PaginaPerfil } from "./components/PaginaPerfil";
import { VistaVideo } from "./components/VistaVideo";
import { navegar, useRuta } from "./hooks/useRuta";
import { useT } from "./i18n";

export function App() {
  const { usuario, cargando, errorConexion, reintentarConexion, cerrarSesion } = useAuth();
  const ruta = useRuta();
  // Con useT, App se vuelve a pintar (con todos sus hijos) al cambiar de idioma
  const t = useT();

  if (cargando) return <PantallaEspera />;
  if (!usuario && errorConexion) {
    return <PantallaSinConexion mensaje={errorConexion} onReintentar={reintentarConexion} onCambiarCuenta={cerrarSesion} />;
  }
  if (!usuario) return <PantallaAcceso />;

  return (
    <>
      <header className="cabecera-flotante">
        <a href="#/" className="marca pildora">
          <Logo />
          <span className="marca-texto">{t("app.marca")}</span>
        </a>

        {/* Dock de navegación: el destino activo queda "levantado" en una burbuja */}
        <nav className="dock" aria-label={t("nav.principal")}>
          <a href="#/" className={ruta.vista === "nuevo" ? "activo" : ""} data-tip={t("nav.traducirVideo")}>
            <IconoTraducir />
            <span className="dock-etiqueta">{t("nav.traducir")}</span>
          </a>
          <a href="#/historial" className={ruta.vista === "historial" ? "activo" : ""} data-tip={t("nav.historial")}>
            <IconoHistorial />
            <span className="dock-etiqueta">{t("nav.historial")}</span>
          </a>
        </nav>

        <MenuUsuario usuario={usuario} onSalir={cerrarSesion} />
      </header>

      <main>
        {ruta.vista === "nuevo" && <FormularioNuevo />}
        {ruta.vista === "historial" && <Historial />}
        {ruta.vista === "perfil" && <PaginaPerfil />}
        {/* key: al cambiar de video se reinicia todo el estado de la vista */}
        {ruta.vista === "video" && <VistaVideo key={ruta.id} id={ruta.id} />}
      </main>

      {ruta.vista !== "nuevo" && (
        <button type="button" className="fab" onClick={() => navegar("/")} aria-label={t("nav.nuevoVideoAria")}>
          <IconoMas />
          <span>{t("nav.nuevoVideo")}</span>
        </button>
      )}
    </>
  );
}
