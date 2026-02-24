from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import List, Optional
from datetime import date, datetime
from app.database import get_db
from app.models.employee import Employee
from app.models.attendance import Attendance, AttendanceStatus
from app.schemas.attendance import AttendanceCreate, AttendanceResponse, AttendanceWithEmployeeName

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])

@router.post("/", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def mark_attendance(attendance: AttendanceCreate, db: Session = Depends(get_db)):
    """Mark attendance for an employee on a specific date"""
    
    # Verify employee exists
    employee = db.query(Employee).filter(
        Employee.id == attendance.employee_id,
        Employee.is_active == True
    ).first()
    
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{attendance.employee_id}' not found"
        )
    
    # Check if attendance already marked for this date
    existing = db.query(Attendance).filter(
        Attendance.employee_id == attendance.employee_id,
        Attendance.date == attendance.date
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Attendance already marked for employee '{employee.employee_id}' on {attendance.date}"
        )
    
    # Create attendance record
    db_attendance = Attendance(
        employee_id=attendance.employee_id,
        date=attendance.date,
        status=attendance.status
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    
    return AttendanceResponse(
        id=db_attendance.id,
        employee_id=db_attendance.employee_id,
        employee_name=employee.full_name,
        employee_employee_id=employee.employee_id,
        date=db_attendance.date,
        status=db_attendance.status,
        created_at=db_attendance.created_at
    )

@router.get("/", response_model=List[AttendanceWithEmployeeName])
def get_attendance_records(
    employee_id: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    status: Optional[AttendanceStatus] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get attendance records with optional filtering"""
    query = db.query(Attendance).join(Employee).filter(Employee.is_active == True)
    
    if employee_id:
        query = query.filter(Attendance.employee_id == employee_id)
    
    if start_date:
        query = query.filter(Attendance.date >= start_date)
    
    if end_date:
        query = query.filter(Attendance.date <= end_date)
    
    if status:
        query = query.filter(Attendance.status == status)
    
    records = query.order_by(Attendance.date.desc()).offset(skip).limit(limit).all()
    
    return [
        AttendanceWithEmployeeName(
            id=record.id,
            employee_id=record.employee_id,
            employee_name=record.employee.full_name,
            employee_employee_id=record.employee.employee_id,
            date=record.date,
            status=record.status,
            created_at=record.created_at
        )
        for record in records
    ]

@router.get("/employee/{employee_id}", response_model=List[AttendanceWithEmployeeName])
def get_employee_attendance(
    employee_id: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Get all attendance records for a specific employee"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found"
        )
    
    query = db.query(Attendance).filter(Attendance.employee_id == employee_id)
    
    if start_date:
        query = query.filter(Attendance.date >= start_date)
    
    if end_date:
        query = query.filter(Attendance.date <= end_date)
    
    records = query.order_by(Attendance.date.desc()).all()
    
    return [
        AttendanceWithEmployeeName(
            id=record.id,
            employee_id=record.employee_id,
            employee_name=employee.full_name,
            employee_employee_id=employee.employee_id,
            date=record.date,
            status=record.status,
            created_at=record.created_at
        )
        for record in records
    ]

@router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance(attendance_id: str, db: Session = Depends(get_db)):
    """Delete an attendance record"""
    record = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Attendance record with ID '{attendance_id}' not found"
        )
    
    db.delete(record)
    db.commit()
    return None

@router.get("/today")
def get_today_attendance(db: Session = Depends(get_db)):
    """Get today's attendance status for all employees"""
    today = date.today()
    
    # Get all active employees
    employees = db.query(Employee).filter(Employee.is_active == True).all()
    
    # Get today's attendance records
    today_records = db.query(Attendance).filter(Attendance.date == today).all()
    attendance_map = {r.employee_id: r.status for r in today_records}
    
    result = []
    for emp in employees:
        result.append({
            "employee_id": emp.id,
            "employee_code": emp.employee_id,
            "full_name": emp.full_name,
            "department": emp.department,
            "date": today,
            "status": attendance_map.get(emp.id, "Not Marked")
        })
    
    return result

@router.put("/{attendance_id}")
def update_attendance(
    attendance_id: str,
    status: AttendanceStatus = Query(..., description="New attendance status"),
    db: Session = Depends(get_db)
):
    """Update an existing attendance record"""
    record = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Attendance record with ID '{attendance_id}' not found"
        )
    
    record.status = status
    db.commit()
    db.refresh(record)
    
    employee = db.query(Employee).filter(Employee.id == record.employee_id).first()
    
    return AttendanceResponse(
        id=record.id,
        employee_id=record.employee_id,
        employee_name=employee.full_name if employee else "Unknown",
        employee_employee_id=employee.employee_id if employee else "Unknown",
        date=record.date,
        status=record.status,
        created_at=record.created_at
    )
