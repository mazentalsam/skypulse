# SkyPulse — AI-Powered Weather Intelligence

![CI](https://github.com/YOUR_USERNAME/skypulse/actions/workflows/ci.yml/badge.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-3.1-000000?style=flat-square&logo=flask)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite)
![Anthropic](https://img.shields.io/badge/Claude_API-Sonnet_4.6-6B4FBB?style=flat-square)
![OpenWeatherMap](https://img.shields.io/badge/OpenWeatherMap-API-EB6E4B?style=flat-square)
![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?style=flat-square&logo=leaflet)
![Tests](https://img.shields.io/badge/Tests-68_passing-34D399?style=flat-square)

A full-stack weather platform that combines real-time forecasts with Claude AI insights — built by **Mazen** for the **PM Accelerator AI Engineer Intern** technical assessment. Covers **both** Tech Assessment #1 (Frontend) and #2 (Backend) for Full Stack candidacy.

<!-- Replace with an actual screenshot after deployment -->
![SkyPulse Screenshot](https://via.placeholder.com/1200x630/070809/ededee?text=SkyPulse+—+Replace+With+Real+Screenshot)

**Live demo:** _Deploy via Docker, Railway, or Render (configs included)_
**API docs:** `http://localhost:5000/docs` (Swagger UI via Flasgger)

---

## Demo Mode — No API Keys Needed

```bash
git clone <repo-url> && cd skypulse
cp .env.example .env
# Generate a secret key:
python -c "import secrets; print(secrets.token_hex(32))"
# Paste the output as FLASK_SECRET_KEY in .env

pip install -r requirements.txt
python -m flask --app backend.app run --port 5000

# In another terminal:
cd frontend && npm install && npm run dev
```

Open **http://localhost:5173** — the app works immediately with realistic demo data. No API keys required.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                  │
│  SearchBar ─► WeatherContext ─► CurrentWeatherCard           │
│  AI panels ─► API client ──────► /api/* endpoints            │
│  Maps (Leaflet) · Charts (Recharts) · Export (html2canvas)   │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP (axios)
┌───────────────────────▼─────────────────────────────────────┐
│                  Backend (Flask + SQLite)                     │
│                                                              │
│  routes/          services/           utils/                 │
│  ├─ weather.py    ├─ weather_service  ├─ validators.py       │
│  ├─ ai.py         ├─ ai_service       models.py              │
│  ├─ crud.py       ├─ geocoding        database.py            │
│  ├─ alerts.py     ├─ historical       extensions.py          │
│  ├─ youtube.py    ├─ youtube          config.py              │
│  ├─ export.py     ├─ unsplash                                │
│  └─ health.py     └─ export_service                          │
│                                                              │
│  External APIs:                                              │
│  ├─ OpenWeatherMap  (weather, forecast, air quality)         │
│  ├─ Open-Meteo      (5-year historical averages)             │
│  ├─ Nominatim       (geocoding)                              │
│  ├─ Claude AI       (8 AI features via Anthropic API)        │
│  ├─ YouTube Data    (travel videos)                          │
│  └─ Unsplash        (fallback photos)                        │
│                                                              │
│  Infrastructure:                                             │
│  ├─ Flask-Caching   (SimpleCache, X-Cache headers)           │
│  ├─ Flask-Limiter   (60 req/min rate limiting)               │
│  ├─ Flasgger        (Swagger UI at /docs)                    │
│  └─ Gunicorn+Nginx  (production via Docker)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Features → Assessment Requirement Mapping

| Assessment Requirement         | Feature in SkyPulse                                        | Files                                   |
|-------------------------------|------------------------------------------------------------|-----------------------------------------|
| **Full-stack app**            | Flask backend + React frontend, Vite dev proxy             | `backend/app.py`, `frontend/src/App.jsx`|
| **External API integration**  | 5 APIs: OpenWeatherMap, Claude, YouTube, Unsplash, Open-Meteo | `backend/services/`                   |
| **AI/LLM integration**       | 8 Claude-powered features: briefing, outfit, mood, trip advice, smart alerts, NL search, weekly planner, city comparison | `backend/services/ai_service.py` |
| **CRUD operations**           | Full create/read/update/delete for searches + alerts       | `backend/routes/crud.py`, `backend/models.py` |
| **Database**                  | SQLite with WAL mode, 3 tables, demo seed data             | `backend/database.py`                   |
| **Data validation**           | Input validators for queries, dates, coordinates, alerts   | `backend/utils/validators.py`           |
| **Testing**                   | 68 pytest tests (backend) + Vitest integration tests (frontend) | `backend/tests/`, `frontend/src/tests/` |
| **Error handling**            | Custom exceptions, ErrorBoundary, Toast notifications      | Throughout                              |
| **Security**                  | Rate limiting, CORS restriction, env-based secrets, input sanitization, prompt injection defense | `backend/config.py`, `backend/services/ai_service.py` |
| **Export/reporting**          | 5 formats: JSON, CSV, Markdown, XML, PDF (with ReportLab) | `backend/services/export_service.py`    |
| **API documentation**         | Swagger UI at `/docs` via Flasgger                         | All route files (docstrings)            |
| **Deployment config**         | Dockerfile (multi-stage), docker-compose, Railway, Render  | Root directory                          |
| **CI/CD**                     | GitHub Actions: pytest + eslint + build + vitest           | `.github/workflows/ci.yml`              |
| **Demo mode**                 | Full app works with zero API keys                          | `backend/services/demo_data.py`         |

---

## Features

### Frontend (Tech Assessment #1)
- **Multi-format location input** — city names, ZIP/postal codes, GPS coordinates, landmarks
- **Current weather card** — 120px gradient temperature, metric chips, sunrise/sunset, air quality
- **5-day forecast** — segmented grid with precipitation bars
- **24-hour hourly chart** — Recharts AreaChart with gradient fill and glassmorphism tooltips
- **Interactive weather map** — Leaflet map with 3 toggleable OpenWeatherMap tile layers
- **Geolocation** — one-click "Use my location" button
- **Ambient glow background** — radial glow shifts color based on weather condition
- **Geist design system** — near-black base, minimal borders, monospace labels, editorial layout
- **Error handling** — graceful messages for invalid cities, API failures, skeleton loading states
- **Responsive** — desktop-first, adapts to tablet and mobile
- **Keyboard shortcuts** — press `/` to focus search, `Esc` to clear

### Backend (Tech Assessment #2)
- **Full CRUD** — weather_searches and weather_alerts tables with validation
- **Location validation** — Nominatim geocoding with fuzzy match
- **Date range validation** — server-side format, ordering, max 30 days
- **City comparison** — fetch and compare weather for two cities side-by-side
- **Weather diff** — compare current conditions vs saved search data
- **YouTube Data API** — location travel videos with SQLite caching
- **Unsplash fallback** — automatic when YouTube quota is exceeded
- **Data export** — JSON, CSV, Markdown, XML, PDF (via ReportLab)
- **Flask-Caching** — 10-min weather TTL, 1-hour media TTL, X-Cache headers
- **Rate limiting** — 60 req/min via Flask-Limiter
- **Health endpoint** — `/api/health` returns system status, API config, DB connectivity
- **Swagger API docs** — interactive docs at `/docs`

### AI Features (8 Claude Integrations)
- **AI Weather Narrator** — 3-4 sentence briefing highlighting non-obvious insights
- **Multi-language briefings** — English, Spanish, French, German, Japanese, Chinese, Portuguese
- **AI Trip Advisor** — best days, packing list, activities to avoid, local tips
- **AI Outfit Recommender** — 3 practical recommendations based on conditions
- **Smart Weather Alerts** — Claude analyzes 5-day forecast for non-obvious risks
- **Natural Language Search** — "Is it beach weather in Miami?" → conversational answer
- **Weather Mood Score** — 1-10 rating with explanation
- **Plan My Week** — cross-reference weekly schedule against forecast

### Differentiator Features
- **City comparison mode** — side-by-side metrics + AI insight
- **Shareable weather cards** — branded PNG via html2canvas
- **Weather diff** — "What changed since you last checked" with metric deltas
- **Activity heatmap** — GitHub-style contribution grid
- **Personal Dashboard** — top city, avg mood, temperature charts
- **Live feed ticker** — scrolling recent searches

---

## Security

- **Secrets**: All API keys loaded from `.env` (git-ignored). App raises `RuntimeError` if `FLASK_SECRET_KEY` is missing — no insecure defaults.
- **CORS**: Restricted to configured origins via `ALLOWED_ORIGINS` env var (not wildcard `*`).
- **Rate limiting**: 60 requests/minute per IP via Flask-Limiter.
- **Input validation**: All user inputs validated (query length, date format, coordinate bounds, alert thresholds).
- **AI prompt safety**: User inputs to Claude are sanitized — control characters stripped, length-capped at 500 chars, checked against injection patterns before every LLM call.
- **SQL injection**: All database queries use parameterized statements.
- **Contact info**: Nominatim User-Agent email loaded from env var, not hardcoded.

---

## Tech Decisions

| Decision | Rationale |
|----------|-----------|
| **Flask over FastAPI** | Demonstrates core Python web fundamentals. Blueprint pattern shows manual architecture decisions. |
| **SQLite over PostgreSQL** | Zero-config setup — reviewers can clone and run immediately. WAL mode handles concurrent reads. |
| **React + Vite over Next.js** | SPA with no SSR needs. Vite gives fast HMR without Next.js complexity. |
| **Claude over GPT** | Demonstrates familiarity with Anthropic's ecosystem for an AI-focused role. |
| **Raw SQL over SQLAlchemy** | Shows SQL fundamentals. Schema is simple enough that an ORM adds complexity without value. |
| **Flasgger for API docs** | Interactive Swagger UI at `/docs` — reviewers can test endpoints without Postman. |

---

## Deployment

### Docker (recommended)

```bash
docker build -t skypulse .
docker run -p 80:80 --env-file .env skypulse
```

### Railway (one-click)

Push to GitHub, connect Railway, deploy. Config in `railway.json`.

### Render

Push to GitHub, connect Render. Config in `render.yaml`. Secret key auto-generated.

---

## Running Tests

```bash
# Backend (68 tests)
python -m pytest backend/tests/ -v

# Frontend
cd frontend
npm install
npm test
```

CI runs automatically on push/PR via GitHub Actions.

---

## API Endpoints (29 total)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | System status |
| GET | `/api/weather/current?q=` | Current weather + air quality + UV |
| GET | `/api/weather/forecast?lat=&lon=` | 5-day forecast |
| GET | `/api/weather/hourly?lat=&lon=` | Next 24h hourly |
| GET | `/api/weather/historical?lat=&lon=` | Historical averages |
| GET | `/api/weather/compare?city1=&city2=` | City comparison |
| GET | `/api/weather/diff/<id>` | Saved vs current diff |
| POST | `/api/ai/briefing` | AI weather narrative |
| POST | `/api/ai/trip-advice` | AI trip planning |
| POST | `/api/ai/outfit` | AI outfit recommendation |
| POST | `/api/ai/alerts` | AI smart alerts |
| POST | `/api/ai/mood` | Weather mood score |
| POST | `/api/ai/natural-search` | Natural language Q&A |
| POST | `/api/ai/plan-week` | Schedule optimizer |
| POST | `/api/ai/compare` | AI comparison insight |
| POST | `/api/searches` | Save search |
| GET | `/api/searches` | List searches |
| GET | `/api/searches/<id>` | Get search |
| PUT | `/api/searches/<id>` | Update search |
| DELETE | `/api/searches/<id>` | Delete search |
| POST | `/api/searches/date-range` | Date-range search |
| POST | `/api/alerts` | Create alert |
| GET | `/api/alerts` | List alerts |
| PUT | `/api/alerts/<id>` | Update alert |
| DELETE | `/api/alerts/<id>` | Delete alert |
| GET | `/api/export/<id>?format=` | Export single record |
| GET | `/api/export/all?format=` | Export all records |
| GET | `/api/youtube/videos?location=` | Travel videos |
| GET | `/api/dashboard/stats` | Dashboard statistics |

Interactive docs at **`/docs`** (Swagger UI).

---

## Environment Variables

Copy `.env.example` to `.env`. With `DEMO_MODE=true`, no API keys are needed.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FLASK_SECRET_KEY` | **Yes** | _none — app crashes without it_ | Session signing key |
| `DEMO_MODE` | No | `true` | Use mock data (no API keys needed) |
| `FLASK_DEBUG` | No | `false` | Enable Flask debug mode |
| `ALLOWED_ORIGINS` | No | `http://localhost:5173` | Comma-separated CORS origins |
| `CONTACT_EMAIL` | No | `noreply@skypulse.app` | User-Agent email for Nominatim |
| `OPENWEATHERMAP_API_KEY` | If DEMO_MODE=false | — | [Get key](https://home.openweathermap.org/users/sign_up) |
| `ANTHROPIC_API_KEY` | If DEMO_MODE=false | — | [Get key](https://console.anthropic.com/) |
| `YOUTUBE_API_KEY` | If DEMO_MODE=false | — | [Get key](https://console.cloud.google.com/) |
| `UNSPLASH_ACCESS_KEY` | Optional | — | [Get key](https://unsplash.com/developers) |

---

## What I'd Improve With More Time

1. **TypeScript** — Convert the frontend for type safety across 30+ components.
2. **Authentication** — JWT-based user accounts so searches are per-user.
3. **WebSocket live updates** — Push weather alerts in real-time.
4. **Database migrations** — Alembic for schema versioning.
5. **E2E tests** — Playwright for the full search → save → export flow.
6. **Redis cache** — Replace SimpleCache for production.
7. **Pagination** — Cursor-based pagination on the searches endpoint.

---

*Built with Flask, React, Claude AI, and an unhealthy amount of weather data.*
