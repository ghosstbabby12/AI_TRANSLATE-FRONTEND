import { useAuth } from "./auth";
import { FormularioNuevo } from "./components/FormularioNuevo";
import { Historial } from "./components/Historial";
import { IconoHistorial, IconoMas, IconoTraducir } from "./components/Iconos";
import { Logo } from "./components/Logo";
import { MenuUsuario } from "./components/MenuUsuario";
import { PantallaAcceso } from "./components/PantallaAcceso";
import { PantallaEspera, PantallaSinConexion } from "./components/PantallaEspera";
import { VistaVideo } from "./components/VistaVideo";
import { navegar, useRuta } from "./hooks/useRuta";

export function App() {
  const { usuario, cargando, errorConexion, reintentarConexion, cerrarSesion } = useAuth();
  const ruta = useRuta();

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
          <span className="marca-texto">Traductor de Video</span>
        </a>

        {/* Dock de navegación: el destino activo queda "levantado" en una burbuja */}
        <nav className="dock" aria-label="Principal">
          <a href="#/" className={ruta.vista === "nuevo" ? "activo" : ""} data-tip="Traducir video">
            <IconoTraducir />
            <span className="dock-etiqueta">Traducir</span>
          </a>
          <a href="#/historial" className={ruta.vista === "historial" ? "activo" : ""} data-tip="Historial">
            <IconoHistorial />
            <span className="dock-etiqueta">Historial</span>
          </a>
        </nav>

        <MenuUsuario usuario={usuario} onSalir={cerrarSesion} />
      </header>

      <main>
        {ruta.vista === "nuevo" && <FormularioNuevo />}
        {ruta.vista === "historial" && <Historial />}
        {/* key: al cambiar de video se reinicia todo el estado de la vista */}
        {ruta.vista === "video" && <VistaVideo key={ruta.id} id={ruta.id} />}
      </main>

      {ruta.vista !== "nuevo" && (
        <button type="button" className="fab" onClick={() => navegar("/")} aria-label="Traducir un video nuevo">
          <IconoMas />
          <span>Nuevo video</span>
        </button>
      )}
    </>
  );
}
