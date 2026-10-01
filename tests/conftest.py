import os

# Must be set before the app (and its DB engine) is imported.
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["DEFAULT_ENGINES"] = '["mock"]'
os.environ["API_TOKEN"] = ""  # tests must not depend on a developer's .env token

import pytest
from fastapi.testclient import TestClient

from app.db import Base, engine, init_db
from app.main import app


@pytest.fixture(autouse=True)
def fresh_db():
    init_db()
    yield
    Base.metadata.drop_all(engine)


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
