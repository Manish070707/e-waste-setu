from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.helpers import ensure_timeline, lot_to_out, next_lot_id
from app.db import get_db
from app.models import Collector, Lot, PriceEntry
from app.schemas import LotCreate, LotOut
from app.services.pricing import estimate_price

router = APIRouter(prefix="/lots", tags=["lots"])


@router.post("/", response_model=LotOut)
def create_lot(body: LotCreate, db: Session = Depends(get_db)):
    if not db.get(Collector, body.collector_id):
        raise HTTPException(404, "Collector not found")
    history = db.query(PriceEntry).all()
    est = estimate_price(body.material, body.weight_kg, body.condition, body.location, history)
    lot_id = next_lot_id(db)
    lot = Lot(
        lot_id=lot_id,
        collector_id=body.collector_id,
        material=body.material,
        weight_kg=body.weight_kg,
        condition=body.condition,
        photo_data_url=body.photo_data_url,
        location=body.location,
        latitude=body.latitude,
        longitude=body.longitude,
        est_low=est["low"],
        est_high=est["high"],
        ai_prediction=body.ai_prediction,
        ai_confidence=body.ai_confidence,
        status="Created",
        created_at=datetime.utcnow(),
        is_demo=True,
    )
    db.add(lot)
    db.flush()
    ensure_timeline(db, lot_id, "lot_created")
    db.commit()
    db.refresh(lot)
    return lot_to_out(lot)


@router.get("/collector/{collector_id}", response_model=list[LotOut])
def lots_for_collector(collector_id: str, db: Session = Depends(get_db)):
    lots = (
        db.query(Lot)
        .filter(Lot.collector_id == collector_id)
        .order_by(Lot.created_at.desc())
        .all()
    )
    return [lot_to_out(l) for l in lots]


@router.get("/{lot_id}", response_model=LotOut)
def get_lot(lot_id: str, db: Session = Depends(get_db)):
    lot = db.get(Lot, lot_id)
    if not lot:
        raise HTTPException(404, "Lot not found")
    return lot_to_out(lot)
