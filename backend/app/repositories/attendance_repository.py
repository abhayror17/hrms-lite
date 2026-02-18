from sqlalchemy.orm import Session
from typing import List, Optional, Tuple
from datetime import date
from ..models import Attendance, Employee

class AttendanceRepository:
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, attendance_data: dict) -> Attendance:
        attendance = Attendance(**attendance_data)
        self.db.add(attendance)
        self.db.commit()
        self.db.refresh(attendance)
        return attendance
    
    def get_by_employee_id(self, employee_id: int) -> List[Attendance]:
        return self.db.query(Attendance).filter(
            Attendance.employee_id == employee_id
        ).order_by(Attendance.date.desc()).all()
    
    def get_by_employee_and_date(self, employee_id: int, attendance_date: date) -> Optional[Attendance]:
        return self.db.query(Attendance).filter(
            Attendance.employee_id == employee_id,
            Attendance.date == attendance_date
        ).first()
    
    def get_all_with_employees(self, date_filter: Optional[date] = None) -> List[Tuple[Attendance, Employee]]:
        query = self.db.query(Attendance, Employee).join(
            Employee, Attendance.employee_id == Employee.id
        )
        
        if date_filter:
            query = query.filter(Attendance.date == date_filter)
        
        return query.order_by(Attendance.date.desc()).all()

    def get_stats_by_range(self, start_date: date, end_date: date) -> List[dict]:
        from sqlalchemy import func
        results = self.db.query(
            Attendance.date,
            func.count(Attendance.id).label('total'),
            func.sum(func.case([(Attendance.status == 'Present', 1)], else_=0)).label('present'),
            func.sum(func.case([(Attendance.status == 'Absent', 1)], else_=0)).label('absent')
        ).filter(
            Attendance.date.between(start_date, end_date)
        ).group_by(Attendance.date).order_by(Attendance.date.asc()).all()
        
        return [
            {
                "date": str(r.date),
                "total": r.total,
                "present": int(r.present or 0),
                "absent": int(r.absent or 0)
            }
            for r in results
        ]
