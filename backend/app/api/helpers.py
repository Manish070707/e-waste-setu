from __future__ import annotations

from datetime import datetime

from app.models import Lot, Recycler, TraceEvent, Transaction
from app.schemas import LotOut, RecyclerOut, TransactionOut
from app.services.matching import material_rate_for


def next_lot_id(db) -> str:
    year = datetime.utcnow().year
    count = db.query(Lot).count() + 1
    return f"EW-{year}-{count:05d}"


def next_trx_id(db) -> str:
    count = db.query(Transaction).count() + 100000
    return f"TRX-{count}"


def next_price_id(db) -> str:
    from app.models import PriceEntry

    count = db.query(PriceEntry).count() + 1
    return f"PR-{count:05d}"


def lot_to_out(lot: Lot) -> LotOut:
    return LotOut.model_validate(lot)


def recycler_to_out(
    r: Recycler,
    *,
    material: str | None = None,
    offered_rate: float | None = None,
    estimated_total: float | None = None,
    score: float | None = None,
    reasons: list[str] | None = None,
) -> RecyclerOut:
    mats = [m.strip() for m in (r.materials_accepted or "").split(",") if m.strip()]
    rate = offered_rate if offered_rate is not None else (
        material_rate_for(r, material) if material else r.offered_rate_pcb
    )
    return RecyclerOut(
        recycler_id=r.recycler_id,
        facility_name=r.facility_name,
        location=r.location,
        latitude=r.latitude,
        longitude=r.longitude,
        materials_accepted=mats,
        authorization_number=r.authorization_number,
        authorization_status=r.authorization_status,
        contact_masked=r.contact_masked,
        offered_rate=rate,
        pickup_available=r.pickup_available,
        service_area=r.service_area,
        rating=r.rating,
        distance_km=r.distance_km_demo,
        estimated_total=estimated_total,
        score=score,
        reasons=reasons or [],
        is_demo=r.is_demo,
    )


def trx_to_out(t: Transaction) -> TransactionOut:
    return TransactionOut(
        transaction_id=t.transaction_id,
        lot_id=t.lot_id,
        collector_id=t.collector_id,
        recycler_id=t.recycler_id,
        material=t.material,
        weight_kg=t.weight_kg,
        quoted_price_per_kg=t.quoted_price_per_kg,
        final_weight=t.final_weight,
        final_price=t.final_price,
        collection_location=t.collection_location,
        handover_location=t.handover_location,
        payment_status=t.payment_status,
        payment_method=t.payment_method,
        transaction_status=t.transaction_status,
        anomaly_flag=t.anomaly_flag,
        anomaly_message=t.anomaly_message,
        created_at=t.created_at,
        updated_at=t.updated_at,
        recycler_name=t.recycler.facility_name if t.recycler else None,
        collector_name=t.collector.display_name if t.collector else None,
        photo_data_url=t.lot.photo_data_url if t.lot else None,
        is_demo=t.is_demo,
    )


TRACE_STEPS = [
    ("lot_created", "Lot Created", "लॉट बनाया", 1),
    ("recycler_selected", "Recycler Selected", "रिसाइक्लर चुना", 2),
    ("pickup_scheduled", "Pickup Scheduled", "पिकअप तय", 3),
    ("material_received", "Material Received", "सामग्री प्राप्त", 4),
    ("weight_verified", "Weight Verified", "वज़न जाँचा", 5),
    ("payment_completed", "Payment Completed", "भुगतान पूरा", 6),
    ("sent_recycling", "Sent for Recycling", "रीसाइक्लिंग के लिए भेजा", 7),
]


def ensure_timeline(db, lot_id: str, completed_upto: str = "lot_created") -> None:
    existing = db.query(TraceEvent).filter(TraceEvent.lot_id == lot_id).count()
    if existing:
        return
    order_map = {k: i for i, (k, *_r) in enumerate(TRACE_STEPS)}
    cutoff = order_map.get(completed_upto, 0)
    now = datetime.utcnow()
    for key, en, hi, sort in TRACE_STEPS:
        done = order_map[key] <= cutoff
        db.add(
            TraceEvent(
                lot_id=lot_id,
                event_key=key,
                label_en=en,
                label_hi=hi,
                completed=done,
                timestamp=now if done else None,
                sort_order=sort,
            )
        )


def advance_timeline(db, lot_id: str, completed_upto: str) -> None:
    order_map = {k: i for i, (k, *_r) in enumerate(TRACE_STEPS)}
    cutoff = order_map.get(completed_upto, 0)
    now = datetime.utcnow()
    events = db.query(TraceEvent).filter(TraceEvent.lot_id == lot_id).all()
    if not events:
        ensure_timeline(db, lot_id, completed_upto)
        return
    for e in events:
        idx = order_map.get(e.event_key, 99)
        if idx <= cutoff:
            e.completed = True
            if not e.timestamp:
                e.timestamp = now
