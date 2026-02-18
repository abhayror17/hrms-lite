from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from ..services.employee_service import EmployeeService
from .. import schemas
from ..database import get_db

router = APIRouter(prefix="/api/employees", tags=["employees"])

@router.post("/", response_model=schemas.EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    service = EmployeeService(db)
    return service.create_employee(employee)

@router.get("/", response_model=List[schemas.EmployeeResponse])
def get_employees(db: Session = Depends(get_db)):
    service = EmployeeService(db)
    return service.get_all_employees()

@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    service = EmployeeService(db)
    service.delete_employee(employee_id)
    return None

@router.get("/departments", response_model=List[str])
def get_departments(db: Session = Depends(get_db)):
    service = EmployeeService(db)
    return service.get_all_departments()
