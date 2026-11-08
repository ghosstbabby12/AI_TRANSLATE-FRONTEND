import { useEffect, useRef, useState } from "react";
import type { Usuario } from "../api";
import { navegar } from "../hooks/useRuta";
import { useT } from "../i18n";
import { Avatar } from "./Avatar";
import { IconoPuntos, IconoSalir, IconoUsuario } from "./Iconos";
import { SelectorIdioma } from "./SelectorIdioma";
import { SelectorTema } from "./SelectorTema";

interface Props {
  usuario: Usuario;
  onSalir: () => void;
}

/** Botón flotante con la foto de perfil: abre un panel con la cuenta, el perfil, el tema, el idioma y Salir. */
export function MenuUsuario({ usuario, onSalir }: Props) {
  const [abierto, setAbierto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const t = useT();

  // Se cierra al hacer clic fuera o con Escape.
  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setAbierto(false);
    };
    const escape = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      document.removeEventListener("keydown", escape);
    };
  }, [abierto]);

  return (
    <div className="menu-usuario" ref={raiz}>
      <button
        type="button"
        className={`boton-flotante boton-mas ${usuario.url_foto ? "con-foto" : ""}`}
        aria-label={t("menu.cuenta")}
        aria-expanded={abierto}
        aria-haspopup="true"
        onClick={() => setAbierto((a) => !a)}
      >
        {usuario.url_foto ? <Avatar usuario={usuario} /> : <IconoPuntos />}
      </button>

      {abierto && (
        <div className="popover" role="menu">
          <div className="popover-cuenta">
            <Avatar usuario={usuario} />
            <div>
              <strong>{usuario.nombre}</strong>
              <span className="sutil">{usuario.email}</span>
            </div>
          </div>
          <button
            type="button"
            className="secundario ancho"
            role="menuitem"
            onClick={() => {
              setAbierto(false);
              navegar("/perfil");
            }}
          >
            <IconoUsuario />
            {t("menu.miPerfil")}
          </button>
          <div className="popover-seccion">
            <span className="popover-titulo">{t("menu.tema")}</span>
            <SelectorTema conEtiquetas />
          </div>
          <div className="popover-seccion">
            <span className="popover-titulo">{t("menu.idioma")}</span>
            <SelectorIdioma conEtiquetas />
          </div>
          <button type="button" className="secundario ancho" role="menuitem" onClick={onSalir}>
            <IconoSalir />
            {t("menu.cerrarSesion")}
          </button>
        </div>
      )}
    </div>
  );
}
