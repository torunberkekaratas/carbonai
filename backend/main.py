from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uvicorn

from datetime import date  # (şu an direkt kullanılmıyor ama dursun problem değil)

import models
import schemas
import crud
from database import SessionLocal, engine, Base


# -------------------------------------------------------------------
# DB tabloları oluştur (ilk run'da lazım)
# -------------------------------------------------------------------
Base.metadata.create_all(bind=engine)

# -------------------------------------------------------------------
# FastAPI app
# -------------------------------------------------------------------
app = FastAPI(title="CarbonAI MVP API")

# -------------------------------------------------------------------
# CORS (frontend React -> backend FastAPI erişimi için zorunlu)
# -------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------------------------
# DB session dependency
# -------------------------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------------------------------------------------
# COMPANY ENDPOINTS
# -------------------------------------------------------------------
@app.post("/company", response_model=schemas.CompanyRead)
def create_company(company_in: schemas.CompanyCreate, db: Session = Depends(get_db)):
    return crud.create_company(db, company_in)


# -------------------------------------------------------------------
# FACILITY ENDPOINTS
# -------------------------------------------------------------------
@app.post("/facility", response_model=schemas.FacilityRead)
def create_facility(facility_in: schemas.FacilityCreate, db: Session = Depends(get_db)):
    # şirket var mı kontrolü
    parent = crud.get_company(db, facility_in.company_id)
    if parent is None:
        raise HTTPException(status_code=400, detail="Company not found")
    return crud.create_facility(db, facility_in)


@app.get("/facility/{facility_id}", response_model=schemas.FacilityRead)
def read_facility(facility_id: int, db: Session = Depends(get_db)):
    fac = crud.get_facility(db, facility_id)
    if fac is None:
        raise HTTPException(status_code=404, detail="Facility not found")
    return fac


# -------------------------------------------------------------------
# ENERGY RECORD ENDPOINTS
# -------------------------------------------------------------------
@app.post("/energy-record", response_model=schemas.EnergyRecordRead)
def create_energy_record(record_in: schemas.EnergyRecordCreate, db: Session = Depends(get_db)):
    # tesis var mı?
    fac = crud.get_facility(db, record_in.facility_id)
    if fac is None:
        raise HTTPException(status_code=400, detail="Facility not found")

    try:
        rec = crud.create_energy_record(db, record_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return rec


@app.get("/facility/{facility_id}/energy-records", response_model=list[schemas.EnergyRecordRead])
def list_energy_records(facility_id: int, db: Session = Depends(get_db)):
    fac = crud.get_facility(db, facility_id)
    if fac is None:
        raise HTTPException(status_code=404, detail="Facility not found")

    records = crud.get_facility_energy_records(db, facility_id, limit=50)
    return records


# -------------------------------------------------------------------
# EMISSION FACTOR ENDPOINT
# -------------------------------------------------------------------
@app.post("/emission-factor", response_model=schemas.EmissionFactorRead)
def create_emission_factor_ep(
    factor_in: schemas.EmissionFactorCreate,
    db: Session = Depends(get_db)
):
    rec = crud.create_emission_factor(
        db=db,
        energy_type=factor_in.energy_type,
        region=factor_in.region,
        factor_kgco2_per_unit=factor_in.factor_kgco2_per_unit,
        valid_from=factor_in.valid_from,
        valid_to=factor_in.valid_to,
    )
    return rec


# -------------------------------------------------------------------
# FACILITY EMISSIONS CALCULATION ENDPOINT
# -------------------------------------------------------------------
@app.get("/facility/{facility_id}/emissions")
def get_facility_emissions(
    facility_id: int,
    month: str,
    db: Session = Depends(get_db)
):
    """
    month param: "YYYY-MM" formatında, örn: 2025-10
    """
    fac = crud.get_facility(db, facility_id)
    if fac is None:
        raise HTTPException(status_code=404, detail="Facility not found")

    result = crud.calculate_month_emissions(db, facility_id, period_month=month)
    if result is None:
        raise HTTPException(status_code=500, detail="Emission calculation error")

    return result


# -------------------------------------------------------------------
# ROOT (opsiyonel ama faydalı healthcheck)
# -------------------------------------------------------------------
@app.get("/")
def root():
    return {"message": "CarbonAI backend aktif 🚀"}


# -------------------------------------------------------------------
# LOCAL DEV RUN (elle python main.py dersen bunu kullanır)
# uvicorn komutu ile zaten portu 8010 veriyoruz, buradaki 8000 önemli değil
# -------------------------------------------------------------------
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)