from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Date,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship
from database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sector = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    facilities = relationship("Facility", back_populates="company")


class Facility(Base):
    __tablename__ = "facilities"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name = Column(String, nullable=False)
    city = Column(String, nullable=True)
    country = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    company = relationship("Company", back_populates="facilities")
    energy_records = relationship("EnergyRecord", back_populates="facility")
    emission_results = relationship("EmissionResult", back_populates="facility")


class EnergyRecord(Base):
    __tablename__ = "energy_records"

    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id"), nullable=False)

    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)

    energy_type = Column(String, nullable=False)   # "electricity", "natural_gas", ...
    amount = Column(Float, nullable=False)         # tüketim miktarı
    unit = Column(String, nullable=False)          # "kWh", "m3", "Litre", ...

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    facility = relationship("Facility", back_populates="energy_records")


class EmissionFactor(Base):
    __tablename__ = "emission_factors"

    id = Column(Integer, primary_key=True, index=True)

    energy_type = Column(String, nullable=False)         # "electricity", ...
    region = Column(String, nullable=False)              # "TR", "EU", ...
    factor_kgco2_per_unit = Column(Float, nullable=False)  # örn 0.42

    valid_from = Column(Date, nullable=False)
    valid_to = Column(Date, nullable=True)

    # ⚠ fix burada: artık server_default yok, Python otomatik dolduruyor
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class EmissionResult(Base):
    __tablename__ = "emission_results"

    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id"), nullable=False)

    period_month = Column(String, nullable=False, index=True)  # "2025-10"
    total_kgco2 = Column(Float, nullable=False)

    # örnek: {"electricity": 15000.0, "natural_gas": 3400.5}
    breakdown_json = Column(JSON, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    facility = relationship("Facility", back_populates="emission_results")