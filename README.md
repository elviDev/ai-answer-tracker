# AI Answer Tracker

Track how AI engines answer questions about any brand or keyword over time.

It queries AI engine APIs (OpenAI, Claude, Gemini, Perplexity) and scrapes their web apps, normalises the answers across providers, stores timestamped results in PostgreSQL, and exposes a query interface through FastAPI.

Built with **Python, Playwright, FastAPI, PostgreSQL, and Docker**.

You define a *tracker*, which is a brand plus a question (for example *"What is the best note-taking app for startups?"* for **Notion**). On a schedule, the worker asks each AI engine that question in a real headless browser and stores every answer. For each answer it records:

- **Mentioned?** Whether the brand (or any alias) appears, and how many times.
- **Rank.** The brand's position among your listed competitors, ordered by first mention.
- **Position.** How early in the answer the brand first shows up.
- **Cited?** Whether any source link points at the brand's own domain.
- **Changed?** Whether the answer differs from the previous one, with a similarity score.

The dashboard shows mention rate per engine over time and lets you read every stored answer.

## Engines

There are two kinds of engine. You can mix both in one tracker.

### Official APIs (recommended)

Each engine calls the provider's official API with its built-in web search turned on, so answers are grounded in live results like the consumer apps. These engines are reliable: no CAPTCHAs, no sign-up walls. Each one switches on once its API key is set in `.env`. Without a key it shows as "(no key)" in the dashboard.

| Name | Provider / API | Web search | Default model (`*_MODEL` to override) |
|---|---|---|---|
| `openai` | OpenAI Responses API | `web_search` tool | `gpt-6-astra` |
| `claude` | Anthropic Messages API | `web_search` server tool | `claude-opus-5-5` |
| `gemini` | Google Gemini Interactions API | Grounding with Google Search | `gemini-3.8-flash` |
| `perplexity_api` | Perplexity Sonar API | Always on | `sonar` |

Every provider's answer is normalised to the same shape (answer text + `{title, url}` sources) before analysis, so stats are comparable across engines. These APIs are paid per request. Web search feeds page excerpts into the model, so expect roughly a few cents per engine per run, plus each provider's small per-search fee. A daily tracker on four engines costs a few dollars a month. For Claude, `ANTHROPIC_MODEL=claude-sonnet-5-5` is a cheaper option. The Claude engine also enables Anthropic's server-side refusal fallback, so a declined answer is retried on a suitable model automatically.

Get keys at: [OpenAI](https://platform.openai.com/api-keys) · [Anthropic](https://console.anthropic.com/settings/keys) · [Google AI Studio](https://aistudio.google.com/apikey) · [Perplexity](https://www.perplexity.ai/account/api)

### Browser scraping (no keys)

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
| `DEFAULT_ENGINES` | `["perplexity","chatgpt","google_ai_overview"]` | Used when a tracker doesn't list engines. With API keys set, `["openai","claude","gemini","perplexity_api"]` is a better choice. |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` / `PERPLEXITY_API_KEY` | unset | Turns on the matching API engine |
| `OPENAI_MODEL` / `ANTHROPIC_MODEL` / `GEMINI_MODEL` / `PERPLEXITY_MODEL` | see the Engines section | Model used by each API engine |
| `API_TIMEOUT_SECONDS` | `180` | Max wait for an API answer |
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
  engines/       One module per engine: *_api.py call provider APIs,
                 the rest scrape web UIs with Playwright
  static/        Dashboard (single HTML page)
tests/
```

## Adding an engine

For an API, subclass `ApiEngine`, set `key_setting` to a new setting in [app/config.py](app/config.py), and return an `EngineAnswer(text, sources)` from `ask()`. See [app/engines/perplexity_api.py](app/engines/perplexity_api.py) for the smallest example.

For a website, create `app/engines/<name>.py` with a `BrowserEngine` subclass that sets `name` and `label` and implements `ask(prompt, context)`. Most engines only need to open a URL, call `wait_for_stable_text(page, selector)`, and call `extract_links(...)`. Then register the class in [app/engines/\_\_init\_\_.py](app/engines/__init__.py).
