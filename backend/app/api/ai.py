from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import PriceEntry
from app.schemas import AnomalyResponse, ClassifyResponse, EstimateResponse
from app.services.pricing import detect_price_anomaly, estimate_price

router = APIRouter(prefix="/ai", tags=["ai"])

# DEMO/MOCK classification heuristics — interface ready for MobileNet/EfficientNet
MOCK_HINTS = {
    "pcb": ("PCB", 0.92),
    "board": ("PCB", 0.88),
    "cable": ("Cable", 0.90),
    "wire": ("Cable", 0.86),
    "battery": ("Battery", 0.93),
    "batt": ("Battery", 0.85),
    "crt": ("CRT", 0.91),
    "lcd": ("LCD", 0.89),
    "motor": ("Motor", 0.87),
    "magnet": ("Magnet Assembly", 0.84),
    "plastic": ("Mixed Plastic", 0.80),
}


@router.post("/classify", response_model=ClassifyResponse)
def classify(filename: str | None = None, hint: str | None = None):
    """DEMO/MOCK material classification. Replace with real vision model later."""
    text = (hint or filename or "pcb").lower()
    for key, (cat, conf) in MOCK_HINTS.items():
        if key in text:
            return ClassifyResponse(predicted_category=cat, confidence=conf)
    return ClassifyResponse(predicted_category="PCB", confidence=0.72)


@router.post("/estimate", response_model=EstimateResponse)
def estimate(
    material: str,
    weight_kg: float,
    condition: str = "Unknown",
    location: str = "Gurugram",
    db: Session = Depends(get_db),
):
    history = db.query(PriceEntry).all()
    est = estimate_price(material, weight_kg, condition, location, history)
    if "disclaimer_mr" not in est:
        est["disclaimer_mr"] = "हे अंदाजे मूल्य आहे. अंतिम किंमत पुनर्वापरकर्त्याच्या तपासणीनंतर ठरेल."
    return EstimateResponse(**est)


@router.post("/anomaly", response_model=AnomalyResponse)
def anomaly(
    material: str,
    quoted: float,
    location: str = "Gurugram",
    weight_kg: float = 1.0,
    condition: str = "Good",
    db: Session = Depends(get_db),
):
    history = db.query(PriceEntry).all()
    est = estimate_price(material, weight_kg, condition, location, history)
    result = detect_price_anomaly(quoted, est["rate_low"], est["rate_high"])
    return AnomalyResponse(**result)
