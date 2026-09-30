from urllib.parse import quote_plus

from playwright.sync_api import BrowserContext

from app.engines.base import BrowserEngine, EngineAnswer


class PerplexityEngine(BrowserEngine):
    name = "perplexity"
    label = "Perplexity"
    internal_hosts = ("perplexity.ai",)

    ANSWER = "div[id^='markdown-content'], div.prose"

    def ask(self, prompt: str, context: BrowserContext | None) -> EngineAnswer:
        page = self.open(context, f"https://www.perplexity.ai/search?q={quote_plus(prompt)}")
        self.raise_if_blocked(page)
        self.click_if_visible(page, ["Accept All Cookies", "Accept all", "Close"], wait_ms=1000)
        text = self.wait_for_stable_text(page, self.ANSWER)
        return EngineAnswer(text=text, sources=self.extract_links(page, "main"))
