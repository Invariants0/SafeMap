# 📦 Installation & Setup

## Prerequisites

- **Python 3.11+** — [python.org](https://www.python.org/downloads/)
- **uv** package manager (faster than pip) — [Install uv](https://docs.astral.sh/uv/getting-started/installation/)
- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **Bun** JavaScript runtime — [bun.sh](https://bun.sh)
- **Google Gemini API Key** — [ai.google.dev](https://ai.google.dev) *(not required for Demo Mode)*
- **Git** for cloning — [git-scm.com](https://git-scm.com)
- **Modern browser** (Chrome, Firefox, Edge)

---

## Option 1: Demo Mode (Instant — No API Key Needed)

Great for judging presentations or a quick look at the app with pre-loaded data from 7 US cities.

```bash
# 1. Clone the repository
git clone https://github.com/Invariants0/safemap.git
cd safemap

# 2. Set up the backend
cd backend
cp .env.example .env

# 3. Edit .env and enable Demo Mode
#    DATABASE_URL=sqlite:///./safemap.db
#    GEMINI_API_KEY=not_required
#    FRONTEND_URL=http://localhost:5173
#    USE_DUMMY_DATA=true

# 4. Install Python dependencies
uv sync

# 5. Start the backend
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 6. Open a new terminal, then set up the frontend
cd ../frontend
cp .env.example .env

# 7. Edit .env
#    VITE_API_URL=http://localhost:8000

# 8. Install JS dependencies
bun install

# 9. Start the frontend
bun run dev

# 10. Open your browser
#     Frontend: http://localhost:5173
#     API docs: http://localhost:8000/docs
#     Health:   http://localhost:8000/health
```

The map will immediately display 7 pre-configured hotspots across New York, San Francisco, and Chicago. ✅

---

## Option 2: Live Mode (Full Setup — Gemini API Required)

Reports are parsed in real time by Gemini AI and stored in a local SQLite database.

```bash
# 1. Clone the repository
git clone https://github.com/Invariants0/safemap.git
cd safemap

# 2. Set up the backend
cd backend
cp .env.example .env

# 3. Edit .env with your real credentials
#    DATABASE_URL=sqlite:///./safemap.db
#    GEMINI_API_KEY=your_actual_gemini_api_key_here
#    FRONTEND_URL=http://localhost:5173
#    USE_DUMMY_DATA=false

# 4. Install Python dependencies
uv sync

# 5. Start the backend
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 6. Open a new terminal, then set up the frontend
cd ../frontend
cp .env.example .env

# 7. Edit .env
#    VITE_API_URL=http://localhost:8000

# 8. Install JS dependencies
bun install

# 9. Start the frontend
bun run dev

# 10. Open your browser and submit your first report
#     Frontend: http://localhost:5173
#     API docs: http://localhost:8000/docs
```

---

## Optional: Seed the Database with Demo Data

Want realistic-looking data in Live Mode? Load the 92 pre-built incidents into your database:

```bash
cd backend
uv run python dummy/seedData.py
# Follow the prompts — it will ask before clearing existing data
```

After seeding, switch back to `USE_DUMMY_DATA=false` and the data persists in your live database.

---

## Installing Prerequisites

### uv (Python package manager)

```bash
# Linux / macOS
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### Bun (JavaScript runtime)

```bash
# Linux / macOS
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

---

## Verifying Your Setup

```bash
# Check backend is healthy
curl http://localhost:8000/health
# → {"status":"healthy","service":"safemap-api"}

# Check hotspots are loading
curl http://localhost:8000/api/hotspots

# Check dashboard stats
curl http://localhost:8000/api/stats
```

---

## 🐛 Troubleshooting

## Backend Issues

**Database errors:**
```bash
# Delete and recreate database
rm safemap.db
uv run uvicorn app.main:app --reload
```
---

**Gemini API errors:**
- Verify API key is correct
- Check quota limits at [ai.google.dev](https://ai.google.dev)
- Ensure billing is enabled if required

## Project Structure

**uv command not found:**
```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh
# Or on Windows with PowerShell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### Frontend Issues

**API connection errors:**
- Verify backend is running
- Check `.env` has correct `VITE_API_URL`
- Ensure CORS is properly configured

**Bun command not found:**
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash
# Or on Windows
powershell -c "irm bun.sh/install.ps1|iex"

**Map not rendering:**
- Check browser console for Leaflet errors
- Ensure internet connection (Leaflet tiles require external CDN)
- Verify `<link>` tag for Leaflet CSS in `index.html`

### Deployment Issues

**Render build fails:**
- Check Python version is 3.11+
- Verify `pyproject.toml` has all dependencies
- Review Render build logs

**Vercel build fails:**
- Ensure `package.json` has correct scripts
- Check Node version compatibility
- Verify `vercel.json` configuration
---


