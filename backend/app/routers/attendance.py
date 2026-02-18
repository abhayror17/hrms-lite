from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/attendance", tags=["attendance"])

@router.post("/", response_model=schemas.AttendanceResponse, status_code=status.HTTP_201_CREATED)
def mark_attendance(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == attendance.employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID {attendance.employee_id} not found"
        )
    
    existing_attendance = db.query(models.Attendance).filter(
        models.Attendance.employee_id == attendance.employee_id,
        models.Attendance.date == attendance.date
    ).first()
    if existing_attendance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Attendance already marked for employee {employee.full_name} on {attendance.date}"
        )
    
    new_attendance = models.Attendance(**attendance.model_dump())
    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)
    
    response = schemas.AttendanceResponse(
        id=new_attendance.id,
        employee_id=new_attendance.employee_id,
        employee_name=employee.full_name,
        date=new_attendance.date,
        status=new_attendance.status,
        created_at=new_attendance.created_at
    )
    return response

@router.get("/{employee_id}", response_model=List[schemas.AttendanceResponse])
def get_employee_attendance(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID {employee_id} not found"
        )
    
    attendances = db.query(models.Attendance).filter(
        models.Attendance.employee_id == employee_id
    ).order_by(models.Attendance.date.desc()).all()
    
    response = [
        schemas.AttendanceResponse(
            id=att.id,
            employee_id=att.employee_id,
            employee_name=employee.full_name,
            date=att.date,
            status=att.status,
            created_at=att.created_at
        )
        for att in attendances
    ]
    return response

@router.get("/", response_model=List[schemas.AttendanceResponse])
def get_all_attendance(
    date_filter: Optional[date] = Query(None, alias="date"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Attendance, models.Employee).join(
        models.Employee, models.Attendance.employee_id == models.Employee.id
    )
    
    if date_filter:
        query = query.filter(models.Attendance.date == date_filter)
    
    results = query.order_by(models.Attendance.date.desc()).all()
    
    response = [
        schemas.AttendanceResponse(
            id=att.id,
            employee_id=att.employee_id,
            employee_name=emp.full_name,
            date=att.date,
            status=att.status,
            created_at=att.created_at
        )
        for att, emp in results
    ]
    return response
