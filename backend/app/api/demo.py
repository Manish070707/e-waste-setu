"""SIH Demo Scenario — completes full journey in under 3 minutes."""

from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.helpers import (
    advance_timeline,
    ensure_timeline,
    lot_to_out,
    trx_to_out,
)
from app.db import get_db
from app.models import Lot, TraceEvent, Transaction
from app.schemas import DemoScenarioResponse

router = APIRouter(prefix="/demo", tags=["demo"])

DEMO_LOT_ID = "EW-2026-00182"
DEMO_TRX_ID = "TRX-982731"


@router.post("/scenario", response_model=DemoScenarioResponse)
def run_demo_scenario(db: Session = Depends(get_db)):
    """
    Loads Demo Collector C-102 journey:
    PCB 20kg → Green Recovery Solutions ₹145/kg → final 20.4kg → ₹2958 → TRX-982731
    """
    # Remove prior demo scenario artifacts if present
    existing_trx = db.get(Transaction, DEMO_TRX_ID)
    if existing_trx:
        db.query(TraceEvent).filter(TraceEvent.lot_id == existing_trx.lot_id).delete()
        db.delete(existing_trx)
        db.commit()
    existing_lot = db.get(Lot, DEMO_LOT_ID)
    if existing_lot:
        db.query(TraceEvent).filter(TraceEvent.lot_id == DEMO_LOT_ID).delete()
        if existing_lot.transaction:
            db.delete(existing_lot.transaction)
        db.delete(existing_lot)
        db.commit()

    now = datetime.utcnow()
    lot = Lot(
        lot_id=DEMO_LOT_ID,
        collector_id="C-102",
        material="PCB",
        weight_kg=20.0,
        condition="Good",
        photo_data_url=None,
        location="Gurugram",
        latitude=28.4595,
        longitude=77.0266,
        est_low=2400,
        est_high=3000,
        ai_prediction="PCB",
        ai_confidence=0.92,
        status="RecyclerVerified",
        created_at=now,
        is_demo=True,
    )
    db.add(lot)
    db.flush()

    trx = Transaction(
        transaction_id=DEMO_TRX_ID,
        lot_id=DEMO_LOT_ID,
        collector_id="C-102",
        recycler_id="R-GRS",
        material="PCB",
        weight_kg=20.0,
        quoted_price_per_kg=145.0,
        final_weight=20.4,
        final_price=2958.0,
        collection_location="Gurugram",
        handover_location="Gurugram",
        payment_status="Paid",
        payment_method="Cash",
        transaction_status="PaymentCompleted",
        created_at=now,
        updated_at=now,
        is_demo=True,
    )
    db.add(trx)
    db.flush()
    ensure_timeline(db, DEMO_LOT_ID, "lot_created")
    advance_timeline(db, DEMO_LOT_ID, "sent_recycling")
    db.commit()
    db.refresh(lot)
    db.refresh(trx)

    return DemoScenarioResponse(
        lot=lot_to_out(lot),
        transaction=trx_to_out(trx),
        message="Demo scenario loaded: C-102 → PCB 20kg → Green Recovery Solutions → TRX-982731 → ₹2,958 Paid",
    )
