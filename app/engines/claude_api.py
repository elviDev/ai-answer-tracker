import anthropic
from playwright.sync_api import BrowserContext

from app.config import get_settings
from app.engines.base import ApiEngine, EngineAnswer, EngineError, EngineNoAnswer, dedupe_sources

# Models that take the dynamic-filtering web search tool, `effort`, and server-side refusal fallbacks.
_CURRENT_MODELS = ("claude-fable-5", "claude-opus-5", "claude-sonnet-5-5")
# A long answer can pause mid-turn while searches run; resume it at most this many times.
_MAX_CONTINUATIONS = 5


def _is_current(model: str) -> bool:
    return model.startswith(_CURRENT_MODELS)


def parse_responses(responses: list) -> EngineAnswer:
    """Join the text blocks of every response in the turn and collect the URLs Claude cited."""
    texts, cited, searched = [], [], []
    for response in responses:
        for block in response.content:
            if block.type == "text":
                texts.append(block.text)
                for citation in getattr(block, "citations", None) or []:
                    if getattr(citation, "url", None):
                        cited.append({"title": citation.title, "url": citation.url})
            elif block.type == "web_search_tool_result" and isinstance(block.content, list):
                searched.extend({"title": r.title, "url": r.url} for r in block.content)
    text = "".join(texts).strip()
    if not text:
        raise EngineError("Claude returned an empty answer")
    # Prefer what Claude actually cited; fall back to everything it looked at.
    return EngineAnswer(text=text, sources=dedupe_sources(cited or searched))


class ClaudeEngine(ApiEngine):
    """Anthropic Messages API with the server-side web search tool."""

    name = "claude"
    label = "Claude API"
    key_setting = "anthropic_api_key"

    def ask(self, prompt: str, context: BrowserContext | None) -> EngineAnswer:
        settings = get_settings()
        model = settings.anthropic_model
        client = anthropic.Anthropic(api_key=self.require_key(), timeout=settings.api_timeout_seconds)

        params: dict = {
            "model": model,
            "max_tokens": 16000,
            "tools": [
                {
                    "type": "web_search_20260209" if _is_current(model) else "web_search_20250305",
                    "name": "web_search",
                    "max_uses": 5,
                }
            ],
        }
        if _is_current(model):
            # If a safety classifier declines, the API retries on a suitable fallback model.
            params |= {
                "betas": ["server-side-fallback-2026-07-01"],
                "fallbacks": "default",
                "output_config": {"effort": "medium"},
            }

        messages = [{"role": "user", "content": prompt}]
        responses = []
        for _ in range(_MAX_CONTINUATIONS + 1):
            response = client.beta.messages.create(messages=messages, **params)
            responses.append(response)
            if response.stop_reason == "refusal":
                category = getattr(response.stop_details, "category", None)
                raise EngineNoAnswer(f"Claude declined to answer (category: {category})")
            if response.stop_reason != "pause_turn":
                break
            messages = [*messages, {"role": "assistant", "content": response.content}]
        return parse_responses(responses)
