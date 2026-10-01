import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import RedirectResponse

from app.api import router
from app.db import init_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    init_db()
    yield


app = FastAPI(
    title="AI Answer Tracker",
    description="Track how AI engines answer questions about any brand or keyword over time.",
    version="0.1.0",
    lifespan=lifespan,
)
app.include_router(router)


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok"}


@app.get("/", include_in_schema=False)
def root():
    # The dashboard is the Next.js app in web/; the API root points at its docs.
    return RedirectResponse("/docs")
