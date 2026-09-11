from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import MaterialCategory
from app.schemas import MaterialOut

router = APIRouter(prefix="/materials", tags=["materials"])


@router.get("/", response_model=list[MaterialOut])
def list_materials(db: Session = Depends(get_db)):
    rows = db.query(MaterialCategory).all()
    return [
        MaterialOut(
            material_id=r.material_id,
            category=r.category,
            subcategory=r.subcategory,
            description=r.description,
            icon=r.icon,
            unit=r.unit,
        )
        for r in rows
    ]
