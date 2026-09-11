from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Collector, Lot, Recycler, Transaction
from app.schemas import AdminMetrics

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/metrics", response_model=AdminMetrics)
def metrics(db: Session = Depends(get_db)):
    total_kg = db.query(func.coalesce(func.sum(Lot.weight_kg), 0)).scalar() or 0
    collectors = db.query(Collector).count()
    verified = db.query(Recycler).filter(Recycler.authorization_status == "Verified").count()
    earnings = (
        db.query(func.coalesce(func.sum(Transaction.final_price), 0))
        .filter(Transaction.payment_status == "Paid")
        .scalar()
        or 0
    )
    txn_count = db.query(Transaction).count()
    pending = db.query(Transaction).filter(Transaction.payment_status == "Pending").count()
    hazardous = (
        db.query(Lot)
        .filter(Lot.material.in_(["Battery", "CRT"]))
        .count()
    )
    return AdminMetrics(
        total_ewaste_kg=float(total_kg),
        formal_recycling_pct=95.0,
        active_collectors=collectors,
        authorized_recyclers=verified,
        total_collector_earnings=float(earnings),
        avg_price_improvement_pct=18.75,
        transactions=txn_count,
        pending_handovers=pending,
        hazardous_material_count=hazardous,
        is_demo=True,
    )
