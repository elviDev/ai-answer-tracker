from urllib.parse import quote_plus

from playwright.sync_api import BrowserContext

from app.engines.base import BrowserEngine, EngineAnswer


class ChatGPTEngine(BrowserEngine):
    """Logged-out ChatGPT with web search. `?q=` pre-fills and submits the prompt."""

    name = "chatgpt"
    label = "ChatGPT"
    internal_hosts = ("chatgpt.com", "openai.com")

    # Old and current ChatGPT markup.
    MESSAGE = "[data-message-author-role='assistant'], [data-message-role='assistant']"
    ANSWER = (
        "[data-message-author-role='assistant'] .markdown, "
        "[data-message-role='assistant'] [data-assistant-markdown]"
    )

    def ask(self, prompt: str, context: BrowserContext | None) -> EngineAnswer:
        page = self.open(context, f"https://chatgpt.com/?q={quote_plus(prompt)}&hints=search")
        self.raise_if_blocked(page)
        self.click_if_visible(page, ["Accept all", "Stay logged out"], wait_ms=1500)
        text = self.wait_for_stable_text(page, self.ANSWER)
        return EngineAnswer(text=text, sources=self.extract_links(page, self.MESSAGE))
