# Traductor de Video con IA — Frontend

React + Vite. Subida de videos o links, reproductor con subtítulos traducidos que
aparecen en vivo, historial, descarga de `.srt` / `.vtt` y tema claro/oscuro.

Backend: [AI_Translate-backend](https://github.com/ghosstbabby12/AI_Translate-backend)

## Desarrollo local

```bash
npm install
npm run dev                 # http://localhost:5173 (usa la API en http://localhost:3000)
```

Para apuntar a otra API: `VITE_API_URL=https://... npm run dev`.

## Despliegue

Sitio estático en Render: build `npm ci && npm run build`, publicar `dist`, variable
`VITE_API_URL` con la URL de la API y una regla de reescritura `/* → /index.html`.
Cambiar `VITE_API_URL` exige reconstruir (se incluye al compilar).
