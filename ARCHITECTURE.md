# 🏗️ Project Architecture

```
SafeMap/
│
├── 🌐 Frontend Layer  (React 18 + TypeScript · Vite · Bun)
│   └── frontend/
│       ├── src/
│       │   │
│       │   ├── 🧩 components/
│       │   │   ├── Map.tsx                  # Leaflet.js interactive hotspot map
│       │   │   ├── ReportForm.tsx           # Anonymous incident submission form
│       │   │   ├── LocationSearch.tsx       # Nominatim-powered location picker
│       │   │   └── StatsBar.tsx             # Live dashboard statistics bar
│       │   │
│       │   ├── 🔌 services/
│       │   │   ├── api.ts                   # Axios client → FastAPI backend
│       │   │   └── nominatim.ts             # OpenStreetMap geocoding service
│       │   │
│       │   ├── ⚙️  config/
│       │   │   └── api.ts                   # API base URL & environment config
│       │   │
│       │   ├── 📐 types/
│       │   │   └── index.ts                 # Shared TypeScript interfaces
│       │   │
│       │   ├── App.tsx                      # Root component & routing
│       │   ├── main.tsx                     # React entry point
│       │   └── index.css                    # TailwindCSS base styles
│       │
│       ├── vite.config.ts                   # Vite build configuration
│       ├── tailwind.config.js               # TailwindCSS theme
│       ├── package.json                     # JS dependencies (Bun)
│       └── vercel.json                      # Vercel deployment config
│
├── ⚙️  Backend Layer  (FastAPI · Python 3.11+ · uv)
│   └── backend/
│       └── app/
│           │
│           ├── main.py                      # FastAPI app, CORS & all route handlers
│           │
│           ├── ⚙️  config/
│           │   └── appConfig.py             # Pydantic Settings (env vars)
│           │
│           ├── 🗄️  database/
│           │   └── databaseConfig.py        # SQLAlchemy engine & session factory
│           │
│           ├── 📐 models/
│           │   ├── dataModels.py            # SQLAlchemy ORM models (Report)
│           │   └── apiSchemas.py            # Pydantic request / response schemas
│           │
│           ├── 🤖 services/
│           │   ├── geminiService.py         # Gemini AI: NLP parsing & insights
│           │   └── hotspotService.py        # Grid-based hotspot aggregation
│           │
│           └── 🔒 utils/
│               └── privacyUtils.py          # Coordinate fuzzing (50–100 m offset)
│
├── 🎭 Demo / Seed Data
│   └── backend/dummy/
│       ├── incidents.json                   # 92 realistic incidents (7 US cities)
│       ├── hotspots.json                    # 7 pre-aggregated hotspot regions
│       ├── insights.json                    # Pre-generated AI safety insights
│       └── seedData.py                      # CLI script to seed live database
│
├── ⚙️  Configuration & Deployment
│   ├── backend/pyproject.toml               # Python deps (uv)
│   ├── backend/render.yaml                  # Render cloud deployment spec
│   └── .gitignore
│
└── 📚 Documentation
    └── README.md                            # Setup, API reference & deployment guide
```

---

### Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          User Browser                            │
│                                                                  │
│   ┌─────────────────┐  ┌──────────────────┐  ┌──────────────┐    │
│   │  Leaflet Map    │  │  Report Form     │  │  Stats Bar   │    │
│   │  (hotspots)     │  │  (free text)     │  │  (dashboard) │    │
│   └────────┬────────┘  └────────┬─────────┘  └──────┬───────┘    │
│            │                    │                   │            │
│            └────────────────────┼───────────────────┘            │
│                                 │  HTTP / Axios                  │
└─────────────────────────────────┼────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend  (main.py)                    │
│                                                                  │
│   POST /api/report      GET /api/hotspots     GET /api/stats     │
│   GET  /api/hotspots/{id}/insight             GET /health        │
└────────────┬──────────────────┬────────────────────┬─────────────┘
             │                  │                    │
             ▼                  ▼                    ▼
┌────────────────────┐ ┌─────────────────┐ ┌──────────────────────┐
│   Gemini Service   │ │ Hotspot Service │ │   SQLite Database    │
│                    │ │                 │ │   (SQLAlchemy ORM)   │
│ • NLP parsing      │ │ • DBSCAN        │ │                      │
│   (type, severity, │ │   cluster       │ │  Reports table:      │
│    hour estimate)  │ │ • Severity score│ │  • incident_type     │
│ • AI safety        │ │ • Dominant type │ │  • severity          │
│   insights         │ │                 │ │  • lat / lng (fuzzed)│
└────────────────────┘ └─────────────────┘ │  • hour_estimate     │
             │                             └──────────────────────┘
             ▼
┌────────────────────┐ ┌─────────────────────────────────────────┐
│  Privacy Utils     │ │           Demo Mode (optional)          │
│                    │ │                                         │
│ • 50–100 m random  │ │  USE_DUMMY_DATA=true bypasses DB and    │
│   coordinate fuzz  │ │  Gemini; serves pre-built JSON files    │
│   before storage   │ │  from backend/dummy/ for instant demo   │
└────────────────────┘ └─────────────────────────────────────────┘
```

---

