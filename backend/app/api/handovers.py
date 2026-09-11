from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.helpers import advance_timeline, lot_to_out, recycler_to_out, trx_to_out
from app.db import get_db
from app.models import TraceEvent, Transaction
from app.schemas import HandoverConfirm, HandoverOut, TraceEventOut

router = APIRouter(prefix="/handovers", tags=["handovers"])


@router.get("/{trx_id}", response_model=HandoverOut)
def get_handover(trx_id: str, db: Session = Depends(get_db)):
    t = db.get(Transaction, trx_id)
    if not t:
        raise HTTPException(404, "Transaction not found")
    timeline = (
        db.query(TraceEvent)
        .filter(TraceEvent.lot_id == t.lot_id)
        .order_by(TraceEvent.sort_order.asc())
        .all()
    )
    return HandoverOut(
        transaction=trx_to_out(t),
        timeline=[TraceEventOut.model_validate(e) for e in timeline],
        lot=lot_to_out(t.lot),
        recycler=recycler_to_out(t.recycler, material=t.material, offered_rate=t.quoted_price_per_kg),
    )


@router.post("/{trx_id}/confirm", response_model=HandoverOut)
def confirm_handover(trx_id: str, body: HandoverConfirm, db: Session = Depends(get_db)):
    t = db.get(Transaction, trx_id)
    if not t:
        raise HTTPException(404, "Transaction not found")

    t.final_weight = body.final_weight
    t.final_price = (
        body.final_price
        if body.final_price is not None
        else round(body.final_weight * t.quoted_price_per_kg, 2)
    )
    t.handover_location = body.handover_location or t.collection_location
    t.payment_method = body.payment_method
    t.updated_at = datetime.utcnow()

    if body.mark_paid:
        t.payment_status = "Paid"
        t.transaction_status = "PaymentCompleted"
        t.lot.status = "RecyclerVerified"
        advance_timeline(db, t.lot_id, "sent_recycling")
    else:
        t.payment_status = "Pending"
        t.transaction_status = "WeightVerified"
        t.lot.status = "WeightVerified"
        advance_timeline(db, t.lot_id, "weight_verified")

    db.commit()
    db.refresh(t)
    timeline = (
        db.query(TraceEvent)
        .filter(TraceEvent.lot_id == t.lot_id)
        .order_by(TraceEvent.sort_order.asc())
        .all()
    )
    return HandoverOut(
        transaction=trx_to_out(t),
        timeline=[TraceEventOut.model_validate(e) for e in timeline],
        lot=lot_to_out(t.lot),
        recycler=recycler_to_out(t.recycler, material=t.material, offered_rate=t.quoted_price_per_kg),
    )
