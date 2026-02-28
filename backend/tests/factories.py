"""
Factory Boy factories for HRMS Lite test data generation.
Provides factories for Employee and Attendance models.
"""
import uuid
from datetime import date, timedelta
from factory import Factory, Faker, LazyAttribute, Sequence, SubFactory
from factory.alchemy import SQLAlchemyModelFactory

from app.models.employee import Employee
from app.models.attendance import Attendance
from app.enums import AttendanceStatus


class EmployeeFactory(SQLAlchemyModelFactory):
    """
    Factory for creating Employee test instances.
    
    Usage:
        # Create with default values
        employee = EmployeeFactory.create()
        
        # Create with custom values
        employee = EmployeeFactory.create(
            full_name='Custom Name',
            department='Custom Dept'
        )
        
        # Create multiple employees
        employees = EmployeeFactory.create_batch(5)
        
        # Build without saving to database
        employee = EmployeeFactory.build()
    """
    
    class Meta:
        model = Employee
        sqlalchemy_session_persistence = 'commit'
    
    # Auto-generated unique employee_id
    employee_id = Sequence(lambda n: f'EMP{n+1:04d}')
    
    # Random name generation
    full_name = Faker('name')
    
    # Unique email based on employee_id
    email = LazyAttribute(
        lambda obj: f"{obj.full_name.lower().replace(' ', '.')}@example.com"
    )
    
    # Random department
    department = Faker('job')
    
    # Default to active
    is_active = True


class AttendanceFactory(SQLAlchemyModelFactory):
    """
    Factory for creating Attendance test instances.
    
    Usage:
        # Create with default employee and today's date
        attendance = AttendanceFactory.create()
        
        # Create for specific employee
        employee = EmployeeFactory.create()
        attendance = AttendanceFactory.create(employee=employee)
        
        # Create with specific date and status
        attendance = AttendanceFactory.create(
            date=date.today() - timedelta(days=1),
            status=AttendanceStatus.ABSENT
        )
        
        # Create batch
        records = AttendanceFactory.create_batch(10)
    """
    
    class Meta:
        model = Attendance
        sqlalchemy_session_persistence = 'commit'
    
    # Auto-create employee if not provided
    employee = SubFactory(EmployeeFactory)
    
    # Default to today
    date = date.today()
    
    # Default to Present
    status = AttendanceStatus.PRESENT


# Convenient factory functions for common test scenarios

def create_employee_with_attendance(
    days_present: int = 5,
    days_absent: int = 2,
    start_date: date = None
) -> Employee:
    """
    Create an employee with a specific attendance pattern.
    
    Args:
        days_present: Number of days employee was present
        days_absent: Number of days employee was absent
        start_date: Start date for attendance records (defaults to today)
    
    Returns:
        Employee with attendance records
    """
    if start_date is None:
        start_date = date.today()
    
    employee = EmployeeFactory.create()
    
    current_date = start_date
    
    # Create present records
    for _ in range(days_present):
        AttendanceFactory.create(
            employee=employee,
            date=current_date,
            status=AttendanceStatus.PRESENT
        )
        current_date -= timedelta(days=1)
    
    # Create absent records
    for _ in range(days_absent):
        AttendanceFactory.create(
            employee=employee,
            date=current_date,
            status=AttendanceStatus.ABSENT
        )
        current_date -= timedelta(days=1)
    
    return employee


def create_department_employees(
    department_name: str,
    count: int = 5
) -> list[Employee]:
    """
    Create multiple employees in the same department.
    
    Args:
        department_name: Name of the department
        count: Number of employees to create
    
    Returns:
        List of employees in the department
    """
    return EmployeeFactory.create_batch(
        count,
        department=department_name
    )


def create_todays_attendance_for_all(
    employees: list[Employee],
    present_count: int = None
) -> list[Attendance]:
    """
    Create today's attendance records for a list of employees.
    
    Args:
        employees: List of employees to create attendance for
        present_count: Number of employees present (rest are absent).
                      Defaults to 80% of total.
    
    Returns:
        List of attendance records
    """
    if present_count is None:
        present_count = int(len(employees) * 0.8)
    
    records = []
    
    for i, employee in enumerate(employees):
        status = AttendanceStatus.PRESENT if i < present_count else AttendanceStatus.ABSENT
        records.append(
            AttendanceFactory.create(
                employee=employee,
                date=date.today(),
                status=status
            )
        )
    
    return records


# Specialized factories for different scenarios

class ActiveEmployeeFactory(EmployeeFactory):
    """Factory for creating active employees only."""
    is_active = True


class InactiveEmployeeFactory(EmployeeFactory):
    """Factory for creating inactive employees."""
    is_active = False
    employee_id = Sequence(lambda n: f'INACTIVE{n+1:04d}')


class EngineeringEmployeeFactory(EmployeeFactory):
    """Factory for creating engineering department employees."""
    department = 'Engineering'
    employee_id = Sequence(lambda n: f'ENG{n+1:04d}')


class MarketingEmployeeFactory(EmployeeFactory):
    """Factory for creating marketing department employees."""
    department = 'Marketing'
    employee_id = Sequence(lambda n: f'MKT{n+1:04d}')


class PresentAttendanceFactory(AttendanceFactory):
    """Factory for creating present attendance records."""
    status = AttendanceStatus.PRESENT


class AbsentAttendanceFactory(AttendanceFactory):
    """Factory for creating absent attendance records."""
    status = AttendanceStatus.ABSENT


class YesterdayAttendanceFactory(AttendanceFactory):
    """Factory for creating yesterday's attendance records."""
    date = LazyAttribute(lambda _: date.today() - timedelta(days=1))


class LastWeekAttendanceFactory(AttendanceFactory):
    """Factory for creating last week's attendance records."""
    date = LazyAttribute(lambda _: date.today() - timedelta(days=7))


# Data generation helpers

def generate_sample_data(
    employee_count: int = 10,
    departments: list[str] = None
) -> dict:
    """
    Generate a complete sample dataset for testing.
    
    Args:
        employee_count: Total number of employees to create
        departments: List of department names to distribute employees
    
    Returns:
        Dictionary with created employees and statistics
    """
    if departments is None:
        departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance']
    
    employees = []
    
    # Distribute employees across departments
    for i in range(employee_count):
        department = departments[i % len(departments)]
        employees.append(
            EmployeeFactory.create(department=department)
        )
    
    # Create attendance for past week
    today = date.today()
    for employee in employees:
        for days_ago in range(7):
            attendance_date = today - timedelta(days=days_ago)
            # 80% attendance rate
            status = AttendanceStatus.PRESENT if (hash(employee.id + str(attendance_date)) % 5) != 0 else AttendanceStatus.ABSENT
            AttendanceFactory.create(
                employee=employee,
                date=attendance_date,
                status=status
            )
    
    return {
        'employees': employees,
        'total_employees': len(employees),
        'departments': departments,
    }
