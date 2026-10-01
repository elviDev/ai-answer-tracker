"""Response parsing for the provider API engines, using fake responses shaped like each SDK's."""

from types import SimpleNamespace as NS

import pytest

from app.analysis import is_cited
from app.engines import EngineError, get_engine
from app.engines.claude_api import parse_responses as parse_claude
from app.engines.gemini_api import parse_interaction as parse_gemini
from app.engines.openai_api import parse_response as parse_openai
from app.engines.perplexity_api import parse_response as parse_perplexity


def test_openai_collects_url_citations():
    response = NS(
        output_text="Notion is popular.",
        output=[
            NS(type="web_search_call"),
            NS(
                type="message",
                content=[
                    NS(
                        type="output_text",
                        annotations=[
                            NS(type="url_citation", title="Notion", url="https://www.notion.com/"),
                            NS(type="url_citation", title="Notion", url="https://www.notion.com/"),
                        ],
                    )
                ],
            ),
        ],
    )
    answer = parse_openai(response)
    assert answer.text == "Notion is popular."
    assert answer.sources == [{"title": "Notion", "url": "https://www.notion.com/"}]


def test_claude_joins_text_blocks_and_prefers_citations():
    search = NS(type="web_search_tool_result", content=[NS(title="Coda", url="https://coda.io")])
    cited = NS(
        type="text",
        text="Notion leads.",
        citations=[NS(type="web_search_result_location", title="Notion", url="https://notion.com")],
    )
    paused = NS(content=[NS(type="server_tool_use"), search])
    final = NS(content=[NS(type="text", text="Overall, ", citations=None), cited])
    answer = parse_claude([paused, final])
    assert answer.text == "Overall, Notion leads."
    assert answer.sources == [{"title": "Notion", "url": "https://notion.com"}]


def test_claude_falls_back_to_search_results_when_nothing_cited():
    search = NS(type="web_search_tool_result", content=[NS(title="Coda", url="https://coda.io")])
    answer = parse_claude([NS(content=[search, NS(type="text", text="Try Coda.", citations=[])])])
    assert answer.sources == [{"title": "Coda", "url": "https://coda.io"}]


def test_gemini_reads_model_output_annotations():
    interaction = NS(
        output_text="ignored when steps have text",
        steps=[
            NS(type="google_search_call"),
            NS(
                type="model_output",
                content=[
                    NS(
                        type="text",
                        text="Notion is a strong pick.",
                        annotations=[NS(type="url_citation", title="notion.com", url="https://vertexaisearch.example/r/1")],
                    )
                ],
            ),
        ],
    )
    answer = parse_gemini(interaction)
    assert answer.text == "Notion is a strong pick."
    assert is_cited(answer.sources, ["Notion"])  # domain lives in the title for Gemini redirects


def test_perplexity_uses_search_results_then_citations():
    data = {
        "choices": [{"message": {"content": "Obsidian and Notion."}}],
        "search_results": [{"title": "Obsidian", "url": "https://obsidian.md", "snippet": "..."}],
    }
    assert parse_perplexity(data).sources == [{"title": "Obsidian", "url": "https://obsidian.md"}]

    legacy = {"choices": [{"message": {"content": "x"}}], "citations": ["https://notion.so"]}
    assert parse_perplexity(legacy).sources == [{"title": "", "url": "https://notion.so"}]

    with pytest.raises(EngineError):
        parse_perplexity({"error": "bad"})


def test_title_that_is_not_a_domain_does_not_count_as_citation():
    assert not is_cited([{"title": "Notion review", "url": "https://example.com/x"}], ["Notion"])


def test_api_engine_without_key_errors_clearly(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    engine = get_engine("openai")
    if engine.api_key():
        pytest.skip("OPENAI_API_KEY is configured locally")
    with pytest.raises(EngineError, match="OPENAI_API_KEY is not set"):
        engine.ask("hi", None)


def test_engines_endpoint_reports_availability(client):
    engines = {e["name"]: e for e in client.get("/api/engines").json()}
    assert engines["mock"]["available"] is True
    assert {"openai", "claude", "gemini", "perplexity_api"} <= engines.keys()
    for name in ("openai", "claude", "gemini", "perplexity_api"):
        assert engines[name]["requires_browser"] is False
        if not engines[name]["available"]:
            assert "API_KEY is not set" in engines[name]["unavailable_reason"]
