import { useAuth } from "../auth";
import { useIdioma, useT, type IdiomaUi } from "../i18n";

const OPCIONES: { valor: IdiomaUi; corto: string; nombre: string }[] = [
  { valor: "es", corto: "ES", nombre: "Español" },
  { valor: "en", corto: "EN", nombre: "English" },
];

/**
 * Píldora ES / EN. Con sesión iniciada el idioma se guarda también en el perfil.
 * `conEtiquetas` muestra el nombre completo del idioma.
 */
export function SelectorIdioma({ conEtiquetas = false }: { conEtiquetas?: boolean }) {
  const { idioma } = useIdioma();
  const { cambiarIdioma } = useAuth();
  const t = useT();
  return (
    <div className={`selector-tema selector-idioma ${conEtiquetas ? "con-etiquetas" : ""}`} role="group" aria-label={t("idioma.cambiar")}>
      {OPCIONES.map((o) => (
        <button
          key={o.valor}
          type="button"
          lang={o.valor}
          aria-pressed={idioma === o.valor}
          aria-label={o.nombre}
          title={o.nombre}
          onClick={() => cambiarIdioma(o.valor)}
        >
          <span className="codigo-idioma">{o.corto}</span>
          {conEtiquetas && <span>{o.nombre}</span>}
        </button>
      ))}
    </div>
  );
}
