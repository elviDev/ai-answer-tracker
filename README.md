# AI Answer Tracker

Track how AI engines answer questions about any brand or keyword over time.

Built with **Python, Playwright, FastAPI, PostgreSQL, and Docker**.

You define a *tracker*, which is a brand plus a question (for example *"What is the best note-taking app for startups?"* for **Notion**). On a schedule, the worker asks each AI engine that question in a real headless browser and stores every answer. For each answer it records:

- **Mentioned?** Whether the brand (or any alias) appears, and how many times.
- **Rank.** The brand's position among your listed competitors, ordered by first mention.
- **Position.** How early in the answer the brand first shows up.
- **Cited?** Whether any source link points at the brand's own domain.
- **Changed?** Whether the answer differs from the previous one, with a similarity score.

The dashboard shows mention rate per engine over time and lets you read every stored answer.

## Engines

| Name | What it scrapes |
|---|---|
| `perplexity` | perplexity.ai search answer + citations. Logged-out visitors often get a "sign up" wall, which is recorded as an error. |
| `chatgpt` | chatgpt.com (logged out, web search on). The answer text is captured, but ChatGPT's inline citation pills aren't regular links, so `sources` is usually empty. |
| `google_ai_overview` | The "AI Overview" block on Google results. If Google doesn't show one, the run is recorded as `no_answer`. |
| `mock` | Offline fake engine, for development and tests |

> **Scraping caveat:** these sites change their markup, and they sometimes block automated browsers with a CAPTCHA or a Cloudflare challenge. When that happens the run is stored with `status=error` and a reason instead of silently failing. Set `SCREENSHOT_DIR` to capture what the browser saw. Selectors live in one small file per engine under [app/engines/](app/engines/), so they're easy to update. Check each site's terms of service before running this at volume.

## Quick start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

- Dashboard: http://localhost:8000
- API docs (Swagger): http://localhost:8000/docs

This starts three services:

- `db`: PostgreSQL 16.
- `api`: FastAPI plus the dashboard. "Run now" triggers a run in the background.
- `worker`: runs each active tracker every `interval_minutes`.

## Local development

```bash
python -m venv .venv
.venv\Scripts\activate            # Windows  (source .venv/bin/activate on macOS/Linux)
pip install -r requirements-dev.txt
playwright install chromium

docker compose up -d db           # or point DATABASE_URL at any Postgres
cp .env.example .env
uvicorn app.main:app --reload     # API + dashboard
python -m app.worker              # scheduler (use --once to run what's due and exit)
```

To watch the browser while debugging a scraper, set `HEADLESS=false`.

Run the tests (they use SQLite and the mock engine, so no browser or database is needed):

```bash
pytest
```

## API

| Method & path | Purpose |
|---|---|
| `GET /api/engines` | Available engines |
| `GET/POST /api/trackers` | List / create trackers |
| `GET/PATCH/DELETE /api/trackers/{id}` | Read / update / delete a tracker |
| `POST /api/trackers/{id}/run` | Run now (optional body: `{"engines": ["perplexity"]}`) |
| `GET /api/trackers/{id}/snapshots?engine=&since=&limit=` | Stored answers, newest first |
| `GET /api/trackers/{id}/stats?since=` | Mention and citation rates, average rank, change count, timeline |
| `GET /api/snapshots/{id}` | One stored answer |

Example:

```bash
curl -X POST localhost:8000/api/trackers -H "Content-Type: application/json" -d '{
  "name": "Note apps",
  "brand": "Notion",
  "aliases": ["Notion.so"],
  "competitors": ["Obsidian", "Coda", "Evernote"],
  "prompt": "What is the best note-taking app for startups?",
  "engines": ["perplexity", "google_ai_overview"],
  "interval_minutes": 1440
}'
```

## Configuration

All settings are environment variables. See [.env.example](.env.example).

| Variable | Default | |
|---|---|---|
| `DATABASE_URL` | `postgresql+psycopg://tracker:tracker@localhost:5432/tracker` | SQLAlchemy URL |
| `DEFAULT_ENGINES` | `["perplexity","chatgpt","google_ai_overview"]` | Used when a tracker doesn't list engines |
| `HEADLESS` | `true` | Show the browser when `false` |
| `BROWSER_TIMEOUT_SECONDS` | `90` | Max wait for an answer |
| `ANSWER_SETTLE_SECONDS` | `3` | An answer counts as finished once its text is unchanged for this long |
| `SCREENSHOT_DIR` | unset | Save screenshots of failed runs here |
| `WORKER_POLL_SECONDS` | `60` | How often the worker checks for due trackers |

## Project layout

```
app/
  main.py        FastAPI app + dashboard route
  api.py         REST endpoints
  runner.py      Runs a tracker's engines and stores snapshots
  worker.py      Scheduler loop
  analysis.py    Mention / rank / citation / change detection
  models.py      SQLAlchemy models (trackers, snapshots)
  engines/       One Playwright scraper per AI engine
  static/        Dashboard (single HTML page)
tests/
```

## Adding an engine

Create `app/engines/<name>.py` with a `BrowserEngine` subclass that sets `name` and `label` and implements `ask(prompt, context)`. Most engines only need to open a URL, call `wait_for_stable_text(page, selector)`, and call `extract_links(...)`. Then register the class in [app/engines/\_\_init\_\_.py](app/engines/__init__.py).
