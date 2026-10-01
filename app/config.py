from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://tracker:tracker@localhost:5432/tracker"

    # Engines used when a tracker doesn't specify its own list.
    default_engines: list[str] = ["perplexity", "chatgpt", "google_ai_overview"]

    # Browser / scraping
    headless: bool = True
    browser_timeout_seconds: int = 90
    # How long an answer's text must stay unchanged before we consider it finished streaming.
    answer_settle_seconds: float = 3.0
    user_agent: str = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
    )
    # When set, a screenshot is saved here whenever an engine fails.
    screenshot_dir: str | None = None

    # Provider APIs. An API engine is only usable once its key is set.
    openai_api_key: str | None = None
    openai_model: str = "gpt-6-astra"
    anthropic_api_key: str | None = None
    anthropic_model: str = "claude-opus-5-5"
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-3.8-flash"
    # Grounding with Google Search needs billing on most Gemini projects; turn off to use the free tier.
    gemini_grounding: bool = True
    perplexity_api_key: str | None = None
    perplexity_model: str = "sonar"
    api_timeout_seconds: float = 180

    # When set, every /api request must send "Authorization: Bearer <API_TOKEN>".
    # The Next.js frontend adds it server-side, so the browser never sees it.
    api_token: str | None = None

    # Worker
    worker_poll_seconds: int = 60


@lru_cache
def get_settings() -> Settings:
    return Settings()
