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
