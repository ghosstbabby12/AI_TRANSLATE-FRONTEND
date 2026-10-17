import type { ReactNode } from "react";
import { useTema, type Tema } from "../hooks/useTema";
import { IconoLuna, IconoMonitor, IconoSol } from "./Iconos";

const OPCIONES: { valor: Tema; etiqueta: string; icono: ReactNode }[] = [
  { valor: "claro", etiqueta: "Claro", icono: <IconoSol /> },
  { valor: "oscuro", etiqueta: "Oscuro", icono: <IconoLuna /> },
  { valor: "sistema", etiqueta: "Sistema", icono: <IconoMonitor /> },
];

/** Control segmentado en forma de píldora. `conEtiquetas` muestra el texto junto al icono. */
export function SelectorTema({ conEtiquetas = false }: { conEtiquetas?: boolean }) {
  const [tema, setTema] = useTema();
  return (
    <div className={`selector-tema ${conEtiquetas ? "con-etiquetas" : ""}`} role="group" aria-label="Tema">
      {OPCIONES.map((o) => (
        <button
          key={o.valor}
          type="button"
          aria-pressed={tema === o.valor}
          aria-label={`Tema ${o.etiqueta.toLowerCase()}`}
          title={conEtiquetas ? undefined : `Tema ${o.etiqueta.toLowerCase()}`}
          onClick={() => setTema(o.valor)}
        >
          {o.icono}
          {conEtiquetas && <span>{o.etiqueta}</span>}
        </button>
      ))}
    </div>
  );
}
