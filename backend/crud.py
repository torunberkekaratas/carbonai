from sqlalchemy.orm import Session
from datetime import date
from typing import List

import models
import schemas


# COMPANY

def create_company(db: Session, company_in: schemas.CompanyCreate) -> models.Company:
    db_company = models.Company(
        name=company_in.name,
        sector=company_in.sector,
    )
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


def get_company(db: Session, company_id: int) -> models.Company | None:
    return db.query(models.Company).filter(models.Company.id == company_id).first()


# FACILITY

def create_facility(db: Session, facility_in: schemas.FacilityCreate) -> models.Facility:
    db_facility = models.Facility(
        company_id=facility_in.company_id,
        name=facility_in.name,
        city=facility_in.city,
        country=facility_in.country,
    )
    db.add(db_facility)
    db.commit()
    db.refresh(db_facility)
    return db_facility


def get_facility(db: Session, facility_id: int) -> models.Facility | None:
    return db.query(models.Facility).filter(models.Facility.id == facility_id).first()


def get_facility_energy_records(db: Session, facility_id: int, limit: int = 50) -> List[models.EnergyRecord]:
    return (
        db.query(models.EnergyRecord)
        .filter(models.EnergyRecord.facility_id == facility_id)
        .order_by(models.EnergyRecord.created_at.desc())
        .limit(limit)
        .all()
    )


# ENERGY RECORD

