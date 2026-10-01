from google import genai
from playwright.sync_api import BrowserContext

from app.config import get_settings
from app.engines.base import ApiEngine, EngineAnswer, EngineError, dedupe_sources


def parse_interaction(interaction) -> EngineAnswer:
    texts, sources = [], []
    for step in interaction.steps or []:
        if step.type != "model_output":
            continue
        for block in step.content or []:
            if block.type != "text":
                continue
            texts.append(block.text)
            for annotation in block.annotations or []:
                if annotation.type == "url_citation":
                    sources.append({"title": annotation.title, "url": annotation.url})
    text = ("".join(texts) or interaction.output_text or "").strip()
    if not text:
        raise EngineError("Gemini returned an empty answer")
    return EngineAnswer(text=text, sources=dedupe_sources(sources))


class GeminiEngine(ApiEngine):
    """Google Gemini API grounded with Google Search."""

    name = "gemini"
    label = "Gemini API"
    key_setting = "gemini_api_key"

    def ask(self, prompt: str, context: BrowserContext | None) -> EngineAnswer:
        settings = get_settings()
        client = genai.Client(api_key=self.require_key())
        tools = [{"type": "google_search"}] if settings.gemini_grounding else []
        try:
            interaction = client.interactions.create(
                model=settings.gemini_model, input=prompt, tools=tools, timeout=settings.api_timeout_seconds
            )
        except Exception as exc:
            if getattr(exc, "status_code", None) == 429 or getattr(exc, "code", None) == 429:
                hint = (
                    " Google Search grounding usually needs billing enabled on the Gemini project;"
                    " set GEMINI_GROUNDING=false to use the free tier without live search."
                    if settings.gemini_grounding
                    else ""
                )
                raise EngineError(f"Gemini quota exceeded (429).{hint}") from exc
            raise
        return parse_interaction(interaction)
