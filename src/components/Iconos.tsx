import type { ReactNode, SVGProps } from "react";

// Iconos de trazo (24×24, heredan el color del texto). Un solo archivo para
// que toda la interfaz use el mismo grosor y estilo.
function Icono({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconoTraducir = () => (
  <Icono>
    <path d="M4 5h8M8 3v2M10.5 5c-.6 3.6-2.9 6.5-6 8M6 9c1.2 1.9 2.9 3.4 5 4.3" />
    <path d="m12.5 21 4-9 4 9M13.9 18h5.2" />
  </Icono>
);

export const IconoHistorial = () => (
  <Icono>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5M12 7v5l3 2" />
  </Icono>
);

export const IconoMas = () => (
  <Icono>
    <path d="M12 5v14M5 12h14" />
  </Icono>
);

export const IconoPuntos = () => (
  <Icono>
    <circle cx="5" cy="12" r="1.6" fill="currentColor" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    <circle cx="19" cy="12" r="1.6" fill="currentColor" />
  </Icono>
);

export const IconoSubir = () => (
  <Icono>
    <path d="M12 16V4M7 9l5-5 5 5" />
    <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </Icono>
);

export const IconoEnlace = () => (
  <Icono>
    <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
    <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
  </Icono>
);

export const IconoDescargar = () => (
  <Icono>
    <path d="M12 4v12M7 11l5 5 5-5M5 20h14" />
  </Icono>
);

export const IconoReintentar = () => (
  <Icono>
    <path d="M20 11a8 8 0 1 0-2.3 5.7" />
    <path d="M20 4v7h-7" />
  </Icono>
);

export const IconoExpandir = () => (
  <Icono>
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  </Icono>
);

export const IconoContraer = () => (
  <Icono>
    <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
  </Icono>
);

export const IconoSalir = () => (
  <Icono>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M10 8l-4 4 4 4M6 12h10" />
  </Icono>
);

export const IconoSol = () => (
  <Icono>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icono>
);

export const IconoLuna = () => (
  <Icono>
    <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
  </Icono>
);

export const IconoMonitor = () => (
  <Icono>
    <rect x="2" y="4" width="20" height="13" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </Icono>
);

export const IconoVideo = () => (
  <Icono>
    <rect x="3" y="5" width="13" height="14" rx="2.5" />
    <path d="m16 10 5-3v10l-5-3" />
  </Icono>
);

export const IconoAbrir = () => (
  <Icono>
    <path d="M7 17 17 7M9 7h8v8" />
  </Icono>
);

export const IconoCopiar = () => (
  <Icono>
    <rect x="8" y="8" width="12" height="12" rx="2.5" />
    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
  </Icono>
);

export const IconoCheck = () => (
  <Icono>
    <path d="m5 12 5 5 9-10" />
  </Icono>
);

export const IconoPelicula = () => (
  <Icono>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" />
  </Icono>
);

export const IconoReloj = () => (
  <Icono>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icono>
);

export const IconoGlobo = () => (
  <Icono>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </Icono>
);

export const IconoEditar = () => (
  <Icono>
    <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-4-4L4 16z" />
    <path d="m13.5 6.5 4 4" />
  </Icono>
);

export const IconoEliminar = () => (
  <Icono>
    <path d="M4 7h16M10 11v6M14 11v6" />
    <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </Icono>
);

export const IconoPlay = () => (
  <Icono>
    <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
  </Icono>
);

export const IconoUsuario = () => (
  <Icono>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Icono>
);

export const IconoCorreo = () => (
  <Icono>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="m4 7 8 6 8-6" />
  </Icono>
);

export const IconoCandado = () => (
  <Icono>
    <rect x="4.5" y="10" width="15" height="11" rx="3" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14.5v2.5" />
  </Icono>
);

export const IconoOjo = () => (
  <Icono>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Icono>
);

export const IconoOjoTachado = () => (
  <Icono>
    <path d="M10.6 5.1A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-2.8 3.7M6.6 6.6C3.7 8.5 2 12 2 12s3.6 7 10 7a9.9 9.9 0 0 0 5.4-1.6" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" />
  </Icono>
);

export const IconoFlecha = () => (
  <Icono>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icono>
);

export const IconoTelefono = () => (
  <Icono>
    <path d="M5 4h3.5l1.8 4.4-2.3 1.4a11 11 0 0 0 6.2 6.2l1.4-2.3L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z" />
  </Icono>
);

export const IconoCamara = () => (
  <Icono>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5Z" />
    <circle cx="12" cy="13" r="3.5" />
  </Icono>
);

export const IconoEscudo = () => (
  <Icono>
    <path d="M12 3 5 6v5c0 4.4 3 8.3 7 9.5 4-1.2 7-5.1 7-9.5V6Z" />
    <path d="m9 12 2 2 4-4" />
  </Icono>
);

export const IconoChispa = () => (
  <Icono>
    <path d="M12 3.5 13.8 9a2 2 0 0 0 1.2 1.2l5.5 1.8-5.5 1.8a2 2 0 0 0-1.2 1.2L12 20.5 10.2 15A2 2 0 0 0 9 13.8L3.5 12 9 10.2A2 2 0 0 0 10.2 9Z" />
    <path d="M19 3v4M17 5h4" />
  </Icono>
);

export const IconoAltavoz = () => (
  <Icono>
    <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5Z" />
    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
  </Icono>
);
