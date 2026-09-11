from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Collector(Base):
    __tablename__ = "collectors"

    collector_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    display_name: Mapped[str] = mapped_column(String(120), default="Collector")
    preferred_language: Mapped[str] = mapped_column(String(8), default="hi")
    general_location: Mapped[str] = mapped_column(String(120), default="Gurugram")
    is_demo: Mapped[bool] = mapped_column(Boolean, default=True)

    lots: Mapped[list["Lot"]] = relationship(back_populates="collector")
    transactions: Mapped[list["Transaction"]] = relationship(back_populates="collector")


class Recycler(Base):
    __tablename__ = "recyclers"

    recycler_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    facility_name: Mapped[str] = mapped_column(String(200))
    location: Mapped[str] = mapped_column(String(120))
    latitude: Mapped[float] = mapped_column(Float, default=28.4595)
    longitude: Mapped[float] = mapped_column(Float, default=77.0266)
    materials_accepted: Mapped[str] = mapped_column(Text, default="PCB,Cable,Battery")
    authorization_number: Mapped[str] = mapped_column(String(64), default="")
    authorization_status: Mapped[str] = mapped_column(String(32), default="Verified")
    contact_masked: Mapped[str] = mapped_column(String(64), default="••••••••90")
    offered_rate_pcb: Mapped[float] = mapped_column(Float, default=130.0)
    pickup_available: Mapped[bool] = mapped_column(Boolean, default=True)
    service_area: Mapped[str] = mapped_column(String(200), default="Gurugram")
    rating: Mapped[float] = mapped_column(Float, default=4.5)
    distance_km_demo: Mapped[float] = mapped_column(Float, default=8.0)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=True)

    price_entries: Mapped[list["PriceEntry"]] = relationship(back_populates="recycler")
    transactions: Mapped[list["Transaction"]] = relationship(back_populates="recycler")


class MaterialCategory(Base):
    __tablename__ = "material_categories"

    material_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    category: Mapped[str] = mapped_column(String(64))
    subcategory: Mapped[str] = mapped_column(String(64), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    icon: Mapped[str] = mapped_column(String(16), default="♻️")
    unit: Mapped[str] = mapped_column(String(16), default="KG")


class Lot(Base):
    __tablename__ = "lots"

    lot_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    collector_id: Mapped[str] = mapped_column(ForeignKey("collectors.collector_id"))
    material: Mapped[str] = mapped_column(String(64))
    material_id: Mapped[Optional[str]] = mapped_column(ForeignKey("material_categories.material_id"), nullable=True)
    weight_kg: Mapped[float] = mapped_column(Float)
    condition: Mapped[str] = mapped_column(String(32), default="Unknown")
    photo_data_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    location: Mapped[str] = mapped_column(String(120), default="Gurugram")
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    est_low: Mapped[float] = mapped_column(Float, default=0)
    est_high: Mapped[float] = mapped_column(Float, default=0)
    ai_prediction: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    ai_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(48), default="Created")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=True)

    collector: Mapped["Collector"] = relationship(back_populates="lots")
    transaction: Mapped[Optional["Transaction"]] = relationship(back_populates="lot", uselist=False)
    trace_events: Mapped[list["TraceEvent"]] = relationship(back_populates="lot")


class PriceEntry(Base):
    __tablename__ = "price_entries"

    price_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    material: Mapped[str] = mapped_column(String(64))
    location: Mapped[str] = mapped_column(String(120))
    buying_price_low: Mapped[float] = mapped_column(Float)
    buying_price_high: Mapped[float] = mapped_column(Float)
    quoted_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    unit: Mapped[str] = mapped_column(String(16), default="KG")
    recycler_id: Mapped[Optional[str]] = mapped_column(ForeignKey("recyclers.recycler_id"), nullable=True)
    subcategory: Mapped[str] = mapped_column(String(64), default="")
    pickup_available: Mapped[bool] = mapped_column(Boolean, default=True)
    effective_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=True)

    recycler: Mapped[Optional["Recycler"]] = relationship(back_populates="price_entries")


class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    lot_id: Mapped[str] = mapped_column(ForeignKey("lots.lot_id"), unique=True)
    collector_id: Mapped[str] = mapped_column(ForeignKey("collectors.collector_id"))
    recycler_id: Mapped[str] = mapped_column(ForeignKey("recyclers.recycler_id"))
    material: Mapped[str] = mapped_column(String(64))
    weight_kg: Mapped[float] = mapped_column(Float)
    quoted_price_per_kg: Mapped[float] = mapped_column(Float)
    final_weight: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    final_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    collection_location: Mapped[str] = mapped_column(String(120), default="")
    handover_location: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    payment_status: Mapped[str] = mapped_column(String(32), default="Pending")
    payment_method: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    transaction_status: Mapped[str] = mapped_column(String(48), default="RecyclerSelected")
    anomaly_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    anomaly_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=True)

    lot: Mapped["Lot"] = relationship(back_populates="transaction")
    collector: Mapped["Collector"] = relationship(back_populates="transactions")
    recycler: Mapped["Recycler"] = relationship(back_populates="transactions")


class TraceEvent(Base):
    __tablename__ = "trace_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    lot_id: Mapped[str] = mapped_column(ForeignKey("lots.lot_id"))
    event_key: Mapped[str] = mapped_column(String(64))
    label_en: Mapped[str] = mapped_column(String(120))
    label_hi: Mapped[str] = mapped_column(String(120), default="")
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    timestamp: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    lot: Mapped["Lot"] = relationship(back_populates="trace_events")