def create_energy_record(db: Session, record_in: schemas.EnergyRecordCreate) -> models.EnergyRecord:
    # basit validation: negatif miktar engelle
    if record_in.amount < 0:
        raise ValueError("amount cannot be negative")

    db_record = models.EnergyRecord(
        facility_id=record_in.facility_id,
        period_start=record_in.period_start,
        period_end=record_in.period_end,
        energy_type=record_in.energy_type,
        amount=record_in.amount,
        unit=record_in.unit,
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record
def create_emission_factor(
    db: Session,
    energy_type: str,
    region: str,
    factor_kgco2_per_unit: float,
    valid_from: date,
    valid_to: date | None,
):
    db_factor = models.EmissionFactor(
        energy_type=energy_type,
        region=region,
        factor_kgco2_per_unit=factor_kgco2_per_unit,
        valid_from=valid_from,
        valid_to=valid_to,
    )
    db.add(db_factor)
    db.commit()
    db.refresh(db_factor)
    return db_factor


def get_applicable_factor(
    db: Session,
    energy_type: str,
    region: str,
    day: date,
):
    """
    Bu fonksiyon verilen enerji tipi + bölge + tarih için geçerli faktörü döner.
    valid_from <= day <= valid_to (veya valid_to None ise sonsuza kadar geçerli)
    """
    q = (
        db.query(models.EmissionFactor)
        .filter(models.EmissionFactor.energy_type == energy_type)
        .filter(models.EmissionFactor.region == region)
        .filter(models.EmissionFactor.valid_from <= day)
    )

    # valid_to null olabilir, o yüzden iki durum kontrol edelim:
    factors = q.all()

    # Basit çözüm: en uygun olanı seç
    applicable = []
    for f in factors:
        if f.valid_to is None or day <= f.valid_to:
            applicable.append(f)

    # Şu an için en yeni kaydı seç (son created_at'e göre)
    if not applicable:
        return None

    applicable.sort(key=lambda f: f.created_at, reverse=True)
    return applicable[0]
from collections import defaultdict

def calculate_month_emissions(
    db: Session,
    facility_id: int,
    period_month: str,  # "YYYY-MM"
):
    """
    period_month = "2025-10" gibi.
    Bu fonksiyon:
    1. İlgili tesisteki EnergyRecord kayıtlarını o ay içinde bulur.
    2. Her kayıt için uygun emisyon faktörünü bulur.
    3. co2_kg hesaplar.
    4. Toplamı ve kırılımı döner.
    """

    # 1. Bu aya ait tarih aralığını çıkar (örn. 2025-10 için 2025-10-01 ... 2025-10-31)
    year_str, month_str = period_month.split("-")
    year = int(year_str)
    month = int(month_str)

    # küçük yardımcı: ayın ilk ve son gününü tahmini alalım
    # basit yaklaşım: kayıtların period_start ayı == period_month olsun.
    # (ileride daha esnek yapabiliriz)
    records = (
        db.query(models.EnergyRecord)
        .filter(models.EnergyRecord.facility_id == facility_id)
        .filter(models.EnergyRecord.period_start.like(f"{period_month}-%"))
        .all()
    )

    if not records:
        return {
            "facility_id": facility_id,
            "month": period_month,
            "total_co2_kg": 0.0,
            "by_energy_type": []
        }

    breakdown = defaultdict(float)
    total = 0.0

    # Tesisin ülkesini bulalım (region olarak kullanacağız)
    fac = get_facility(db, facility_id)
    if fac is None:
        return None  # sonra endpoint içinde 404 vereceğiz
    region = fac.country if fac.country else "TR"

    for rec in records:
        # doğru faktörü bul
        # day olarak period_start alıyoruz
        f = get_applicable_factor(
            db=db,
            energy_type=rec.energy_type,
            region=region,
            day=rec.period_start,
        )
        if f is None:
            # Faktör bulunamazsa şu an için o kaydı atla veya hata ver.
            # MVP: atla ama bu durumu ileride loglayacağız.
            continue

        co2_kg = rec.amount * f.factor_kgco2_per_unit
        breakdown[rec.energy_type] += co2_kg
        total += co2_kg

    # formatla
    by_energy_type_list = [
        {"energy_type": etype, "co2_kg": round(val, 3)}
        for etype, val in breakdown.items()
    ]

    return {
        "facility_id": facility_id,
        "month": period_month,
        "total_co2_kg": round(total, 3),
        "by_energy_type": by_energy_type_list
    }
def create_emission_factor(
    db: Session,
    energy_type: str,
    region: str,
    factor_kgco2_per_unit: float,
    valid_from: date,
    valid_to: date | None,
):
    db_factor = models.EmissionFactor(
        energy_type=energy_type,
        region=region,
        factor_kgco2_per_unit=factor_kgco2_per_unit,
        valid_from=valid_from,
        valid_to=valid_to,
    )
    db.add(db_factor)
    db.commit()
    db.refresh(db_factor)
    return db_factor


def get_applicable_factor(
    db: Session,
    energy_type: str,
    region: str,
    day: date,
):
    q = (
        db.query(models.EmissionFactor)
        .filter(models.EmissionFactor.energy_type == energy_type)
        .filter(models.EmissionFactor.region == region)
        .filter(models.EmissionFactor.valid_from <= day)
    )

    factors = q.all()
    applicable = []
    for f in factors:
        if f.valid_to is None or day <= f.valid_to:
            applicable.append(f)

    if not applicable:
        return None

    applicable.sort(key=lambda f: f.created_at, reverse=True)
    return applicable[0]
from collections import defaultdict

def calculate_month_emissions(
    db: Session,
    facility_id: int,
    period_month: str,
):
    year_str, month_str = period_month.split("-")
    year = int(year_str)
    month = int(month_str)

    records = (
        db.query(models.EnergyRecord)
        .filter(models.EnergyRecord.facility_id == facility_id)
        .filter(models.EnergyRecord.period_start.like(f"{period_month}-%"))
        .all()
    )

    if not records:
        return {
            "facility_id": facility_id,
            "month": period_month,
            "total_co2_kg": 0.0,
            "by_energy_type": []
        }

    breakdown = defaultdict(float)
    total = 0.0

    fac = get_facility(db, facility_id)
    if fac is None:
        return None
    region = fac.country if fac.country else "TR"

    for rec in records:
        f = get_applicable_factor(
            db=db,
            energy_type=rec.energy_type,
            region=region,
            day=rec.period_start,
        )
        if f is None:
            continue

        co2_kg = rec.amount * f.factor_kgco2_per_unit
        breakdown[rec.energy_type] += co2_kg
        total += co2_kg

    by_energy_type_list = [
        {"energy_type": etype, "co2_kg": round(val, 3)}
        for etype, val in breakdown.items()
    ]

    return {
        "facility_id": facility_id,
        "month": period_month,
        "total_co2_kg": round(total, 3),
        "by_energy_type": by_energy_type_list
    }