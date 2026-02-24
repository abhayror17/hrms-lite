from pydantic import BaseModel
from datetime import date, datetime
from typing import Annotated
from app.enums import AttendanceStatus

class AttendanceBase(BaseModel):
    employee_id: str
    date: date
    status: AttendanceStatus

    @staticmethod
    def validate_date(v):
        if v > date.today():
            raise ValueError('Attendance date cannot be in the future')
        return v

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceResponse(BaseModel):
    id: str
    employee_id: str
    employee_name: str
    employee_employee_id: str
    date: date
    status: AttendanceStatus
    created_at: datetime

class AttendanceWithEmployeeName(BaseModel):
    id: str
    employee_id: str
    employee_name: str
    employee_employee_id: str
    date: date
    status: AttendanceStatus
    created_at: datetime