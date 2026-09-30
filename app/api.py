from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db import get_session
from app.engines import ENGINES
from app.models import Snapshot, Tracker
from app.runner import run_tracker
from app.schemas import (
    EngineInfo,
    EngineStats,
    RunAccepted,
    RunRequest,
    SnapshotOut,
    TimelinePoint,
    TrackerCreate,
    TrackerOut,
    TrackerStats,
    TrackerUpdate,
)

router = APIRouter(prefix="/api")
SessionDep = Annotated[Session, Depends(get_session)]


def _get_tracker(session: Session, tracker_id: int) -> Tracker:
    tracker = session.get(Tracker, tracker_id)
    if tracker is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tracker not found")
    return tracker


@router.get("/engines", response_model=list[EngineInfo])
def list_engines():
    return [EngineInfo(name=n, label=cls.label, requires_browser=cls.requires_browser) for n, cls in ENGINES.items()]


@router.get("/trackers", response_model=list[TrackerOut])
def list_trackers(session: SessionDep):
    return session.scalars(select(Tracker).order_by(Tracker.id)).all()


@router.post("/trackers", response_model=TrackerOut, status_code=status.HTTP_201_CREATED)
def create_tracker(payload: TrackerCreate, session: SessionDep):
    data = payload.model_dump()
    data["engines"] = data["engines"] or get_settings().default_engines
    tracker = Tracker(**data)
    session.add(tracker)
    session.commit()
    return tracker


@router.get("/trackers/{tracker_id}", response_model=TrackerOut)
def get_tracker(tracker_id: int, session: SessionDep):
    return _get_tracker(session, tracker_id)


@router.patch("/trackers/{tracker_id}", response_model=TrackerOut)
def update_tracker(tracker_id: int, payload: TrackerUpdate, session: SessionDep):
    tracker = _get_tracker(session, tracker_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        if key == "engines" and not value:
            value = get_settings().default_engines
        if value is not None:
            setattr(tracker, key, value)
    session.commit()
    return tracker


@router.delete("/trackers/{tracker_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tracker(tracker_id: int, session: SessionDep):
    session.delete(_get_tracker(session, tracker_id))
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/trackers/{tracker_id}/run", response_model=RunAccepted, status_code=status.HTTP_202_ACCEPTED)
def run_now(tracker_id: int, session: SessionDep, background: BackgroundTasks, payload: RunRequest | None = None):
    tracker = _get_tracker(session, tracker_id)
    engines = (payload and payload.engines) or tracker.engines or get_settings().default_engines
    background.add_task(run_tracker, tracker_id, engines)
    return RunAccepted(tracker_id=tracker_id, engines=engines)


@router.get("/trackers/{tracker_id}/snapshots", response_model=list[SnapshotOut])
def list_snapshots(
    tracker_id: int,
    session: SessionDep,
    engine: str | None = None,
    since: datetime | None = None,
    limit: Annotated[int, Query(ge=1, le=500)] = 50,
):
    _get_tracker(session, tracker_id)
    query = select(Snapshot).where(Snapshot.tracker_id == tracker_id)
    if engine:
        query = query.where(Snapshot.engine == engine)
    if since:
        query = query.where(Snapshot.created_at >= since)
    return session.scalars(query.order_by(Snapshot.created_at.desc(), Snapshot.id.desc()).limit(limit)).all()


@router.get("/snapshots/{snapshot_id}", response_model=SnapshotOut)
def get_snapshot(snapshot_id: int, session: SessionDep):
    snapshot = session.get(Snapshot, snapshot_id)
    if snapshot is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Snapshot not found")
    return snapshot


def _rate(part: int, whole: int) -> float | None:
    return round(part / whole, 4) if whole else None


@router.get("/trackers/{tracker_id}/stats", response_model=TrackerStats)
def tracker_stats(tracker_id: int, session: SessionDep, since: datetime | None = None):
    tracker = _get_tracker(session, tracker_id)
    query = select(Snapshot).where(Snapshot.tracker_id == tracker_id)
    if since:
        query = query.where(Snapshot.created_at >= since)
    snapshots = session.scalars(query.order_by(Snapshot.created_at, Snapshot.id)).all()

    by_engine: dict[str, list[Snapshot]] = {}
    for snap in snapshots:
        by_engine.setdefault(snap.engine, []).append(snap)

    engines = []
    for engine, snaps in by_engine.items():
        ok = [s for s in snaps if s.status == "success"]
        ranks = [s.brand_rank for s in ok if s.brand_rank is not None]
        competitors = {c for s in ok for c in s.competitor_mentions}
        engines.append(
            EngineStats(
                engine=engine,
                total_runs=len(snaps),
                successful_runs=len(ok),
                mention_rate=_rate(sum(s.brand_mentioned for s in ok), len(ok)),
                citation_rate=_rate(sum(s.brand_cited for s in ok), len(ok)),
                avg_rank=round(sum(ranks) / len(ranks), 2) if ranks else None,
                changes=sum(bool(s.changed) for s in ok),
                competitor_mention_rate={
                    c: _rate(sum(1 for s in ok if s.competitor_mentions.get(c)), len(ok)) for c in sorted(competitors)
                },
                last_run_at=snaps[-1].created_at,
                timeline=[
                    TimelinePoint(
                        snapshot_id=s.id,
                        created_at=s.created_at,
                        status=s.status,
                        brand_mentioned=s.brand_mentioned,
                        mention_count=s.mention_count,
                        brand_rank=s.brand_rank,
                        brand_cited=s.brand_cited,
                        changed=s.changed,
                    )
                    for s in snaps
                ],
            )
        )
    return TrackerStats(tracker_id=tracker.id, brand=tracker.brand, engines=engines)
