from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import CORS_ORIGINS
from .routers import dev, leaderboard, lessons, path, users
from .seed import init_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()  # creates tables + seeds on first boot (idempotent)
    yield


app = FastAPI(title="Duolingo Clone API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=CORS_ORIGINS, allow_methods=["*"], allow_headers=["*"])

for r in (users.router, path.router, lessons.router, leaderboard.router, dev.router):
    app.include_router(r)


@app.get("/api/health", tags=["meta"])
def health():
    return {"status": "ok"}
