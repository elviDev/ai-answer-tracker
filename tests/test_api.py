from datetime import UTC, datetime, timedelta

from app.db import SessionLocal
from app.models import Tracker
from app.worker import due_tracker_ids, run_due

TRACKER = {
    "name": "Vendors",
    "brand": "Acme",
    "competitors": ["Globex", "Initech", "Umbrella", "Hooli"],
    "prompt": "Which vendor should I pick?",
    "engines": ["mock"],
}


def test_health_and_dashboard(client):
    assert client.get("/health").json() == {"status": "ok"}
    assert "AI Answer Tracker" in client.get("/").text


def test_tracker_crud(client):
    created = client.post("/api/trackers", json=TRACKER).json()
    assert created["engines"] == ["mock"]

    updated = client.patch(f"/api/trackers/{created['id']}", json={"interval_minutes": 60, "active": False}).json()
    assert updated["interval_minutes"] == 60 and updated["active"] is False

    assert len(client.get("/api/trackers").json()) == 1
    assert client.delete(f"/api/trackers/{created['id']}").status_code == 204
    assert client.get(f"/api/trackers/{created['id']}").status_code == 404


def test_engines_default_and_validation(client):
    created = client.post("/api/trackers", json={**TRACKER, "engines": None}).json()
    assert created["engines"] == ["mock"]  # DEFAULT_ENGINES in conftest

    bad = client.post("/api/trackers", json={**TRACKER, "engines": ["altavista"]})
    assert bad.status_code == 422


def test_run_creates_snapshots_and_stats(client):
    tracker_id = client.post("/api/trackers", json=TRACKER).json()["id"]

    for _ in range(2):
        assert client.post(f"/api/trackers/{tracker_id}/run").status_code == 202

    snaps = client.get(f"/api/trackers/{tracker_id}/snapshots").json()
    assert len(snaps) == 2
    latest, first = snaps
    assert latest["status"] == "success"
    assert latest["answer_text"]
    assert sum(latest["competitor_mentions"].values()) >= 2
    assert first["changed"] is None  # nothing to compare the first answer to
    assert latest["changed"] is False  # mock answers are stable within a day
    assert latest["similarity"] == 1.0

    stats = client.get(f"/api/trackers/{tracker_id}/stats").json()
    (mock,) = stats["engines"]
    assert mock["engine"] == "mock"
    assert mock["total_runs"] == mock["successful_runs"] == 2
    assert mock["mention_rate"] in (0.0, 1.0)
    assert len(mock["timeline"]) == 2


def test_run_rejects_unknown_engine(client):
    tracker_id = client.post("/api/trackers", json=TRACKER).json()["id"]
    assert client.post(f"/api/trackers/{tracker_id}/run", json={"engines": ["nope"]}).status_code == 422


def test_worker_runs_only_due_trackers(client):
    tracker_id = client.post("/api/trackers", json={**TRACKER, "interval_minutes": 60}).json()["id"]
    paused_id = client.post("/api/trackers", json={**TRACKER, "active": False}).json()["id"]

    with SessionLocal() as session:
        assert due_tracker_ids(session) == [tracker_id]

    assert run_due() == 1
    with SessionLocal() as session:
        assert due_tracker_ids(session) == []
        assert due_tracker_ids(session, now=datetime.now(UTC) + timedelta(minutes=61)) == [tracker_id]
        assert session.get(Tracker, paused_id).last_run_at is None
