from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.employee import Employee
from app.models.attendance import Attendance
from app.schemas.employee import EmployeeCreate, EmployeeResponse, EmployeeUpdate

router = APIRouter(prefix="/api/employees", tags=["Employees"])

@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_employees = db.query(func.count(Employee.id)).filter(Employee.is_active == True).scalar() or 0
    
    departments = db.query(
        Employee.department,
        func.count(Employee.id).label('count')
    ).filter(Employee.is_active == True).group_by(Employee.department).all()
    
    today = date.today()
    today_present = db.query(func.count(Attendance.id)).filter(
        Attendance.date == today,
        Attendance.status == "Present"
    ).scalar() or 0
    
    today_absent = db.query(func.count(Attendance.id)).filter(
        Attendance.date == today,
        Attendance.status == "Absent"
    ).scalar() or 0
    
    total_attendance_records = db.query(func.count(Attendance.id)).scalar() or 0
    total_present = db.query(func.count(Attendance.id)).filter(Attendance.status == "Present").scalar() or 0
    
    overall_attendance_rate = (total_present / total_attendance_records * 100) if total_attendance_records > 0 else 0
    
    recent_employees = db.query(Employee).filter(
        Employee.is_active == True
    ).order_by(Employee.created_at.desc()).limit(5).all()
    
    return {
        "total_employees": total_employees,
        "departments": [{"name": dept, "count": count} for dept, count in departments],
        "today_attendance": {
            "present": today_present,
            "absent": today_absent,
            "not_marked": total_employees - today_present - today_absent
        },
        "overall_attendance_rate": round(overall_attendance_rate, 2),
        "recent_employees": [
            {
                "id": emp.id,
                "employee_id": emp.employee_id,
                "full_name": emp.full_name,
                "department": emp.department,
                "created_at": emp.created_at.isoformat() if emp.created_at else None
            } for emp in recent_employees
        ]
    }

@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    """Create a new employee with validation"""
    
    # Check for duplicate employee_id (only among active employees)
    existing_by_emp_id = db.query(Employee).filter(
        Employee.employee_id == employee.employee_id,
        Employee.is_active == True
    ).first()
    if existing_by_emp_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee with ID '{employee.employee_id}' already exists"
        )
    
    # Check for duplicate email (only among active employees)
    existing_by_email = db.query(Employee).filter(
        Employee.email == employee.email.lower(),
        Employee.is_active == True
    ).first()
    if existing_by_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee with email '{employee.email}' already exists"
        )
    
    # Create new employee
    db_employee = Employee(
        employee_id=employee.employee_id,
        full_name=employee.full_name,
        email=employee.email.lower(),
        department=employee.department
    )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.get("/", response_model=List[EmployeeResponse])
def get_employees(
    skip: int = 0,
    limit: int = 100,
    department: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all employees with optional filtering"""
    query = db.query(Employee).filter(Employee.is_active == True)
    
    if department:
        query = query.filter(Employee.department.ilike(f"%{department}%"))
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Employee.full_name.ilike(search_filter)) |
            (Employee.employee_id.ilike(search_filter)) |
            (Employee.email.ilike(search_filter))
        )
    
    employees = query.order_by(Employee.created_at.desc()).offset(skip).limit(limit).all()
    return employees

@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    """Get a single employee by ID"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found"
        )
    return employee

@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: str,
    employee_update: EmployeeUpdate,
    db: Session = Depends(get_db)
):
    """Update an employee's information"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found"
        )
    
    update_data = employee_update.model_dump(exclude_unset=True)
    
    # Check for duplicate email if email is being updated
    if 'email' in update_data:
        existing = db.query(Employee).filter(
            Employee.email == update_data['email'].lower(),
            Employee.id != employee_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Employee with email '{update_data['email']}' already exists"
            )
        update_data['email'] = update_data['email'].lower()
    
    for field, value in update_data.items():
        setattr(employee, field, value)
    
    db.commit()
    db.refresh(employee)
    return employee

@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    """Delete an employee (hard delete - removes from database)"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found"
        )
    
    # Hard delete - actually remove from database
    db.delete(employee)
    db.commit()
    return None

@router.get("/{employee_id}/summary")
def get_employee_summary(employee_id: str, db: Session = Depends(get_db)):
    """Get attendance summary for an employee"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found"
        )
    
    # Get attendance statistics
    total_present = db.query(func.count(Attendance.id)).filter(
        Attendance.employee_id == employee_id,
        Attendance.status == "Present"
    ).scalar() or 0
    
    total_absent = db.query(func.count(Attendance.id)).filter(
        Attendance.employee_id == employee_id,
        Attendance.status == "Absent"
    ).scalar() or 0
    
    total_days = total_present + total_absent
    attendance_rate = (total_present / total_days * 100) if total_days > 0 else 0
    
    return {
        "employee_id": employee.id,
        "employee_code": employee.employee_id,
        "full_name": employee.full_name,
        "department": employee.department,
        "total_present": total_present,
        "total_absent": total_absent,
        "attendance_rate": round(attendance_rate, 2)
    }
