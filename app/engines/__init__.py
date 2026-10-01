from app.engines.base import Engine, EngineAnswer, EngineError, EngineNoAnswer
from app.engines.chatgpt import ChatGPTEngine
from app.engines.claude_api import ClaudeEngine
from app.engines.gemini_api import GeminiEngine
from app.engines.google_ai_overview import GoogleAIOverviewEngine
from app.engines.mock import MockEngine
from app.engines.openai_api import OpenAIEngine
from app.engines.perplexity import PerplexityEngine
from app.engines.perplexity_api import PerplexityApiEngine

# Order matters: the dashboard assigns each engine a fixed color by position.
ENGINES: dict[str, type[Engine]] = {
    cls.name: cls
    for cls in (
        # Official APIs (reliable, need keys)
        OpenAIEngine,
        ClaudeEngine,
        GeminiEngine,
        PerplexityApiEngine,
        # Browser scraping (no keys, may get blocked)
        PerplexityEngine,
        ChatGPTEngine,
        GoogleAIOverviewEngine,
        MockEngine,
    )
}


def get_engine(name: str) -> Engine:
    try:
        return ENGINES[name]()
    except KeyError:
        raise ValueError(f"Unknown engine {name!r}. Available: {', '.join(ENGINES)}") from None


__all__ = ["ENGINES", "Engine", "EngineAnswer", "EngineError", "EngineNoAnswer", "get_engine"]
