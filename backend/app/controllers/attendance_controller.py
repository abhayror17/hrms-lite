from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from ..services.attendance_service import AttendanceService
from .. import schemas
from ..database import get_db

router = APIRouter(prefix="/api/attendance", tags=["attendance"])

@router.post("/", response_model=schemas.AttendanceResponse, status_code=status.HTTP_201_CREATED)
def mark_attendance(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    service = AttendanceService(db)
    return service.mark_attendance(attendance)

@router.get("/{employee_id}", response_model=List[schemas.AttendanceResponse])
def get_employee_attendance(employee_id: int, db: Session = Depends(get_db)):
    service = AttendanceService(db)
    return service.get_employee_attendance(employee_id)

@router.get("/", response_model=List[schemas.AttendanceResponse])
def get_all_attendance(
    date_filter: Optional[date] = Query(None, alias="date"),
    db: Session = Depends(get_db)
):
    service = AttendanceService(db)
    return service.get_all_attendance(date_filter)

@router.get("/stats/weekly")
def get_weekly_stats(db: Session = Depends(get_db)):
    service = AttendanceService(db)
    return service.get_weekly_stats()
