import { useTema } from "../hooks/useTema";
import { useT } from "../i18n";
import { IconoLuna, IconoSol } from "./Iconos";

/** Botón redondo que alterna claro/oscuro (el modo "sistema" sigue en el menú de la cuenta). */
export function BotonTema() {
  const [tema, setTema] = useTema();
  const t = useT();
  const oscuroAhora =
    tema === "oscuro" || (tema === "sistema" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  return (
    <button
      type="button"
      className="boton-tema"
      aria-label={oscuroAhora ? t("tema.cambiarAClaro") : t("tema.cambiarAOscuro")}
      title={oscuroAhora ? t("tema.cambiarAClaro") : t("tema.cambiarAOscuro")}
      onClick={() => setTema(oscuroAhora ? "claro" : "oscuro")}
    >
      {oscuroAhora ? <IconoSol /> : <IconoLuna />}
    </button>
  );
}
