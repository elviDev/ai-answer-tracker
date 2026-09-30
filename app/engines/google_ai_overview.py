from urllib.parse import quote_plus

from playwright.sync_api import BrowserContext
from playwright.sync_api import TimeoutError as PlaywrightTimeout

from app.engines.base import BrowserEngine, EngineAnswer, EngineNoAnswer

# Google's class names are obfuscated and change often, so anchor on the visible
# "AI Overview" heading and walk up to the block that holds the answer.
_FIND_OVERVIEW = """
() => {
  const heading = [...document.querySelectorAll('h1, h2, div, span')]
    .find(el => el.childElementCount === 0 && el.textContent.trim() === 'AI Overview');
  if (!heading) return null;
  let node = heading;
  while (node.parentElement && node.innerText.length < 300) node = node.parentElement;
  node.setAttribute('data-ai-tracker', 'overview');
  return node.innerText;
}
"""

_MARKER = "[data-ai-tracker='overview']"


class GoogleAIOverviewEngine(BrowserEngine):
    name = "google_ai_overview"
    label = "Google AI Overview"
    internal_hosts = ("google.com", "gstatic.com", "googleusercontent.com")

    def ask(self, prompt: str, context: BrowserContext | None) -> EngineAnswer:
        page = self.open(context, f"https://www.google.com/search?q={quote_plus(prompt)}&hl=en&gl=us")
        self.click_if_visible(page, ["Accept all", "Reject all"], wait_ms=1500)
        self.raise_if_blocked(page)

        try:
            page.get_by_text("AI Overview", exact=True).first.wait_for(timeout=15_000)
        except PlaywrightTimeout:
            raise EngineNoAnswer("Google did not show an AI Overview for this query") from None

        page.evaluate(_FIND_OVERVIEW)
        # Overviews are collapsed by default.
        try:
            page.locator(_MARKER).get_by_role("button", name="Show more").first.click(timeout=3000)
        except PlaywrightTimeout:
            pass
        text = self.wait_for_stable_text(page, _MARKER)
        return EngineAnswer(text=text.removeprefix("AI Overview").strip(), sources=self.extract_links(page, _MARKER))
