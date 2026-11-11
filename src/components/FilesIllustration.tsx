/** Three tilted "files" (video, audio, subtitles) for the upload zone. */
export function FilesIllustration() {
  return (
    <svg className="files-illustration" viewBox="0 0 168 104" aria-hidden>
      <defs>
        <linearGradient id="fi-video" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c6cf6" />
          <stop offset="1" stopColor="#5b4be0" />
        </linearGradient>
        <linearGradient id="fi-audio" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5fd3c6" />
          <stop offset="1" stopColor="#36b3a6" />
        </linearGradient>
        <linearGradient id="fi-subs" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5b93f7" />
          <stop offset="1" stopColor="#2f6fe4" />
        </linearGradient>
      </defs>
      {/* Video */}
      <g transform="rotate(-12 38 60)">
        <rect x="14" y="28" width="48" height="60" rx="9" fill="url(#fi-video)" />
        <circle cx="38" cy="58" r="11" fill="#fff" />
        <path d="M35 52.5v11l9-5.5z" fill="#5b4be0" />
      </g>
      {/* Subtitles */}
      <g transform="rotate(12 130 60)">
        <rect x="106" y="28" width="48" height="60" rx="9" fill="url(#fi-subs)" />
        <rect x="116" y="50" width="28" height="18" rx="4" fill="none" stroke="#fff" strokeWidth="3" />
        <path d="M121 59h6M131 59h8M121 64h10" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      </g>
      {/* Audio (in front) */}
      <rect x="60" y="10" width="48" height="62" rx="9" fill="url(#fi-audio)" />
      <path d="M96 10v10a4 4 0 0 0 4 4h8" fill="rgb(255 255 255 / 0.35)" />
      <path d="M72 41v10M78 36v20M84 31v30M90 38v16M96 43v6" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}
