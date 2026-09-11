"""Explainable price estimation from seeded history (DEMO — not a trained ML model)."""

from __future__ import annotations

from datetime import datetime
from statistics import mean


CONDITION_FACTOR = {
    "Good": 1.05,
    "Damaged": 0.88,
    "Mixed": 0.95,
    "Unknown": 0.92,
}


def estimate_price(
    material: str,
    weight_kg: float,
    condition: str,
    location: str,
    history_rows: list,
) -> dict:
    """
    Use recent buying ranges for material+location.
    Fallback to national demo defaults if history empty.
    """
    defaults = {
        "PCB": (120, 150),
        "Cable": (280, 360),
        "Copper Cable": (280, 360),
        "Battery": (80, 120),
        "Aluminium": (90, 130),
        "Motor": (70, 110),
        "LCD": (40, 80),
        "CRT": (15, 35),
        "Mixed Plastic": (8, 18),
        "Magnet Assembly": (100, 140),
        "Other": (20, 50),
    }

    matched = [
        r
        for r in history_rows
        if r.material.lower() == material.lower() and r.location.lower() == location.lower()
    ]
    if not matched:
        matched = [r for r in history_rows if r.material.lower() == material.lower()]

    if matched:
        # Prefer most recent 14 entries
        matched = sorted(matched, key=lambda x: x.effective_at or datetime.min, reverse=True)[:14]
        rate_low = mean(r.buying_price_low for r in matched)
        rate_high = mean(r.buying_price_high for r in matched)
    else:
        rate_low, rate_high = defaults.get(material, (20, 50))

    factor = CONDITION_FACTOR.get(condition, 0.92)
    rate_low *= factor
    rate_high *= factor

    # Slight spread for estimate band
    low = round(rate_low * weight_kg * 0.98, 0)
    high = round(rate_high * weight_kg * 1.02, 0)

    return {
        "low": float(low),
        "high": float(high),
        "rate_low": round(rate_low, 2),
        "rate_high": round(rate_high, 2),
        "location": location,
        "material": material,
        "is_demo_mock": True,
        "disclaimer_en": "This is an estimated price. Final price will be decided after recycler verification.",
        "disclaimer_hi": "यह अनुमानित कीमत है। अंतिम कीमत रिसाइक्लर द्वारा जांच के बाद तय होगी।",
        "disclaimer_mr": "हे अंदाजे मूल्य आहे. अंतिम किंमत पुनर्वापरकर्त्याच्या तपासणीनंतर ठरेल.",
    }


def detect_price_anomaly(quoted: float, local_low: float, local_high: float) -> dict:
    """Simple statistical rule: quote far below historical band."""
    threshold = local_low * 0.7
    is_anomaly = quoted < threshold
    return {
        "is_anomaly": is_anomaly,
        "message_en": (
            "Unusually low price. Compare with other recycler offers before accepting."
            if is_anomaly
            else "Offer is within expected local range."
        ),
        "message_hi": (
            "असामान्य रूप से कम कीमत। स्वीकार करने से पहले अन्य ऑफ़र देखें।"
            if is_anomaly
            else "ऑफ़र स्थानीय अनुमानित दायरे में है।"
        ),
        "local_low": local_low,
        "local_high": local_high,
        "quoted": quoted,
        "is_demo_mock": True,
    }
