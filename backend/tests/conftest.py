"""
Test fixtures for HRMS Lite backend tests.
Provides database setup, test client, and sample data fixtures.
"""
import os
import pytest
from datetime import date, datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticMemoryPool
import factory

# Set test environment before importing app modules
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["CORS_ORIGINS"] = "http://localhost:3000,http://localhost:5173"

from app.database import Base, get_db
from app.main import app
from app.models.employee import Employee
from app.models.attendance import Attendance
from app.enums import AttendanceStatus

# Import factories
from tests.factories import (
    EmployeeFactory,
    AttendanceFactory,
    ActiveEmployeeFactory,
    InactiveEmployeeFactory,
    EngineeringEmployeeFactory,
    MarketingEmployeeFactory,
    PresentAttendanceFactory,
    AbsentAttendanceFactory,
    create_employee_with_attendance,
    create_department_employees,
    create_todays_attendance_for_all,
    generate_sample_data,
)


# Create in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticMemoryPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database dependency override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


# Factory Boy fixtures
@pytest.fixture
def employee_factory(db_session):
    """Factory fixture for creating Employee instances."""
    EmployeeFactory._meta.sqlalchemy_session = db_session
    return EmployeeFactory


@pytest.fixture
def attendance_factory(db_session):
    """Factory fixture for creating Attendance instances."""
    AttendanceFactory._meta.sqlalchemy_session = db_session
    EmployeeFactory._meta.sqlalchemy_session = db_session
    return AttendanceFactory


@pytest.fixture
def active_employee_factory(db_session):
    """Factory fixture for creating active Employee instances."""
    ActiveEmployeeFactory._meta.sqlalchemy_session = db_session
    return ActiveEmployeeFactory


@pytest.fixture
def inactive_employee_factory(db_session):
    """Factory fixture for creating inactive Employee instances."""
    InactiveEmployeeFactory._meta.sqlalchemy_session = db_session
    return InactiveEmployeeFactory


@pytest.fixture
def engineering_employee_factory(db_session):
    """Factory fixture for creating engineering department employees."""
    EngineeringEmployeeFactory._meta.sqlalchemy_session = db_session
    return EngineeringEmployeeFactory


@pytest.fixture
def marketing_employee_factory(db_session):
    """Factory fixture for creating marketing department employees."""
    MarketingEmployeeFactory._meta.sqlalchemy_session = db_session
    return MarketingEmployeeFactory


@pytest.fixture
def present_attendance_factory(db_session):
    """Factory fixture for creating present attendance records."""
    PresentAttendanceFactory._meta.sqlalchemy_session = db_session
    EmployeeFactory._meta.sqlalchemy_session = db_session
    return PresentAttendanceFactory


@pytest.fixture
def absent_attendance_factory(db_session):
    """Factory fixture for creating absent attendance records."""
    AbsentAttendanceFactory._meta.sqlalchemy_session = db_session
    EmployeeFactory._meta.sqlalchemy_session = db_session
    return AbsentAttendanceFactory


@pytest.fixture
def employee_with_attendance(db_session):
    """Fixture to create employee with attendance pattern."""
    EmployeeFactory._meta.sqlalchemy_session = db_session
    AttendanceFactory._meta.sqlalchemy_session = db_session
    
    def _create(days_present=5, days_absent=2, start_date=None):
        return create_employee_with_attendance(days_present, days_absent, start_date)
    return _create


@pytest.fixture
def department_employees(db_session):
    """Fixture to create multiple employees in a department."""
    EmployeeFactory._meta.sqlalchemy_session = db_session
    
    def _create(department_name, count=5):
        return create_department_employees(department_name, count)
    return _create


@pytest.fixture
def todays_attendance(db_session):
    """Fixture to create today's attendance for employees."""
    EmployeeFactory._meta.sqlalchemy_session = db_session
    AttendanceFactory._meta.sqlalchemy_session = db_session
    
    def _create(employees, present_count=None):
        return create_todays_attendance_for_all(employees, present_count)
    return _create


@pytest.fixture
def sample_data(db_session):
    """Fixture to generate complete sample dataset."""
    EmployeeFactory._meta.sqlalchemy_session = db_session
    AttendanceFactory._meta.sqlalchemy_session = db_session
    
    def _generate(employee_count=10, departments=None):
        return generate_sample_data(employee_count, departments)
    return _generate


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database dependency override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_employee_data():
    """Sample employee data for testing."""
    return {
        "employee_id": "EMP001",
        "full_name": "John Doe",
        "email": "john.doe@example.com",
        "department": "Engineering"
    }


@pytest.fixture
def sample_employee_data_2():
    """Second sample employee data for testing."""
    return {
        "employee_id": "EMP002",
        "full_name": "Jane Smith",
        "email": "jane.smith@example.com",
        "department": "Marketing"
    }


@pytest.fixture
def sample_attendance_data():
    """Sample attendance data for testing."""
    return {
        "employee_id": "test-employee-id",  # Will be replaced with actual ID
        "date": str(date.today()),
        "status": AttendanceStatus.PRESENT.value
    }


@pytest.fixture
def create_test_employee(db_session):
    """Factory fixture to create test employees."""
    def _create_employee(
        employee_id="EMP001",
        full_name="John Doe",
        email="john.doe@example.com",
        department="Engineering",
        is_active=True
    ):
        employee = Employee(
            employee_id=employee_id,
            full_name=full_name,
            email=email.lower(),
            department=department,
            is_active=is_active
        )
        db_session.add(employee)
        db_session.commit()
        db_session.refresh(employee)
        return employee
    return _create_employee


@pytest.fixture
def create_test_attendance(db_session, create_test_employee):
    """Factory fixture to create test attendance records."""
    def _create_attendance(
        employee=None,
        attendance_date=None,
        status=AttendanceStatus.PRESENT
    ):
        if employee is None:
            employee = create_test_employee()
        if attendance_date is None:
            attendance_date = date.today()
        
        attendance = Attendance(
            employee_id=employee.id,
            date=attendance_date,
            status=status
        )
        db_session.add(attendance)
        db_session.commit()
        db_session.refresh(attendance)
        return attendance
    return _create_attendance


@pytest.fixture
def multiple_employees(create_test_employee):
    """Create multiple test employees."""
    employees = [
        create_test_employee(
            employee_id="EMP001",
            full_name="Alice Johnson",
            email="alice@example.com",
            department="Engineering"
        ),
        create_test_employee(
            employee_id="EMP002",
            full_name="Bob Williams",
            email="bob@example.com",
            department="Marketing"
        ),
        create_test_employee(
            employee_id="EMP003",
            full_name="Charlie Brown",
            email="charlie@example.com",
            department="Engineering"
        ),
    ]
    return employees


@pytest.fixture
def sample_attendance_records(create_test_attendance, multiple_employees):
    """Create sample attendance records for testing."""
    records = []
    today = date.today()
    yesterday = today - timedelta(days=1)
    
    # Today's attendance
    records.append(create_test_attendance(multiple_employees[0], today, AttendanceStatus.PRESENT))
    records.append(create_test_attendance(multiple_employees[1], today, AttendanceStatus.ABSENT))
    
    # Yesterday's attendance
    records.append(create_test_attendance(multiple_employees[0], yesterday, AttendanceStatus.PRESENT))
    records.append(create_test_attendance(multiple_employees[2], yesterday, AttendanceStatus.PRESENT))
    
    return records
