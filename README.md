
<div align="center">

#  SafeMap

### Because every woman knows the feeling of checking over her shoulder.

***Anonymous. Private. Powered by AI.***

[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev)
[![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=flat-square&logo=leaflet&logoColor=white)](https://leafletjs.com)

</div>

---

## The Problem We All Know Too Well

Walking to your car at night. Taking the long route to avoid a certain street. Sending a "just got home safe" text to your friends.

Every woman does these things. Not because we're paranoid — because we've learned.

The tools that exist to help? They either require you to make an account (hello, privacy nightmare), or they're buried in government dashboards no one actually uses. **There was no simple, anonymous, community-powered way to say: "this spot isn't safe."** <br> <br> So we built one.

---

## What SafeMap Does

SafeMap lets anyone — no account, no name, no trace — report a safety incident in plain language, in any language. Our AI parses what happened, where, and when. The community builds a living map of risk. Everyone stays safer.

> *"Theft near the station exit, late Tuesday night."* → Parsed, anonymized, mapped. Done.

### Core Features

- **Fully Anonymous Reporting** — No login. No cookies. No identity. Your report is stored as structured metadata only — the original text is never saved.
- **Intelligent Location Search** — Type an address or drop a pin. We fuzz your coordinates by 50–100m before storing them. Your exact location is never recorded.
- **AI-Powered Incident Parsing** — Google Gemini reads your free-text report and extracts incident type, severity, and timing automatically. Works in any language.
- **Interactive Hotspot Map** — Color-coded severity markers (🔴 High · 🟡 Moderate · 🟢 Low) show the community's collective knowledge of risky areas.
- **AI Safety Insights** — Click any hotspot to get Gemini-generated, actionable safety recommendations specific to that area.
- **Real-Time Dashboard** — Total reports, active hotspots, most common incident types, and peak danger hours — at a glance.

---

## Privacy, By Design

We take privacy seriously — especially because the people most likely to use this app are people who already feel vulnerable.

| What we collect | What we don't |
|---|---|
| Incident type (e.g. "theft") | Your original report text |
| Severity level | Your name, email, or any identity |
| Approximate hour of incident | Your exact coordinates |
| Fuzzed location (±50–100m) | Your IP address or device info |

Privacy isn't a feature we added. It's the foundation we built on.

---

## How It Works 

```
You type a report        →   Gemini parses it        →   Metadata stored (not your words)
in plain language            in any language              with fuzzed coordinates

Community reports        →   Hotspot algorithm       →   Map updates
accumulate                   clusters nearby reports      in real time
```

- Hotspot clustering uses the DBSCAN algorithm; so hotspots emerge organically from where reports actually concentrate.
---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | TailwindCSS |
| Mapping | Leaflet.js + React Leaflet |
| Package Manager | Bun |
| Backend | FastAPI (Python 3.11+) |
| Database | SQLite + SQLAlchemy |
| AI / NLP | Google Gemini API |
| Geocoding | Nominatim (OpenStreetMap) |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## 🚀 Run It Locally

### Prerequisites

- Node.js 18+ and [Bun](https://bun.sh)
- Python 3.11+ and [uv](https://docs.astral.sh/uv/)
- A [Google Gemini API key](https://ai.google.dev) *(only needed for live mode)*

---

### Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=sqlite:///./safemap.db
GEMINI_API_KEY=your_key_here
FRONTEND_URL=http://localhost:5173
USE_DUMMY_DATA=false
```

```bash
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at `http://localhost:8000` · API docs at `/docs`

---

### Frontend

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:8000
```

```bash
bun install
bun run dev
```

Frontend runs at `http://localhost:5173`

---

### ⚡ Demo Mode (No API Key Needed)

Want to see the map loaded with realistic data instantly? Set `USE_DUMMY_DATA=true` in `backend/.env`.

This loads 92 pre-generated incidents across 7 US city hotspots:<br>

- New York City: Times Square, Penn Station, Central Park
- San Francisco: Market Street, Union Square
- Chicago: Millennium Park, Union Station<br>

All data is based on realistic safety scenarios with proper severity ratings, incident types, and AI-generated safety recommendations.<br>
No Gemini key, no database required. Perfect for demos.

```bash
# Seed the live database with demo data
cd backend
uv run python dummy/seedData.py
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/report` | Submit an anonymous incident report |
| `GET` | `/api/hotspots` | Get all active hotspot areas |
| `GET` | `/api/hotspots/{id}/insight` | Get AI safety insight for a hotspot |
| `GET` | `/api/stats` | Get dashboard statistics |
| `GET` | `/health` | Health check |

### Submit a Report

```json
POST /api/report
{
  "text": "Suspicious person following women near the parking structure at night",
  "lat": 28.6139,
  "lng": 77.2090
}
```

### Response

```json
{
  "id": 1,
  "incident_type": "harassment",
  "severity": "high",
  "hour_estimate": 21,
  "lat": 28.6145,
  "lng": 77.2095,
  "created_at": "2026-06-06T18:30:00Z"
}
```

---

## Project Structure

```
SafeMap/
├── frontend/
│   └── src/
│       ├── components/       # LocationSearch, ReportForm, Map, StatsBar
│       ├── services/         # api.ts, nominatim.ts
│       ├── types/
│       └── config/
├── backend/
│   ├── app/
│   │   ├── config/           # appConfig.py — settings management
│   │   ├── database/         # databaseConfig.py — SQLAlchemy setup
│   │   ├── models/           # dataModels.py, apiSchemas.py
│   │   ├── services/         # geminiService.py, hotspotService.py
│   │   └── utils/            # privacyUtils.py — coordinate fuzzing
│   └── dummy/                # 92 incidents, 7 hotspots, pre-gen insights
└── README.md
```

---
### Built For Her. 
The inspiration for Safemap wasn't a news article or a dataset. It was personal. It's the experience of being a woman navigating public spaces — the mental load of constantly calculating "is this safe?".<br>
It's community knowledge, shared anonymously, that helps women make better decisions about where they walk, when they travel, and which routes they take.

---

<div align="center">

*Built with ❤️ by the SafeMap team*
<br>
*For every woman who's ever taken the long way home.*

</div>

</div>