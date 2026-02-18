from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from ..models import Employee

class EmployeeRepository:
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, employee_data: dict) -> Employee:
        employee = Employee(**employee_data)
        self.db.add(employee)
        self.db.commit()
        self.db.refresh(employee)
        return employee
    
    def get_all(self) -> List[Employee]:
        return self.db.query(Employee).all()
    
    def get_by_id(self, employee_id: int) -> Optional[Employee]:
        return self.db.query(Employee).filter(Employee.id == employee_id).first()
    
    def get_by_employee_id(self, employee_id: str) -> Optional[Employee]:
        return self.db.query(Employee).filter(Employee.employee_id == employee_id).first()
    
    def get_by_email(self, email: str) -> Optional[Employee]:
        return self.db.query(Employee).filter(Employee.email == email).first()
    
    def delete(self, employee: Employee) -> None:
        self.db.delete(employee)
        self.db.commit()

    def get_all_departments(self) -> List[str]:
        # Return predefined list of departments
        return [
            "Human Resources",
            "Engineering",
            "Marketing",
            "Sales",
            "Finance",
            "IT"
        ]
