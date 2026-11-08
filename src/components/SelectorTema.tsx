import type { ReactNode } from "react";
import { useT, type Clave } from "../i18n";
import { useTema, type Tema } from "../hooks/useTema";
import { IconoLuna, IconoMonitor, IconoSol } from "./Iconos";

const OPCIONES: { valor: Tema; etiqueta: Clave; icono: ReactNode }[] = [
  { valor: "claro", etiqueta: "tema.claro", icono: <IconoSol /> },
  { valor: "oscuro", etiqueta: "tema.oscuro", icono: <IconoLuna /> },
  { valor: "sistema", etiqueta: "tema.sistema", icono: <IconoMonitor /> },
];

/** Control segmentado en forma de píldora. `conEtiquetas` muestra el texto junto al icono. */
export function SelectorTema({ conEtiquetas = false }: { conEtiquetas?: boolean }) {
  const [tema, setTema] = useTema();
  const t = useT();
  return (
    <div className={`selector-tema ${conEtiquetas ? "con-etiquetas" : ""}`} role="group" aria-label={t("menu.tema")}>
      {OPCIONES.map((o) => {
        const etiqueta = t(o.etiqueta);
        const nombre = t("tema.etiqueta", { nombre: etiqueta.toLowerCase() });
        return (
        <button
          key={o.valor}
          type="button"
          aria-pressed={tema === o.valor}
          aria-label={nombre}
          title={conEtiquetas ? undefined : nombre}
          onClick={() => setTema(o.valor)}
        >
          {o.icono}
          {conEtiquetas && <span>{etiqueta}</span>}
        </button>
        );
      })}
    </div>
  );
}
