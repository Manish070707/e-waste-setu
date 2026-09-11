"""Seed DEMO data. Safe to re-run: clears and rebuilds when empty or force=True."""

from __future__ import annotations

from datetime import datetime, timedelta
from random import Random

from sqlalchemy.orm import Session

from app.models import (
    Collector,
    Lot,
    MaterialCategory,
    PriceEntry,
    Recycler,
    TraceEvent,
    Transaction,
)

rng = Random(42)

MATERIALS = [
    ("MAT-PCB", "PCB", "", "Printed circuit boards", "🔌"),
    ("MAT-CABLE", "Cable", "Copper", "Insulated copper cables", "케이블"),
    ("MAT-BATT", "Battery", "Li-ion", "Rechargeable batteries — hazardous", "🔋"),
    ("MAT-CRT", "CRT", "", "CRT monitors/TVs — hazardous glass", "🖥️"),
    ("MAT-LCD", "LCD", "", "LCD/LED panels", "📺"),
    ("MAT-MOTOR", "Motor", "", "Small electric motors", "⚙️"),
    ("MAT-MAG", "Magnet Assembly", "", "Hard-drive magnet assemblies", "🧲"),
    ("MAT-PLAS", "Mixed Plastic", "", "Mixed e-plastic housings", "🧴"),
    ("MAT-ALU", "Aluminium", "", "Aluminium frames and heat sinks", "🟧"),
    ("MAT-OTH", "Other", "", "Unclassified e-waste", "📦"),
]

# Fix cable icon - use emoji that works
MATERIALS[1] = ("MAT-CABLE", "Cable", "Copper", "Insulated copper cables", "🔗")


def _price_id(i: int) -> str:
    return f"PR-{i:05d}"


