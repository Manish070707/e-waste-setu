from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.helpers import recycler_to_out
from app.db import get_db
from app.models import Lot, Recycler
from app.schemas import RecommendRequest
from app.services.matching import rank_recyclers

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.post("/")
def recommend(body: RecommendRequest, db: Session = Depends(get_db)):
    material = body.material
    weight = body.weight_kg
    if body.lot_id:
        lot = db.get(Lot, body.lot_id)
        if not lot:
            raise HTTPException(404, "Lot not found")
        material = lot.material
        weight = lot.weight_kg
    if not material or weight is None:
        raise HTTPException(400, "material and weight_kg required (or lot_id)")

    recyclers = db.query(Recycler).all()
    ranked = rank_recyclers(recyclers, material, weight)
    by_id = {r.recycler_id: r for r in recyclers}
    results = []
    for s in ranked:
        r = by_id[s.recycler_id]
        results.append(
            recycler_to_out(
                r,
                material=material,
                offered_rate=s.offered_rate,
                estimated_total=s.estimated_total,
                score=s.score,
                reasons=s.reasons,
            )
        )
    return {"material": material, "weight_kg": weight, "recyclers": results}
