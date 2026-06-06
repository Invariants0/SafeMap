# 🤝 Contributing

We welcome contributions! Here's how to get started:

## Development Setup

```bash
# 1. Fork the repository
# 2. Clone your fork
git clone https://github.com/Invariants0/SafeMap.git

# 3. Set up the backend
cd backend
cp .env.example .env        # add your GEMINI_API_KEY (or set USE_DUMMY_DATA=true)
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 4. Set up the frontend (new terminal)
cd frontend
cp .env.example .env        # set VITE_API_URL=http://localhost:8000
bun install
bun run dev

# 5. Create a feature branch
git checkout -b feature/your-feature-name

# 6. Make your changes and test thoroughly

# 7. Commit with clear messages
git commit -m "feat: add amazing feature"

# 8. Push to your fork
git push origin feature/your-feature-name

# 9. Open a Pull Request against main
```

## Contribution Guidelines

- **Code Style:** Follow PEP 8 + ruff for Python, ESLint for TypeScript
- **File Naming:** Python files use `camelCase.py` (e.g. `hotspotService.py`)
- **Documentation:** Update README or ARCHITECTURE if your change affects setup or data flow
- **Testing:** Test in both Live mode (`USE_DUMMY_DATA=false`) and Demo mode (`USE_DUMMY_DATA=true`)
- **Commits:** Use conventional commit messages (`feat:`, `fix:`, `docs:`, `refactor:`)
- **Secrets:** Never commit `.env` files or API keys
- **Issues:** Check existing issues before opening a new one

## Areas for Contribution

- 🐛 **Bug fixes** — help us squash bugs
- ✨ **New features** — implement awesome new features
- 📚 **Documentation** — improve guides and examples
- 🎨 **UI/UX** — enhance the map and mobile experience
- 🌍 **Internationalisation** — add multi-language support