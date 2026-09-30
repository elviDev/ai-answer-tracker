from app.engines.base import Engine, EngineAnswer, EngineError, EngineNoAnswer
from app.engines.chatgpt import ChatGPTEngine
from app.engines.google_ai_overview import GoogleAIOverviewEngine
from app.engines.mock import MockEngine
from app.engines.perplexity import PerplexityEngine

ENGINES: dict[str, type[Engine]] = {
    cls.name: cls for cls in (PerplexityEngine, ChatGPTEngine, GoogleAIOverviewEngine, MockEngine)
}


def get_engine(name: str) -> Engine:
    try:
        return ENGINES[name]()
    except KeyError:
        raise ValueError(f"Unknown engine {name!r}. Available: {', '.join(ENGINES)}") from None


__all__ = ["ENGINES", "Engine", "EngineAnswer", "EngineError", "EngineNoAnswer", "get_engine"]
