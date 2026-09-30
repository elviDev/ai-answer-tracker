"""Pure functions that turn an engine's answer into brand-visibility metrics."""

import difflib
import hashlib
import re
from dataclasses import dataclass, field
from urllib.parse import urlparse


@dataclass
class Analysis:
    brand_mentioned: bool = False
    mention_count: int = 0
    first_mention_offset: float | None = None
    brand_rank: int | None = None
    brand_cited: bool = False
    competitor_mentions: dict[str, int] = field(default_factory=dict)


def _terms(*groups: list[str] | str) -> list[str]:
    seen: dict[str, str] = {}
    for group in groups:
        for term in [group] if isinstance(group, str) else group:
            term = term.strip()
            if term and term.lower() not in seen:
                seen[term.lower()] = term
    return list(seen.values())


def find_mentions(text: str, terms: list[str]) -> list[int]:
    """Start offsets of every whole-word, case-insensitive match of any term."""
    terms = _terms(terms)
    if not text or not terms:
        return []
    # Longest first so "Acme Cloud" wins over "Acme" at the same position.
    alternatives = "|".join(re.escape(t) for t in sorted(terms, key=len, reverse=True))
    pattern = re.compile(rf"(?<!\w)(?:{alternatives})(?!\w)", re.IGNORECASE)
    return [m.start() for m in pattern.finditer(text)]


def _slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", value.lower())


def is_cited(sources: list[dict], terms: list[str]) -> bool:
    """True if any source URL's domain contains the brand (e.g. "Notion" -> notion.so)."""
    slugs = [s for s in (_slug(t) for t in terms) if len(s) >= 3]
    for source in sources:
        host = urlparse(source.get("url", "")).hostname or ""
        host_slug = _slug(host.removeprefix("www."))
        if any(slug in host_slug for slug in slugs):
            return True
    return False


def analyze(
    text: str,
    sources: list[dict],
    brand: str,
    aliases: list[str] | None = None,
    competitors: list[str] | None = None,
) -> Analysis:
    brand_terms = _terms(brand, aliases or [])
    positions = find_mentions(text, brand_terms)

    competitor_first: dict[str, int] = {}
    competitor_counts: dict[str, int] = {}
    for competitor in _terms(competitors or []):
        hits = find_mentions(text, [competitor])
        competitor_counts[competitor] = len(hits)
        if hits:
            competitor_first[competitor] = hits[0]

    rank = None
    if positions:
        rank = 1 + sum(1 for first in competitor_first.values() if first < positions[0])

    return Analysis(
        brand_mentioned=bool(positions),
        mention_count=len(positions),
        first_mention_offset=round(positions[0] / len(text), 4) if positions else None,
        brand_rank=rank,
        brand_cited=is_cited(sources, brand_terms),
        competitor_mentions=competitor_counts,
    )


def normalize(text: str) -> str:
    return " ".join(text.lower().split())


def answer_hash(text: str) -> str:
    return hashlib.sha256(normalize(text).encode()).hexdigest()


def similarity(a: str, b: str) -> float:
    """Word-level similarity ratio between two answers (1.0 = identical)."""
    matcher = difflib.SequenceMatcher(None, normalize(a).split(), normalize(b).split(), autojunk=False)
    return round(matcher.ratio(), 4)
