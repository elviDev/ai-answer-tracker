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

    # Worker
    worker_poll_seconds: int = 60


@lru_cache
def get_settings() -> Settings:
    return Settings()
