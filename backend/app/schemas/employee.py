from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime

class EmployeeBase(BaseModel):
    employee_id: str = Field(..., min_length=1, max_length=20, description="Unique employee ID")
    full_name: str = Field(..., min_length=1, max_length=100, description="Employee's full name")
    email: EmailStr = Field(..., description="Employee's email address")
    department: str = Field(..., min_length=1, max_length=100, description="Department name")

    @field_validator('employee_id')
    @classmethod
    def validate_employee_id(cls, v):
        if not v or not v.strip():
            raise ValueError('Employee ID cannot be empty or whitespace')
        return v.strip().upper()

    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Full name cannot be empty or whitespace')
        return v.strip()

    @field_validator('department')
    @classmethod
    def validate_department(cls, v):
        if not v or not v.strip():
            raise ValueError('Department cannot be empty or whitespace')
        return v.strip()

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    department: Optional[str] = Field(None, min_length=1, max_length=100)

    @field_validator('full_name', 'department')
    @classmethod
    def validate_optional_fields(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Field cannot be empty or whitespace')
        return v.strip() if v else v

class EmployeeResponse(EmployeeBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
