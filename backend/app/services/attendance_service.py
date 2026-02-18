from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from fastapi import HTTPException, status
from ..repositories.attendance_repository import AttendanceRepository
from ..repositories.employee_repository import EmployeeRepository
from ..schemas import AttendanceCreate, AttendanceResponse

class AttendanceService:
    
    def __init__(self, db: Session):
        self.attendance_repo = AttendanceRepository(db)
        self.employee_repo = EmployeeRepository(db)
    
    def mark_attendance(self, attendance: AttendanceCreate) -> AttendanceResponse:
        employee = self.employee_repo.get_by_id(attendance.employee_id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {attendance.employee_id} not found"
            )
        
        existing_attendance = self.attendance_repo.get_by_employee_and_date(
            attendance.employee_id, 
            attendance.date
        )
        if existing_attendance:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Attendance already marked for employee {employee.full_name} on {attendance.date}"
            )
        
        new_attendance = self.attendance_repo.create(attendance.model_dump())
        
        return AttendanceResponse(
            id=new_attendance.id,
            employee_id=new_attendance.employee_id,
            employee_name=employee.full_name,
            date=new_attendance.date,
            status=new_attendance.status,
            created_at=new_attendance.created_at
        )
    
    def get_employee_attendance(self, employee_id: int) -> List[AttendanceResponse]:
        employee = self.employee_repo.get_by_id(employee_id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {employee_id} not found"
            )
        
        attendances = self.attendance_repo.get_by_employee_id(employee_id)
        
        return [
            AttendanceResponse(
                id=att.id,
                employee_id=att.employee_id,
                employee_name=employee.full_name,
                date=att.date,
                status=att.status,
                created_at=att.created_at
            )
            for att in attendances
        ]
    
    def get_all_attendance(self, date_filter: Optional[date] = None) -> List[AttendanceResponse]:
        results = self.attendance_repo.get_all_with_employees(date_filter)
        
        return [
            AttendanceResponse(
                id=att.id,
                employee_id=att.employee_id,
                employee_name=emp.full_name,
                date=att.date,
                status=att.status,
                created_at=att.created_at
            )
            for att, emp in results
        ]

    def get_weekly_stats(self) -> List[dict]:
        from datetime import timedelta
        end_date = date.today()
        start_date = end_date - timedelta(days=6)
        
        return self.attendance_repo.get_stats_by_range(start_date, end_date)
