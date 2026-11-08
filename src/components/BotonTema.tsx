import { useTema } from "../hooks/useTema";
import { IconoLuna, IconoSol } from "./Iconos";

/** Botón redondo que alterna claro/oscuro (el modo "sistema" sigue en el menú de la cuenta). */
export function BotonTema() {
  const [tema, setTema] = useTema();
  const oscuroAhora =
    tema === "oscuro" || (tema === "sistema" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  return (
    <button
      type="button"
      className="boton-tema"
      aria-label={oscuroAhora ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={oscuroAhora ? "Tema claro" : "Tema oscuro"}
      onClick={() => setTema(oscuroAhora ? "claro" : "oscuro")}
    >
      {oscuroAhora ? <IconoSol /> : <IconoLuna />}
    </button>
  );
}
