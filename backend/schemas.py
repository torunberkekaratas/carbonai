from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List, Dict


# ---------- Company ----------

class CompanyCreate(BaseModel):
    name: str
    sector: Optional[str] = None


class CompanyRead(BaseModel):
    id: int
    name: str
    sector: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True


# ---------- Facility ----------

class FacilityCreate(BaseModel):
    company_id: int
    name: str
    city: Optional[str] = None
    country: Optional[str] = None


class FacilityRead(BaseModel):
    id: int
    company_id: int
    name: str
    city: Optional[str]
    country: Optional[str]
    created_at: datetime

    class Config:
        orm_mode = True


# ---------- EnergyRecord ----------

class EnergyRecordCreate(BaseModel):
    facility_id: int
    period_start: date
    period_end: date
    energy_type: str = Field(..., description="örnek: electricity, natural_gas")
    amount: float
    unit: str       # kWh, m3, Litre


class EnergyRecordRead(BaseModel):
    id: int
    facility_id: int
    period_start: date
    period_end: date
    energy_type: str
    amount: float
    unit: str
    created_at: datetime

    class Config:
        orm_mode = True


# ---------- EmissionResult (şimdilik read-only taraf) ----------

class EmissionBreakdown(BaseModel):
    # örnek: { "electricity": 15000.0, "natural_gas": 3400.5 }
    breakdown: Dict[str, float]


class EmissionResultRead(BaseModel):
    id: int
    facility_id: int
    period_month: str  # "2025-10"
    total_kgco2: float
    breakdown_json: Dict[str, float]
    created_at: datetime

    class Config:
        orm_mode = True
class EmissionFactorCreate(BaseModel):
    energy_type: str          # "electricity", "natural_gas"
    region: str               # "TR", "EU", ...
    factor_kgco2_per_unit: float
    valid_from: date
    valid_to: Optional[date] = None


class EmissionFactorRead(BaseModel):
    id: int
    energy_type: str
    region: str
    factor_kgco2_per_unit: float
    valid_from: date
    valid_to: Optional[date]
    created_at: datetime

    class Config:
        from_attributes = True
class EmissionFactorCreate(BaseModel):
    energy_type: str          # "electricity", "natural_gas"
    region: str               # "TR", "EU", ...
    factor_kgco2_per_unit: float
    valid_from: date
    valid_to: Optional[date] = None


class EmissionFactorRead(BaseModel):
    id: int
    energy_type: str
    region: str
    factor_kgco2_per_unit: float
    valid_from: date
    valid_to: Optional[date]
    created_at: datetime

    class Config:
        from_attributes = True