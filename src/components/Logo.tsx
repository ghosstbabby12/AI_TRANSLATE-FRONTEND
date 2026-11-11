import { useId } from "react";

/**
 * Brand symbol: two overlapping speech bubbles (original language behind,
 * translation in front) with a ▶ and a subtitle line. Glossy blue gradients.
 */
export function LogoSymbol({ size = 32 }: { size?: number }) {
  // Unique ids per instance: several logos on the page must not share gradients
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    // Size goes in style: the global `svg { width: 20px }` rule would override the attributes
    <svg viewBox="-2 -1 68 68" style={{ width: size, height: size }} aria-hidden className="logo-symbol">
      <defs>
        <linearGradient id={`${id}t`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eef3ff" />
          <stop offset="1" stopColor="#9fbaff" />
        </linearGradient>
        <linearGradient id={`${id}f`} x1="0.1" y1="0" x2="0.75" y2="1">
          <stop offset="0" stopColor="#5b9bff" />
          <stop offset="0.55" stopColor="#2459ea" />
          <stop offset="1" stopColor="#1b2f9e" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}s`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.2" floodColor="#1b2f9e" floodOpacity="0.35" />
        </filter>
      </defs>
      {/* Back bubble: the original language */}
      <path d="M27 5h25a8 8 0 0 1 8 8v17a8 8 0 0 1-8 8h-1.5l2 8.5L42 38H27a8 8 0 0 1-8-8V13a8 8 0 0 1 8-8z" fill={`url(#${id}t)`} />
      {/* Front bubble: the translation */}
      <path
        d="M12 19h27a8 8 0 0 1 8 8v19a8 8 0 0 1-8 8H23l-11 8.5 2.2-8.5H12a8 8 0 0 1-8-8V27a8 8 0 0 1 8-8z"
        fill={`url(#${id}f)`}
        stroke="rgb(255 255 255 / 0.35)"
        strokeWidth="1"
        filter={`url(#${id}s)`}
      />
      {/* Top shine */}
      <path d="M12 20h27a7 7 0 0 1 7 7v4H5v-4a7 7 0 0 1 7-7z" fill={`url(#${id}b)`} />
      {/* ▶ and subtitle */}
      <path d="M20.5 27.5v12.5l10.5-6.25z" fill="#fff" />
      <rect x="11" y="44.5" width="15" height="3.2" rx="1.6" fill="#fff" opacity="0.9" />
      <rect x="29" y="44.5" width="10" height="3.2" rx="1.6" fill="#fff" opacity="0.6" />
    </svg>
  );
}

/** Header logo: the symbol on a raised tile. */
export function Logo() {
  return (
    <span className="brand-logo" aria-hidden>
      <LogoSymbol size={26} />
    </span>
  );
}