def seed_all(db: Session, force: bool = False) -> None:
    existing = db.query(Collector).count()
    if existing and not force:
        return

    if force:
        db.query(TraceEvent).delete()
        db.query(Transaction).delete()
        db.query(Lot).delete()
        db.query(PriceEntry).delete()
        db.query(Recycler).delete()
        db.query(MaterialCategory).delete()
        db.query(Collector).delete()
        db.commit()

    for mid, cat, sub, desc, icon in MATERIALS:
        db.add(
            MaterialCategory(
                material_id=mid,
                category=cat,
                subcategory=sub,
                description=desc,
                icon=icon,
            )
        )

    collectors = [
        Collector(collector_id="C-102", display_name="Demo Collector", preferred_language="hi", general_location="Gurugram"),
        Collector(collector_id="C-201", display_name="Ramesh K.", preferred_language="hi", general_location="Delhi"),
        Collector(collector_id="C-305", display_name="Sita Devi", preferred_language="hi", general_location="Noida"),
        Collector(collector_id="C-410", display_name="Imran A.", preferred_language="en", general_location="Faridabad"),
        Collector(collector_id="C-518", display_name="Local Aggregator", preferred_language="hi", general_location="Gurugram"),
    ]
    db.add_all(collectors)

    recyclers = [
        Recycler(
            recycler_id="R-GRS",
            facility_name="Green Recovery Solutions",
            location="Gurugram",
            latitude=28.4595,
            longitude=77.0266,
            materials_accepted="PCB,Cable,Battery,LCD,Motor,Aluminium,Magnet Assembly",
            authorization_number="HR-EPR-2024-1182",
            authorization_status="Verified",
            offered_rate_pcb=145.0,
            pickup_available=True,
            service_area="Gurugram, Delhi NCR",
            rating=4.8,
            distance_km_demo=8.0,
        ),
        Recycler(
            recycler_id="R-ECO",
            facility_name="EcoCycle India",
            location="Gurugram",
            materials_accepted="PCB,Cable,Mixed Plastic,Aluminium",
            authorization_number="HR-EPR-2023-0441",
            authorization_status="Verified",
            offered_rate_pcb=138.0,
            pickup_available=True,
            service_area="Gurugram",
            rating=4.5,
            distance_km_demo=12.0,
        ),
        Recycler(
            recycler_id="R-SAFE",
            facility_name="SafeWaste Recyclers",
            location="Delhi",
            materials_accepted="PCB,Battery,CRT,LCD",
            authorization_number="DL-EPR-2024-2201",
            authorization_status="Verified",
            offered_rate_pcb=142.0,
            pickup_available=False,
            service_area="Delhi, Noida",
            rating=4.6,
            distance_km_demo=18.0,
        ),
        Recycler(
            recycler_id="R-METAL",
            facility_name="Metro Metal Recovery",
            location="Noida",
            materials_accepted="Cable,Motor,Aluminium,Magnet Assembly",
            authorization_number="UP-EPR-2022-0890",
            authorization_status="Verified",
            offered_rate_pcb=130.0,
            pickup_available=True,
            service_area="Noida, Ghaziabad",
            rating=4.3,
            distance_km_demo=22.0,
        ),
        Recycler(
            recycler_id="R-GREEN2",
            facility_name="NCR Green Hub",
            location="Faridabad",
            materials_accepted="PCB,Cable,Battery,Other",
            authorization_number="HR-EPR-2024-3310",
            authorization_status="Verified",
            offered_rate_pcb=140.0,
            pickup_available=True,
            service_area="Faridabad, Gurugram",
            rating=4.4,
            distance_km_demo=15.0,
        ),
        Recycler(
            recycler_id="R-PEND",
            facility_name="Pending Auth Recyclers",
            location="Gurugram",
            materials_accepted="PCB,Cable",
            authorization_number="HR-EPR-PENDING",
            authorization_status="Pending",
            offered_rate_pcb=160.0,
            pickup_available=True,
            distance_km_demo=5.0,
        ),
        Recycler(
            recycler_id="R-EXP",
            facility_name="Expired Cert Facility",
            location="Delhi",
            materials_accepted="PCB,Battery",
            authorization_number="DL-EPR-2019-0001",
            authorization_status="Expired",
            offered_rate_pcb=150.0,
            pickup_available=True,
            distance_km_demo=10.0,
        ),
        Recycler(
            recycler_id="R-SUS",
            facility_name="Suspended Yard",
            location="Gurugram",
            materials_accepted="PCB,Cable,Battery",
            authorization_number="HR-EPR-2021-0099",
            authorization_status="Suspended",
            offered_rate_pcb=155.0,
            pickup_available=True,
            distance_km_demo=6.0,
        ),
        Recycler(
            recycler_id="R-URBAN",
            facility_name="Urban Formal Recycle",
            location="Delhi",
            materials_accepted="PCB,LCD,CRT,Battery,Cable",
            authorization_number="DL-EPR-2024-5012",
            authorization_status="Verified",
            offered_rate_pcb=136.0,
            pickup_available=True,
            service_area="Delhi",
            rating=4.2,
            distance_km_demo=25.0,
        ),
        Recycler(
            recycler_id="R-CIRC",
            facility_name="Circular Tech Recovery",
            location="Gurugram",
            materials_accepted="PCB,Motor,Magnet Assembly,Aluminium",
            authorization_number="HR-EPR-2023-7721",
            authorization_status="Verified",
            offered_rate_pcb=143.0,
            pickup_available=True,
            service_area="Gurugram, Manesar",
            rating=4.7,
            distance_km_demo=9.5,
        ),
    ]
    db.add_all(recyclers)

    # Price history — append-only style seed
    price_bases = {
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
    }
    locations = ["Gurugram", "Delhi", "Noida"]
    idx = 1
    now = datetime.utcnow()
    for material, (lo, hi) in price_bases.items():
        for loc in locations:
            for day in range(90, -1, -1):
                if day % 3 != 0:
                    continue
                drift = rng.uniform(-0.08, 0.08)
                low = round(lo * (1 + drift), 2)
                high = round(hi * (1 + drift), 2)
                db.add(
                    PriceEntry(
                        price_id=_price_id(idx),
                        material=material,
                        location=loc,
                        buying_price_low=low,
                        buying_price_high=high,
                        quoted_price=(low + high) / 2,
                        unit="KG",
                        recycler_id="R-GRS" if loc == "Gurugram" else "R-SAFE",
                        effective_at=now - timedelta(days=day),
                        is_demo=True,
                    )
                )
                idx += 1

    # Historical transactions for C-102 earnings
    sample_txns = [
        ("EW-2025-00011", "TRX-110011", "PCB", 20, 140, 2800, "Paid", "Cash", "R-GRS"),
        ("EW-2025-00022", "TRX-110022", "Cable", 15, 450, 6750, "Paid", "UPI", "R-ECO"),
        ("EW-2025-00033", "TRX-110033", "Battery", 10, 150, 1500, "Pending", None, "R-SAFE"),
        ("EW-2025-00044", "TRX-110044", "Motor", 25, 95, 2375, "Paid", "Cash", "R-METAL"),
        ("EW-2025-00055", "TRX-110055", "Aluminium", 18, 110, 1980, "Paid", "Cash", "R-GRS"),
        ("EW-2025-00066", "TRX-110066", "LCD", 12, 55, 660, "Paid", "UPI", "R-SAFE"),
        ("EW-2025-00077", "TRX-110077", "PCB", 8, 142, 1136, "Paid", "Cash", "R-CIRC"),
        ("EW-2025-00088", "TRX-110088", "Cable", 10, 420, 4200, "Paid", "Cash", "R-ECO"),
    ]

    for lot_id, trx_id, material, weight, rate, total, pay, method, rid in sample_txns:
        lot = Lot(
            lot_id=lot_id,
            collector_id="C-102",
            material=material,
            weight_kg=weight,
            condition="Good",
            location="Gurugram",
            est_low=total * 0.9,
            est_high=total * 1.05,
            status="Completed" if pay == "Paid" else "PendingPayment",
            created_at=now - timedelta(days=rng.randint(5, 60)),
        )
        db.add(lot)
        db.flush()
        db.add(
            Transaction(
                transaction_id=trx_id,
                lot_id=lot_id,
                collector_id="C-102",
                recycler_id=rid,
                material=material,
                weight_kg=weight,
                quoted_price_per_kg=rate,
                final_weight=weight,
                final_price=total,
                collection_location="Gurugram",
                handover_location="Gurugram",
                payment_status=pay,
                payment_method=method,
                transaction_status="PaymentCompleted" if pay == "Paid" else "WeightVerified",
                created_at=lot.created_at,
                updated_at=lot.created_at,
            )
        )

    db.commit()


def create_trace_timeline(db: Session, lot_id: str, completed_upto: str | None = None) -> None:
    steps = [
        ("lot_created", "Lot Created", "लॉट बनाया", 1),
        ("recycler_selected", "Recycler Selected", "रिसाइक्लर चुना", 2),
        ("pickup_scheduled", "Pickup Scheduled", "पिकअप तय", 3),
        ("material_received", "Material Received", "सामग्री प्राप्त", 4),
        ("weight_verified", "Weight Verified", "वज़न जाँचा", 5),
        ("payment_completed", "Payment Completed", "भुगतान पूरा", 6),
        ("sent_recycling", "Sent for Recycling", "रीसाइक्लिंग के लिए भेजा", 7),
    ]
    order_map = {k: i for i, (k, *_r) in enumerate(steps)}
    cutoff = order_map.get(completed_upto or "lot_created", 0)
    now = datetime.utcnow()
    for key, en, hi, sort in steps:
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
