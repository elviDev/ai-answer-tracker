import random
from datetime import UTC, datetime

from playwright.sync_api import BrowserContext

from app.engines.base import Engine, EngineAnswer

_VENDORS = ["Acme", "Globex", "Initech", "Umbrella", "Hooli"]


class MockEngine(Engine):
    """Offline engine for development and tests. Answers vary by day, like a real engine would."""

    name = "mock"
    label = "Mock (offline)"
    requires_browser = False

    def ask(self, prompt: str, context: BrowserContext | None) -> EngineAnswer:
        rng = random.Random(f"{prompt}|{datetime.now(UTC).date()}")
        picks = rng.sample(_VENDORS, k=3)
        text = (
            f"You asked: {prompt}\n\n"
            f"Popular options include {picks[0]}, {picks[1]} and {picks[2]}. "
            f"{picks[0]} is often recommended for its reliability, while {picks[1]} "
            "is a good fit for smaller teams."
        )
        sources = [{"title": f"{p} review", "url": f"https://www.{p.lower()}.example/review"} for p in picks[:2]]
        return EngineAnswer(text=text, sources=sources)
