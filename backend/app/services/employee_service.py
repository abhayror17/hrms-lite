from sqlalchemy.orm import Session
from typing import List
from fastapi import HTTPException, status
from ..repositories.employee_repository import EmployeeRepository
from ..schemas import EmployeeCreate, EmployeeResponse

class EmployeeService:
    
    def __init__(self, db: Session):
        self.repository = EmployeeRepository(db)
    
    def create_employee(self, employee: EmployeeCreate) -> EmployeeResponse:
        existing_employee = self.repository.get_by_employee_id(employee.employee_id)
        if existing_employee:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Employee with ID '{employee.employee_id}' already exists"
            )
        
        existing_email = self.repository.get_by_email(employee.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Employee with email '{employee.email}' already exists"
            )
        
        new_employee = self.repository.create(employee.model_dump())
        return EmployeeResponse.model_validate(new_employee)
    
    def get_all_employees(self) -> List[EmployeeResponse]:
        employees = self.repository.get_all()
        return [EmployeeResponse.model_validate(emp) for emp in employees]
    
    def delete_employee(self, employee_id: int) -> None:
        employee = self.repository.get_by_id(employee_id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID {employee_id} not found"
            )
        
        self.repository.delete(employee)

    def get_all_departments(self) -> List[str]:
        departments = self.repository.get_all_departments()
        return departments
