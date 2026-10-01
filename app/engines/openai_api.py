from openai import OpenAI
from playwright.sync_api import BrowserContext

from app.config import get_settings
from app.engines.base import ApiEngine, EngineAnswer, EngineError, dedupe_sources


def parse_response(response) -> EngineAnswer:
    sources = []
    for item in response.output or []:
        if item.type != "message":
            continue
        for content in item.content or []:
            for annotation in getattr(content, "annotations", None) or []:
                if annotation.type == "url_citation":
                    sources.append({"title": annotation.title, "url": annotation.url})
    text = (response.output_text or "").strip()
    if not text:
        raise EngineError("OpenAI returned an empty answer")
    return EngineAnswer(text=text, sources=dedupe_sources(sources))


class OpenAIEngine(ApiEngine):
    """OpenAI Responses API with the built-in web search tool (what ChatGPT search uses)."""

    name = "openai"
    label = "OpenAI API"
    key_setting = "openai_api_key"

    def ask(self, prompt: str, context: BrowserContext | None) -> EngineAnswer:
        settings = get_settings()
        client = OpenAI(api_key=self.require_key(), timeout=settings.api_timeout_seconds)
        response = client.responses.create(
            model=settings.openai_model,
            tools=[{"type": "web_search"}],
            input=prompt,
        )
        return parse_response(response)
