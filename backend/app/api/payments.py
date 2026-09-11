from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.helpers import advance_timeline, trx_to_out
from app.db import get_db
from app.models import Transaction
from app.schemas import PaymentMark, TransactionOut

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/mark", response_model=TransactionOut)
def mark_payment(body: PaymentMark, db: Session = Depends(get_db)):
    t = db.get(Transaction, body.transaction_id)
    if not t:
        raise HTTPException(404, "Transaction not found")
    t.payment_status = body.payment_status
    t.payment_method = body.payment_method
    t.updated_at = datetime.utcnow()
    if body.payment_status == "Paid":
        t.transaction_status = "PaymentCompleted"
        if t.final_price is None:
            t.final_price = round((t.final_weight or t.weight_kg) * t.quoted_price_per_kg, 2)
        advance_timeline(db, t.lot_id, "sent_recycling")
        t.lot.status = "RecyclerVerified"
    db.commit()
    db.refresh(t)
    return trx_to_out(t)
