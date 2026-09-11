from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    admin,
    ai,
    auth,
    collectors,
    demo,
    handovers,
    lots,
    materials,
    payments,
    prices,
    recommendations,
    recyclers,
    safety,
    transactions,
)
from app.config import get_settings
from app.db import SessionLocal, init_db
from app.seed.data import seed_all


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    db = SessionLocal()
    try:
        seed_all(db)
    finally:
        db.close()
    yield


settings = get_settings()
app = FastAPI(title=settings.app_name, version="1.0.0-phase1", lifespan=lifespan)

cors_origins = settings.cors_origin_list
if "*" in cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"^https?:\/\/.*$",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(auth.router)
app.include_router(collectors.router)
app.include_router(materials.router)
app.include_router(lots.router)
app.include_router(prices.router)
app.include_router(recyclers.router)
app.include_router(recommendations.router)
app.include_router(transactions.router)
app.include_router(handovers.router)
app.include_router(payments.router)
app.include_router(safety.router)
app.include_router(admin.router)
app.include_router(ai.router)
app.include_router(demo.router)


@app.get("/health")
def health():
    return {"status": "ok", "app": "E-Waste Setu", "phase": 1, "demo_mode": settings.demo_mode}
