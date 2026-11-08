import { useEffect, useState } from "react";
import { Logo } from "./Logo";

/**
 * "Cargando…" que, si tarda, explica por qué: el plan gratuito duerme la API
 * y la primera petición puede tardar hasta un minuto.
 */
export function PantallaEspera() {
  const [lenta, setLenta] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLenta(true), 4_000);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="acceso">
      <div className="tarjeta pantalla-estado">
        <Logo />
        <span className="cargador cargador-acento" aria-hidden />
        <p>{lenta ? "Despertando el servidor…" : "Cargando…"}</p>
        {lenta && <p className="sutil">Si estuvo inactivo, puede tardar hasta un minuto la primera vez.</p>}
      </div>
    </main>
  );
}

interface PropsSinConexion {
  mensaje: string;
  onReintentar: () => void;
  onCambiarCuenta: () => void;
}

/** El servidor no respondió al abrir la app: la sesión sigue guardada, se puede reintentar. */
export function PantallaSinConexion({ mensaje, onReintentar, onCambiarCuenta }: PropsSinConexion) {
  return (
    <main className="acceso">
      <div className="tarjeta pantalla-estado">
        <Logo />
        <h1>No pudimos conectar</h1>
        <p className="sutil">{mensaje}</p>
        <button type="button" className="primario grande" onClick={onReintentar}>
          Reintentar
        </button>
        <button type="button" className="boton-texto" onClick={onCambiarCuenta}>
          Entrar con otra cuenta
        </button>
      </div>
    </main>
  );
}
