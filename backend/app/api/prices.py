from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.helpers import next_price_id
from app.db import get_db
from app.models import MaterialCategory, PriceEntry
from app.schemas import PriceCreate, PriceTodayOut

router = APIRouter(prefix="/prices", tags=["prices"])

ICONS = {
    "PCB": "🔌",
    "Cable": "🔗",
    "Copper Cable": "🔗",
    "Battery": "🔋",
    "Aluminium": "🟧",
    "Motor": "⚙️",
    "LCD": "📺",
    "CRT": "🖥️",
    "Mixed Plastic": "🧴",
    "Magnet Assembly": "🧲",
}


@router.get("/today", response_model=list[PriceTodayOut])
def today_prices(
    location: str = Query("Gurugram"),
    material: str | None = None,
    days: int = Query(30, ge=7, le=90),
    db: Session = Depends(get_db),
):
    mats = db.query(MaterialCategory).all()
    categories = [m.category for m in mats]
    # Prefer display set from plan
    display = ["PCB", "Cable", "Battery", "Aluminium", "Motor", "LCD", "Mixed Plastic"]
    if material:
        display = [material]

    cutoff = datetime.utcnow() - timedelta(days=days)
    out: list[PriceTodayOut] = []
    for mat in display:
        if mat not in categories and mat != "Copper Cable":
            # still allow if we have price history
            pass
        q = (
            db.query(PriceEntry)
            .filter(PriceEntry.material == mat, PriceEntry.location == location)
            .filter(PriceEntry.effective_at >= cutoff)
            .order_by(PriceEntry.effective_at.asc())
            .all()
        )
        if not q:
            q = (
                db.query(PriceEntry)
                .filter(PriceEntry.material == mat)
                .order_by(PriceEntry.effective_at.desc())
                .limit(20)
                .all()
            )
            q = list(reversed(q))
        if not q:
            continue
        latest = q[-1]
        earliest = q[0]
        mid_now = (latest.buying_price_low + latest.buying_price_high) / 2
        mid_old = (earliest.buying_price_low + earliest.buying_price_high) / 2
        trend = ((mid_now - mid_old) / mid_old * 100) if mid_old else 0
        history = [(r.buying_price_low + r.buying_price_high) / 2 for r in q[-14:]]
        out.append(
            PriceTodayOut(
                material=mat if mat != "Cable" else "Copper Cable",
                icon=ICONS.get(mat, "♻️"),
                low=latest.buying_price_low,
                high=latest.buying_price_high,
                unit=latest.unit,
                trend_pct=round(trend, 1),
                location=latest.location,
                last_updated=latest.effective_at,
                history=history,
            )
        )
    return out


@router.get("/history")
def price_history(
    material: str,
    location: str = "Gurugram",
    days: int = 30,
    db: Session = Depends(get_db),
):
    cutoff = datetime.utcnow() - timedelta(days=days)
    rows = (
        db.query(PriceEntry)
        .filter(
            PriceEntry.material == material,
            PriceEntry.location == location,
            PriceEntry.effective_at >= cutoff,
        )
        .order_by(PriceEntry.effective_at.asc())
        .all()
    )
    return [
        {
            "price_id": r.price_id,
            "material": r.material,
            "location": r.location,
            "low": r.buying_price_low,
            "high": r.buying_price_high,
            "effective_at": r.effective_at,
            "recycler_id": r.recycler_id,
        }
        for r in rows
    ]


@router.post("/")
def create_price(body: PriceCreate, db: Session = Depends(get_db)):
    """Append-only price entry — never overwrite history."""
    entry = PriceEntry(
        price_id=next_price_id(db),
        material=body.material,
        subcategory=body.subcategory,
        location=body.location,
        buying_price_low=body.price_per_kg * 0.95,
        buying_price_high=body.price_per_kg * 1.05,
        quoted_price=body.price_per_kg,
        unit="KG",
        recycler_id=body.recycler_id,
        pickup_available=body.pickup_available,
        effective_at=datetime.utcnow(),
        is_demo=True,
    )
    db.add(entry)
    # Also update recycler's PCB rate if material is PCB (current offer display)
    from app.models import Recycler

    if body.material.upper() == "PCB":
        r = db.get(Recycler, body.recycler_id)
        if r:
            r.offered_rate_pcb = body.price_per_kg
    db.commit()
    return {"price_id": entry.price_id, "message": "Price entry appended (history preserved)"}
