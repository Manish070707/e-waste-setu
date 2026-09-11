from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.helpers import trx_to_out
from app.db import get_db
from app.models import Collector, Transaction
from app.schemas import EarningsOut

router = APIRouter(prefix="/collectors", tags=["collectors"])


@router.get("/me")
def get_me(collector_id: str = "C-102", db: Session = Depends(get_db)):
    c = db.get(Collector, collector_id)
    if not c:
        raise HTTPException(404, "Collector not found")
    return {
        "collector_id": c.collector_id,
        "display_name": c.display_name,
        "preferred_language": c.preferred_language,
        "general_location": c.general_location,
        "is_demo": c.is_demo,
    }


@router.get("/{collector_id}/earnings", response_model=EarningsOut)
def earnings(collector_id: str, db: Session = Depends(get_db)):
    c = db.get(Collector, collector_id)
    if not c:
        raise HTTPException(404, "Collector not found")
    txns = (
        db.query(Transaction)
        .filter(Transaction.collector_id == collector_id)
        .order_by(Transaction.created_at.desc())
        .all()
    )
    total = sum(t.final_price or 0 for t in txns if t.payment_status == "Paid")
    pending = sum(
        (t.final_price or (t.quoted_price_per_kg * t.weight_kg))
        for t in txns
        if t.payment_status == "Pending"
    )
    kg = sum(t.final_weight or t.weight_kg for t in txns)
    return EarningsOut(
        total_earnings=round(total, 2),
        pending=round(pending, 2),
        transactions_count=len(txns),
        material_sold_kg=round(kg, 2),
        items=[trx_to_out(t) for t in txns],
    )
