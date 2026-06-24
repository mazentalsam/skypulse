# SkyPulse Frontend

React + Vite frontend for SkyPulse weather intelligence platform. See the [root README](../README.md) for full project documentation.

## Development

```bash
npm install
npm run dev      # Dev server at http://localhost:5173
npm run build    # Production build to dist/
npm run lint     # ESLint
npm test         # Vitest
```

The Vite dev server proxies `/api` requests to `http://localhost:5000` (Flask backend).
