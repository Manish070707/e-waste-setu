"""Recycler matching score — Authorization 30%, Price 25%, Distance 20%, Pickup 15%, Material 10%."""

from __future__ import annotations

from dataclasses import dataclass


WEIGHTS = {
    "authorization": 0.30,
    "price": 0.25,
    "distance": 0.20,
    "pickup": 0.15,
    "material": 0.10,
}

ALLOWED_AUTH = {"Verified"}


@dataclass
class ScoredRecycler:
    recycler_id: str
    score: float
    reasons: list[str]
    offered_rate: float
    estimated_total: float


def material_rate_for(recycler, material: str) -> float:
    """Map material to offered rate; PCB uses dedicated field, others scale from it."""
    base = float(recycler.offered_rate_pcb)
    material_l = material.lower()
    multipliers = {
        "pcb": 1.0,
        "cable": 2.8,
        "copper cable": 2.8,
        "battery": 0.55,
        "aluminium": 0.7,
        "motor": 0.85,
        "lcd": 0.6,
        "crt": 0.35,
        "mixed plastic": 0.15,
        "magnet assembly": 0.9,
        "magnet": 0.9,
        "other": 0.4,
    }
    for key, mult in multipliers.items():
        if key in material_l:
            return round(base * mult, 2)
    return round(base * 0.5, 2)


def score_recycler(
    *,
    authorization_status: str,
    offered_rate: float,
    max_rate: float,
    min_rate: float,
    distance_km: float,
    pickup_available: bool,
    materials_accepted: list[str],
    material: str,
    weight_kg: float,
) -> tuple[float, list[str], float]:
    if authorization_status not in ALLOWED_AUTH:
        return 0.0, [], offered_rate

    auth_score = 1.0
    reasons: list[str] = ["Authorized"]

    if max_rate > min_rate:
        price_score = (offered_rate - min_rate) / (max_rate - min_rate)
    else:
        price_score = 1.0
    if price_score >= 0.75:
        reasons.append("Best Rate")

    # Closer is better; 0km=1, 30km+=0
    dist_score = max(0.0, 1.0 - (distance_km / 30.0))
    if distance_km <= 12:
        reasons.append("Nearby")

    pickup_score = 1.0 if pickup_available else 0.2
    if pickup_available:
        reasons.append("Pickup Available")

    accepted = {m.strip().lower() for m in materials_accepted}
    mat_l = material.lower()
    compat = 1.0 if any(mat_l == a or mat_l in a or a in mat_l for a in accepted) or "all" in accepted else 0.3
    if compat >= 0.9:
        reasons.append("Material Match")

    total = (
        WEIGHTS["authorization"] * auth_score
        + WEIGHTS["price"] * price_score
        + WEIGHTS["distance"] * dist_score
        + WEIGHTS["pickup"] * pickup_score
        + WEIGHTS["material"] * compat
    )
    estimated = round(offered_rate * weight_kg, 2)
    return round(total, 4), reasons, estimated


def rank_recyclers(recyclers: list, material: str, weight_kg: float) -> list[ScoredRecycler]:
    eligible = [r for r in recyclers if r.authorization_status in ALLOWED_AUTH]
    if not eligible:
        return []

    rates = [material_rate_for(r, material) for r in eligible]
    max_rate = max(rates)
    min_rate = min(rates)

    scored: list[ScoredRecycler] = []
    for r, rate in zip(eligible, rates):
        materials = [m.strip() for m in (r.materials_accepted or "").split(",") if m.strip()]
        total, reasons, estimated = score_recycler(
            authorization_status=r.authorization_status,
            offered_rate=rate,
            max_rate=max_rate,
            min_rate=min_rate,
            distance_km=float(r.distance_km_demo),
            pickup_available=bool(r.pickup_available),
            materials_accepted=materials,
            material=material,
            weight_kg=weight_kg,
        )
        scored.append(
            ScoredRecycler(
                recycler_id=r.recycler_id,
                score=total,
                reasons=reasons,
                offered_rate=rate,
                estimated_total=estimated,
            )
        )
    scored.sort(key=lambda x: x.score, reverse=True)
    return scored
