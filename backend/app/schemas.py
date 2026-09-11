from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class DemoLoginRequest(BaseModel):
    role: str = Field(description="collector | recycler | admin")
    user_id: Optional[str] = None


class DemoLoginResponse(BaseModel):
    role: str
    user_id: str
    display_name: str
    location: Optional[str] = None
    is_demo: bool = True


class LotCreate(BaseModel):
    collector_id: str = "C-102"
    material: str
    weight_kg: float
    condition: str = "Unknown"
    photo_data_url: Optional[str] = None
    location: str = "Gurugram"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    ai_prediction: Optional[str] = None
    ai_confidence: Optional[float] = None


class LotOut(BaseModel):
    lot_id: str
    collector_id: str
    material: str
    weight_kg: float
    condition: str
    photo_data_url: Optional[str] = None
    location: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    est_low: float
    est_high: float
    ai_prediction: Optional[str] = None
    ai_confidence: Optional[float] = None
    status: str
    created_at: datetime
    is_demo: bool = True

    model_config = {"from_attributes": True}


class PriceTodayOut(BaseModel):
    material: str
    icon: str
    low: float
    high: float
    unit: str
    trend_pct: float
    location: str
    last_updated: datetime
    history: list[float] = []


class RecyclerOut(BaseModel):
    recycler_id: str
    facility_name: str
    location: str
    latitude: float
    longitude: float
    materials_accepted: list[str]
    authorization_number: str
    authorization_status: str
    contact_masked: str
    offered_rate: float
    pickup_available: bool
    service_area: str
    rating: float
    distance_km: float
    estimated_total: Optional[float] = None
    score: Optional[float] = None
    reasons: list[str] = []
    is_demo: bool = True


class RecommendRequest(BaseModel):
    lot_id: Optional[str] = None
    material: Optional[str] = None
    weight_kg: Optional[float] = None
    location: Optional[str] = "Gurugram"


class TransactionCreate(BaseModel):
    lot_id: str
    recycler_id: str
    quoted_price_per_kg: float


class TransactionOut(BaseModel):
    transaction_id: str
    lot_id: str
    collector_id: str
    recycler_id: str
    material: str
    weight_kg: float
    quoted_price_per_kg: float
    final_weight: Optional[float] = None
    final_price: Optional[float] = None
    collection_location: str
    handover_location: Optional[str] = None
    payment_status: str
    payment_method: Optional[str] = None
    transaction_status: str
    anomaly_flag: bool = False
    anomaly_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    recycler_name: Optional[str] = None
    collector_name: Optional[str] = None
    photo_data_url: Optional[str] = None
    is_demo: bool = True

    model_config = {"from_attributes": True}


class HandoverConfirm(BaseModel):
    final_weight: float
    final_price: Optional[float] = None
    payment_method: str = "Cash"
    mark_paid: bool = True
    handover_location: Optional[str] = None


class PaymentMark(BaseModel):
    transaction_id: str
    payment_status: str = "Paid"
    payment_method: str = "Cash"


class PriceCreate(BaseModel):
    recycler_id: str
    material: str
    subcategory: str = ""
    price_per_kg: float
    location: str
    pickup_available: bool = True


class TraceEventOut(BaseModel):
    event_key: str
    label_en: str
    label_hi: str
    completed: bool
    timestamp: Optional[datetime] = None
    sort_order: int

    model_config = {"from_attributes": True}


class HandoverOut(BaseModel):
    transaction: TransactionOut
    timeline: list[TraceEventOut]
    lot: LotOut
    recycler: RecyclerOut


class EarningsOut(BaseModel):
    total_earnings: float
    pending: float
    transactions_count: int
    material_sold_kg: float
    items: list[TransactionOut]


class MaterialOut(BaseModel):
    material_id: str
    category: str
    subcategory: str
    description: str
    icon: str
    unit: str


class ClassifyResponse(BaseModel):
    predicted_category: str
    confidence: float
    is_demo_mock: bool = True
    note: str = "DEMO/MOCK AI — not a trained model"


class EstimateResponse(BaseModel):
    low: float
    high: float
    rate_low: float
    rate_high: float
    location: str
    material: str
    is_demo_mock: bool = True
    disclaimer_hi: str
    disclaimer_en: str
    disclaimer_mr: str = "हे अंदाजे मूल्य आहे. अंतिम किंमत पुनर्वापरकर्त्याच्या तपासणीनंतर ठरेल."


class AnomalyResponse(BaseModel):
    is_anomaly: bool
    message_en: str
    message_hi: str
    local_low: float
    local_high: float
    quoted: float
    is_demo_mock: bool = True


class AdminMetrics(BaseModel):
    total_ewaste_kg: float
    formal_recycling_pct: float
    active_collectors: int
    authorized_recyclers: int
    total_collector_earnings: float
    avg_price_improvement_pct: float
    transactions: int
    pending_handovers: int
    hazardous_material_count: int
    is_demo: bool = True


class DemoScenarioResponse(BaseModel):
    lot: LotOut
    transaction: TransactionOut
    message: str
