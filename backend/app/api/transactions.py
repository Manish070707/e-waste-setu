from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.helpers import advance_timeline, ensure_timeline, next_trx_id, trx_to_out
from app.db import get_db
from app.models import Lot, PriceEntry, Recycler, Transaction
from app.schemas import TransactionCreate, TransactionOut
from app.services.pricing import detect_price_anomaly, estimate_price

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/", response_model=list[TransactionOut])
def list_transactions(
    collector_id: str | None = None,
    recycler_id: str | None = None,
    payment_status: str | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(Transaction)
    if collector_id:
        q = q.filter(Transaction.collector_id == collector_id)
    if recycler_id:
        q = q.filter(Transaction.recycler_id == recycler_id)
    if payment_status:
        q = q.filter(Transaction.payment_status == payment_status)
    rows = q.order_by(Transaction.created_at.desc()).all()
    return [trx_to_out(t) for t in rows]


@router.post("/", response_model=TransactionOut)
def create_transaction(body: TransactionCreate, db: Session = Depends(get_db)):
    lot = db.get(Lot, body.lot_id)
    if not lot:
        raise HTTPException(404, "Lot not found")
    recycler = db.get(Recycler, body.recycler_id)
    if not recycler:
        raise HTTPException(404, "Recycler not found")
    if recycler.authorization_status != "Verified":
        raise HTTPException(400, "Only verified recyclers can be selected")
    if lot.transaction:
        raise HTTPException(400, "Lot already has a transaction")

    history = db.query(PriceEntry).all()
    est = estimate_price(lot.material, lot.weight_kg, lot.condition, lot.location, history)
    anomaly = detect_price_anomaly(body.quoted_price_per_kg, est["rate_low"], est["rate_high"])

    trx_id = next_trx_id(db)
    t = Transaction(
        transaction_id=trx_id,
        lot_id=lot.lot_id,
        collector_id=lot.collector_id,
        recycler_id=body.recycler_id,
        material=lot.material,
        weight_kg=lot.weight_kg,
        quoted_price_per_kg=body.quoted_price_per_kg,
        collection_location=lot.location,
        payment_status="Pending",
        transaction_status="RecyclerSelected",
        anomaly_flag=anomaly["is_anomaly"],
        anomaly_message=anomaly["message_en"] if anomaly["is_anomaly"] else None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        is_demo=True,
    )
    lot.status = "RecyclerSelected"
    db.add(t)
    db.flush()
    ensure_timeline(db, lot.lot_id, "lot_created")
    advance_timeline(db, lot.lot_id, "pickup_scheduled")
    db.commit()
    db.refresh(t)
    return trx_to_out(t)


@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(transaction_id: str, db: Session = Depends(get_db)):
    t = db.get(Transaction, transaction_id)
    if not t:
        raise HTTPException(404, "Transaction not found")
    return trx_to_out(t)
