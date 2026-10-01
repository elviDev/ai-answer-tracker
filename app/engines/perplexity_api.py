import httpx
from playwright.sync_api import BrowserContext

from app.config import get_settings
from app.engines.base import ApiEngine, EngineAnswer, EngineError, dedupe_sources

SONAR_URL = "https://api.perplexity.ai/v1/sonar"


def parse_response(data: dict) -> EngineAnswer:
    try:
        text = data["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, AttributeError):
        raise EngineError(f"Unexpected Perplexity response: {str(data)[:300]}") from None
    if not text:
        raise EngineError("Perplexity returned an empty answer")
    sources = [{"title": r.get("title"), "url": r.get("url")} for r in data.get("search_results") or []]
    if not sources:  # older responses only carry a list of URLs
        sources = [{"title": "", "url": url} for url in data.get("citations") or []]
    return EngineAnswer(text=text, sources=dedupe_sources(sources))


class PerplexityApiEngine(ApiEngine):
    """Perplexity Sonar API: web-grounded answers with search results."""

    name = "perplexity_api"
    label = "Perplexity API"
    key_setting = "perplexity_api_key"

    def ask(self, prompt: str, context: BrowserContext | None) -> EngineAnswer:
        settings = get_settings()
        response = httpx.post(
            SONAR_URL,
            headers={"Authorization": f"Bearer {self.require_key()}"},
            json={"model": settings.perplexity_model, "messages": [{"role": "user", "content": prompt}]},
            timeout=settings.api_timeout_seconds,
        )
        if response.status_code >= 400:
            raise EngineError(f"Perplexity API error {response.status_code}: {response.text[:300]}")
        return parse_response(response.json())
