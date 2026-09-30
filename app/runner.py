"""Ask each of a tracker's engines its prompt and store the answers as snapshots."""

import logging
import time
from contextlib import AbstractContextManager
from pathlib import Path

from playwright.sync_api import Browser, Playwright, sync_playwright
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import analysis
from app.config import get_settings
from app.db import SessionLocal
from app.engines import Engine, EngineNoAnswer, get_engine
from app.models import Snapshot, Tracker, utcnow

log = logging.getLogger(__name__)


class BrowserSession(AbstractContextManager):
    """Launches Chromium on first use only, so mock-only runs never need a browser."""

    def __init__(self) -> None:
        self._playwright: Playwright | None = None
        self._browser: Browser | None = None

    def new_context(self):
        settings = get_settings()
        if self._browser is None:
            self._playwright = sync_playwright().start()
            self._browser = self._playwright.chromium.launch(
                headless=settings.headless, args=["--disable-blink-features=AutomationControlled"]
            )
        return self._browser.new_context(
            user_agent=settings.user_agent, locale="en-US", viewport={"width": 1366, "height": 900}
        )

    def __exit__(self, *exc) -> None:
        if self._browser:
            self._browser.close()
        if self._playwright:
            self._playwright.stop()


def _previous_success(session: Session, tracker_id: int, engine: str) -> Snapshot | None:
    return session.scalars(
        select(Snapshot)
        .where(Snapshot.tracker_id == tracker_id, Snapshot.engine == engine, Snapshot.status == "success")
        .order_by(Snapshot.created_at.desc(), Snapshot.id.desc())
        .limit(1)
    ).first()


def _save_failure_screenshot(context, tracker_id: int, engine: str) -> None:
    directory = get_settings().screenshot_dir
    if not directory or context is None:
        return
    Path(directory).mkdir(parents=True, exist_ok=True)
    for i, page in enumerate(context.pages):
        try:
            page.screenshot(path=str(Path(directory) / f"{tracker_id}-{engine}-{int(time.time())}-{i}.png"))
        except Exception:
            log.debug("Could not screenshot failed page", exc_info=True)


def run_engine(session: Session, tracker: Tracker, engine: Engine, browser: BrowserSession) -> Snapshot:
    snapshot = Snapshot(tracker_id=tracker.id, engine=engine.name, prompt=tracker.prompt, created_at=utcnow())
    started = time.perf_counter()
    context = None
    try:
        context = browser.new_context() if engine.requires_browser else None
        answer = engine.ask(tracker.prompt, context)
        snapshot.status = "success"
        snapshot.answer_text = answer.text
        snapshot.sources = answer.sources
    except EngineNoAnswer as exc:
        snapshot.status = "no_answer"
        snapshot.error = str(exc)
    except Exception as exc:
        log.warning("Engine %s failed for tracker %s: %s", engine.name, tracker.id, exc)
        snapshot.status = "error"
        snapshot.error = f"{type(exc).__name__}: {exc}"[:2000]
        _save_failure_screenshot(context, tracker.id, engine.name)
    finally:
        if context is not None:
            context.close()
    snapshot.duration_ms = int((time.perf_counter() - started) * 1000)

    if snapshot.status == "success":
        result = analysis.analyze(
            snapshot.answer_text, snapshot.sources, tracker.brand, tracker.aliases, tracker.competitors
        )
        for key, value in vars(result).items():
            setattr(snapshot, key, value)
        snapshot.answer_hash = analysis.answer_hash(snapshot.answer_text)
        previous = _previous_success(session, tracker.id, engine.name)
        if previous is not None:
            snapshot.changed = previous.answer_hash != snapshot.answer_hash
            snapshot.similarity = analysis.similarity(previous.answer_text or "", snapshot.answer_text)

    session.add(snapshot)
    session.commit()
    log.info(
        "tracker=%s engine=%s status=%s mentioned=%s rank=%s",
        tracker.id, engine.name, snapshot.status, snapshot.brand_mentioned, snapshot.brand_rank,
    )
    return snapshot


def run_tracker(tracker_id: int, engine_names: list[str] | None = None) -> list[int]:
    """Run a tracker against its engines (or `engine_names`). Returns the new snapshot ids."""
    with SessionLocal() as session:
        tracker = session.get(Tracker, tracker_id)
        if tracker is None:
            raise ValueError(f"Tracker {tracker_id} not found")
        tracker.last_run_at = utcnow()
        session.commit()

        names = engine_names or tracker.engines or get_settings().default_engines
        engines = [get_engine(name) for name in names]
        with BrowserSession() as browser:
            return [run_engine(session, tracker, engine, browser).id for engine in engines]
