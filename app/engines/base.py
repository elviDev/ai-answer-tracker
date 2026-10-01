import time
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import ClassVar
from urllib.parse import urlparse

from playwright.sync_api import BrowserContext, Page
from playwright.sync_api import TimeoutError as PlaywrightTimeout

from app.config import get_settings


class EngineError(Exception):
    """The engine could not produce an answer (blocked, layout changed, timeout...)."""


class EngineNoAnswer(EngineError):
    """The engine worked but chose not to answer (e.g. Google showed no AI Overview)."""


@dataclass
class EngineAnswer:
    text: str
    sources: list[dict] = field(default_factory=list)  # [{"title": ..., "url": ...}]


def dedupe_sources(sources: list[dict]) -> list[dict]:
    seen: set[str] = set()
    unique = []
    for source in sources:
        url = source.get("url") or ""
        if url.startswith("http") and url not in seen:
            seen.add(url)
            unique.append({"title": (source.get("title") or "")[:300], "url": url})
    return unique


class Engine(ABC):
    name: ClassVar[str]
    label: ClassVar[str]
    requires_browser: ClassVar[bool] = True

    @classmethod
    def unavailable_reason(cls) -> str | None:
        """Why this engine can't run right now (e.g. missing API key), or None if it can."""
        return None

    @abstractmethod
    def ask(self, prompt: str, context: BrowserContext | None) -> EngineAnswer: ...


class ApiEngine(Engine):
    """An engine that calls a provider's official API (with web search) instead of scraping."""

    requires_browser = False
    # Settings attribute holding the API key, and the env var users set.
    key_setting: ClassVar[str]

    @classmethod
    def api_key(cls) -> str | None:
        return getattr(get_settings(), cls.key_setting)

    @classmethod
    def unavailable_reason(cls) -> str | None:
        return None if cls.api_key() else f"{cls.key_setting.upper()} is not set"

    def require_key(self) -> str:
        key = self.api_key()
        if not key:
            raise EngineError(self.unavailable_reason())
        return key


class BrowserEngine(Engine):
    """Shared helpers for engines that scrape a web UI with Playwright."""

    # Hostnames whose links are engine UI, not real citations.
    internal_hosts: ClassVar[tuple[str, ...]] = ()
    # Short "answers" containing these are a login/rate-limit wall, not a real answer.
    wall_phrases: ClassVar[tuple[str, ...]] = ("sign up", "log in to continue", "rate limit", "too many requests")

    @property
    def timeout_s(self) -> float:
        return get_settings().browser_timeout_seconds

    def open(self, context: BrowserContext, url: str) -> Page:
        page = context.new_page()
        page.set_default_timeout(self.timeout_s * 1000)
        page.goto(url, wait_until="domcontentloaded")
        return page

    @staticmethod
    def click_if_visible(page: Page, button_names: list[str], wait_ms: int = 1500) -> bool:
        """Dismiss consent banners / login nags. Returns True if something was clicked."""
        for name in button_names:
            button = page.get_by_role("button", name=name, exact=False).first
            try:
                button.wait_for(state="visible", timeout=wait_ms)
                button.click()
                return True
            except PlaywrightTimeout:
                continue
        return False

    @staticmethod
    def raise_if_blocked(page: Page) -> None:
        title = page.title().lower()
        if "just a moment" in title or "attention required" in title:
            raise EngineError("Blocked by a bot challenge (Cloudflare)")
        if "/sorry/" in page.url:
            raise EngineError("Blocked by a CAPTCHA")

    def wait_for_stable_text(self, page: Page, selector: str) -> str:
        """Poll the last element matching `selector` until its text stops changing (streaming is done)."""
        settle = get_settings().answer_settle_seconds
        deadline = time.monotonic() + self.timeout_s
        try:
            page.wait_for_selector(selector, state="attached", timeout=self.timeout_s * 1000)
        except PlaywrightTimeout:
            self.raise_if_blocked(page)
            raise EngineError(f"Answer never appeared (selector {selector!r})") from None

        last, stable_since = "", time.monotonic()
        while time.monotonic() < deadline:
            text = page.locator(selector).last.inner_text().strip()
            now = time.monotonic()
            if text != last:
                last, stable_since = text, now
            elif text and now - stable_since >= settle:
                return self._reject_walls(text)
            page.wait_for_timeout(500)
        if last:
            return self._reject_walls(last)
        raise EngineError("Answer stayed empty until timeout")

    def _reject_walls(self, text: str) -> str:
        lowered = text.lower()
        if len(text) < 200 and any(phrase in lowered for phrase in self.wall_phrases):
            raise EngineError(f"{self.label} returned a sign-in/limit wall instead of an answer: {text!r}")
        return text

    def extract_links(self, page: Page, selector: str) -> list[dict]:
        raw = page.eval_on_selector_all(
            f":is({selector}) a[href]",
            "els => els.map(e => ({title: (e.innerText || e.title || '').trim(), url: e.href}))",
        )
        external = [
            link
            for link in raw
            if not any(
                (host := urlparse(link["url"]).hostname or "") == h or host.endswith("." + h)
                for h in self.internal_hosts
            )
        ]
        return dedupe_sources(external)
