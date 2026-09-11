from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.helpers import recycler_to_out
from app.db import get_db
from app.models import Recycler

router = APIRouter(prefix="/recyclers", tags=["recyclers"])


@router.get("/")
def list_recyclers(
    authorization: str | None = None,
    pickup: bool | None = None,
    material: str | None = None,
    db: Session = Depends(get_db),
):
    q = db.query(Recycler)
    if authorization:
        q = q.filter(Recycler.authorization_status == authorization)
    if pickup is not None:
        q = q.filter(Recycler.pickup_available == pickup)
    rows = q.all()
    out = []
    for r in rows:
        if material:
            accepted = [m.strip().lower() for m in r.materials_accepted.split(",")]
            if not any(material.lower() in a or a in material.lower() for a in accepted):
                continue
        out.append(recycler_to_out(r, material=material))
    return out


@router.get("/{recycler_id}")
def get_recycler(recycler_id: str, db: Session = Depends(get_db)):
    r = db.get(Recycler, recycler_id)
    if not r:
        raise HTTPException(404, "Recycler not found")
    return recycler_to_out(r)
