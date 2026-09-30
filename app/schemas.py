from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.engines import ENGINES


def _check_engines(value: list[str] | None) -> list[str] | None:
    if value is None:
        return value
    unknown = [name for name in value if name not in ENGINES]
    if unknown:
        raise ValueError(f"Unknown engine(s): {', '.join(unknown)}. Available: {', '.join(ENGINES)}")
    return list(dict.fromkeys(value))


class TrackerBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    brand: str = Field(min_length=1, max_length=200, description="Brand or keyword to look for in answers")
    aliases: list[str] = Field(default_factory=list, description="Other spellings that count as the brand")
    competitors: list[str] = Field(default_factory=list, description="Rivals to rank the brand against")
    prompt: str = Field(min_length=1, description="The question asked to every engine")
    engines: list[str] | None = Field(default=None, description="Engines to query; defaults to DEFAULT_ENGINES")
    interval_minutes: int = Field(default=1440, ge=5, description="How often the worker re-runs this tracker")
    active: bool = True

    _validate_engines = field_validator("engines")(_check_engines)


class TrackerCreate(TrackerBase):
    pass


class TrackerUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    brand: str | None = Field(default=None, min_length=1, max_length=200)
    aliases: list[str] | None = None
    competitors: list[str] | None = None
    prompt: str | None = Field(default=None, min_length=1)
    engines: list[str] | None = None
    interval_minutes: int | None = Field(default=None, ge=5)
    active: bool | None = None

    _validate_engines = field_validator("engines")(_check_engines)


class TrackerOut(TrackerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    engines: list[str]
    created_at: datetime
    last_run_at: datetime | None


class RunRequest(BaseModel):
    engines: list[str] | None = None

    _validate_engines = field_validator("engines")(_check_engines)


class RunAccepted(BaseModel):
    tracker_id: int
    engines: list[str]
    detail: str = "Run started in the background; poll the snapshots endpoint for results."


class SnapshotOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tracker_id: int
    engine: str
    prompt: str
    status: str
    error: str | None
    duration_ms: int
    created_at: datetime
    answer_text: str | None
    sources: list[dict]
    brand_mentioned: bool
    mention_count: int
    first_mention_offset: float | None
    brand_rank: int | None
    brand_cited: bool
    competitor_mentions: dict[str, int]
    changed: bool | None
    similarity: float | None


class TimelinePoint(BaseModel):
    snapshot_id: int
    created_at: datetime
    status: str
    brand_mentioned: bool
    mention_count: int
    brand_rank: int | None
    brand_cited: bool
    changed: bool | None


class EngineStats(BaseModel):
    engine: str
    total_runs: int
    successful_runs: int
    mention_rate: float | None = Field(description="Share of successful answers that mention the brand")
    citation_rate: float | None = Field(description="Share of successful answers citing the brand's site")
    avg_rank: float | None
    changes: int = Field(description="Answers that differed from the previous one")
    competitor_mention_rate: dict[str, float]
    last_run_at: datetime | None
    timeline: list[TimelinePoint]


class TrackerStats(BaseModel):
    tracker_id: int
    brand: str
    engines: list[EngineStats]


class EngineInfo(BaseModel):
    name: str
    label: str
    requires_browser: bool
