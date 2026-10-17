import { useEffect, useRef, useState } from "react";
import type { Usuario } from "../api";
import { IconoPuntos, IconoSalir } from "./Iconos";
import { SelectorTema } from "./SelectorTema";

interface Props {
  usuario: Usuario;
  onSalir: () => void;
}

/** Botón flotante "•••" que abre un panel con la cuenta, el tema y Salir. */
export function MenuUsuario({ usuario, onSalir }: Props) {
  const [abierto, setAbierto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);

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

  const inicial = usuario.nombre.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="menu-usuario" ref={raiz}>
      <button
        type="button"
        className="boton-flotante boton-mas"
        aria-label="Menú de la cuenta"
        aria-expanded={abierto}
        aria-haspopup="true"
        onClick={() => setAbierto((a) => !a)}
      >
        <IconoPuntos />
      </button>

      {abierto && (
        <div className="popover" role="menu">
          <div className="popover-cuenta">
            <span className="avatar" aria-hidden>
              {inicial}
            </span>
            <div>
              <strong>{usuario.nombre}</strong>
              <span className="sutil">{usuario.email}</span>
            </div>
          </div>
          <div className="popover-seccion">
            <span className="popover-titulo">Tema</span>
            <SelectorTema conEtiquetas />
          </div>
          <button type="button" className="secundario ancho" role="menuitem" onClick={onSalir}>
            <IconoSalir />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
