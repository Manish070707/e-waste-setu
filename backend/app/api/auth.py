from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Collector, Recycler
from app.schemas import DemoLoginRequest, DemoLoginResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/demo-login", response_model=DemoLoginResponse)
def demo_login(body: DemoLoginRequest, db: Session = Depends(get_db)):
    role = body.role.lower().strip()
    if role == "collector":
        cid = body.user_id or "C-102"
        c = db.get(Collector, cid)
        if not c:
            raise HTTPException(404, "Collector not found")
        return DemoLoginResponse(
            role="collector",
            user_id=c.collector_id,
            display_name=c.display_name,
            location=c.general_location,
            is_demo=True,
        )
    if role == "recycler":
        rid = body.user_id or "R-GRS"
        r = db.get(Recycler, rid)
        if not r:
            raise HTTPException(404, "Recycler not found")
        return DemoLoginResponse(
            role="recycler",
            user_id=r.recycler_id,
            display_name=r.facility_name,
            location=r.location,
            is_demo=True,
        )
    if role == "admin":
        return DemoLoginResponse(
            role="admin",
            user_id="ADMIN-01",
            display_name="SIH Demo Admin",
            location="India",
            is_demo=True,
        )
    raise HTTPException(400, "Invalid role. Use collector, recycler, or admin.")
