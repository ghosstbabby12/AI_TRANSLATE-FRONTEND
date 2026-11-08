import { useEffect, useState } from "react";
import { useT } from "../i18n";
import { Logo } from "./Logo";

/**
 * "Cargando…" que, si tarda, explica por qué: el plan gratuito duerme la API
 * y la primera petición puede tardar hasta un minuto.
 */
export function PantallaEspera() {
  const [lenta, setLenta] = useState(false);
  const t = useT();
  useEffect(() => {
    const temporizador = setTimeout(() => setLenta(true), 4_000);
    return () => clearTimeout(temporizador);
  }, []);

  return (
    <main className="acceso">
      <div className="tarjeta pantalla-estado">
        <Logo />
        <span className="cargador cargador-acento" aria-hidden />
        <p>{lenta ? t("conexion.despertando") : t("app.cargando")}</p>
        {lenta && <p className="sutil">{t("conexion.despertandoDetalle")}</p>}
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
  const t = useT();
  return (
    <main className="acceso">
      <div className="tarjeta pantalla-estado">
        <Logo />
        <h1>{t("conexion.sinConexionTitulo")}</h1>
        <p className="sutil">{mensaje}</p>
        <button type="button" className="primario grande" onClick={onReintentar}>
          {t("conexion.reintentar")}
        </button>
        <button type="button" className="boton-texto" onClick={onCambiarCuenta}>
          {t("conexion.otraCuenta")}
        </button>
      </div>
    </main>
  );
}
