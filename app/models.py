from datetime import UTC, datetime

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

JSONType = JSON().with_variant(JSONB(), "postgresql")


def utcnow() -> datetime:
    return datetime.now(UTC)


class Tracker(Base):
    """A brand/keyword plus the question we keep asking AI engines about it."""

    __tablename__ = "trackers"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    brand: Mapped[str] = mapped_column(String(200))
    aliases: Mapped[list[str]] = mapped_column(JSONType, default=list)
    competitors: Mapped[list[str]] = mapped_column(JSONType, default=list)
    prompt: Mapped[str] = mapped_column(Text)
    engines: Mapped[list[str]] = mapped_column(JSONType, default=list)
    interval_minutes: Mapped[int] = mapped_column(Integer, default=1440)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    last_run_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    snapshots: Mapped[list["Snapshot"]] = relationship(
        back_populates="tracker", cascade="all, delete-orphan", passive_deletes=True
    )


class Snapshot(Base):
    """One answer from one engine at one point in time, plus what we learned from it."""

    __tablename__ = "snapshots"
    __table_args__ = (Index("ix_snapshots_tracker_engine_created", "tracker_id", "engine", "created_at"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    tracker_id: Mapped[int] = mapped_column(ForeignKey("trackers.id", ondelete="CASCADE"))
    engine: Mapped[str] = mapped_column(String(50))
    prompt: Mapped[str] = mapped_column(Text)
    # success | no_answer | error
    status: Mapped[str] = mapped_column(String(20))
    error: Mapped[str | None] = mapped_column(Text)
    duration_ms: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    answer_text: Mapped[str | None] = mapped_column(Text)
    sources: Mapped[list[dict]] = mapped_column(JSONType, default=list)

    # Analysis
    brand_mentioned: Mapped[bool] = mapped_column(Boolean, default=False)
    mention_count: Mapped[int] = mapped_column(Integer, default=0)
    # Where the first mention appears, as a fraction of the answer length (0 = very start).
    first_mention_offset: Mapped[float | None] = mapped_column(Float)
    # 1-based position of the brand among brand+competitors, ordered by first mention.
    brand_rank: Mapped[int | None] = mapped_column(Integer)
    brand_cited: Mapped[bool] = mapped_column(Boolean, default=False)
    competitor_mentions: Mapped[dict[str, int]] = mapped_column(JSONType, default=dict)

    # Change detection against the previous successful answer from the same engine.
    answer_hash: Mapped[str | None] = mapped_column(String(64))
    changed: Mapped[bool | None] = mapped_column(Boolean)
    similarity: Mapped[float | None] = mapped_column(Float)

    tracker: Mapped[Tracker] = relationship(back_populates="snapshots")
