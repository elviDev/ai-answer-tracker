"""Scheduler loop: runs every active tracker whose interval has elapsed.

    python -m app.worker          # run forever
    python -m app.worker --once   # run whatever is due, then exit (handy for cron)
"""

import argparse
import logging
import time
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import SessionLocal, init_db
from app.models import Tracker
from app.runner import run_tracker

log = logging.getLogger("app.worker")


def due_tracker_ids(session: Session, now: datetime | None = None) -> list[int]:
    now = now or datetime.now(UTC)
    due = []
    for tracker in session.scalars(select(Tracker).where(Tracker.active.is_(True)).order_by(Tracker.id)):
        last = tracker.last_run_at
        if last is not None and last.tzinfo is None:  # SQLite drops tz info
            last = last.replace(tzinfo=UTC)
        if last is None or last + timedelta(minutes=tracker.interval_minutes) <= now:
            due.append(tracker.id)
    return due


def run_due() -> int:
    with SessionLocal() as session:
        ids = due_tracker_ids(session)
    for tracker_id in ids:
        try:
            run_tracker(tracker_id)
        except Exception:
            log.exception("Tracker %s failed", tracker_id)
    return len(ids)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--once", action="store_true", help="run due trackers once and exit")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    init_db()
    poll = get_settings().worker_poll_seconds
    log.info("Worker started (poll every %ss)", poll)
    while True:
        count = run_due()
        if count:
            log.info("Ran %s tracker(s)", count)
        if args.once:
            return
        time.sleep(poll)


if __name__ == "__main__":
    main()
