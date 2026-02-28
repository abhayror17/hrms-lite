"""
Unit tests for Attendance schemas.
Tests validation logic, field constraints, and edge cases.
"""
import pytest
from datetime import date, datetime, timedelta
from pydantic import ValidationError

from app.schemas.attendance import (
    AttendanceBase,
    AttendanceCreate,
    AttendanceResponse,
    AttendanceWithEmployeeName
)
from app.enums import AttendanceStatus


class TestAttendanceBase:
    """Tests for AttendanceBase schema validation."""
    
    def test_valid_attendance_base(self):
        """Test creating AttendanceBase with valid data."""
        data = {
            "employee_id": "test-employee-uuid",
            "date": date.today(),
            "status": AttendanceStatus.PRESENT
        }
        attendance = AttendanceBase(**data)
        assert attendance.employee_id == "test-employee-uuid"
        assert attendance.date == date.today()
        assert attendance.status == AttendanceStatus.PRESENT
    
    def test_valid_attendance_with_string_status(self):
        """Test creating AttendanceBase with string status."""
        data = {
            "employee_id": "test-employee-uuid",
            "date": date.today(),
            "status": "Present"
        }
        attendance = AttendanceBase(**data)
        assert attendance.status == AttendanceStatus.PRESENT
    
    def test_valid_attendance_absent_status(self):
        """Test creating AttendanceBase with Absent status."""
        data = {
            "employee_id": "test-employee-uuid",
            "date": date.today(),
            "status": AttendanceStatus.ABSENT
        }
        attendance = AttendanceBase(**data)
        assert attendance.status == AttendanceStatus.ABSENT
    
    def test_invalid_status_raises_error(self):
        """Test that invalid status raises validation error."""
        data = {
            "employee_id": "test-employee-uuid",
            "date": date.today(),
            "status": "Late"
        }
        with pytest.raises(ValidationError):
            AttendanceBase(**data)
    
    def test_missing_employee_id_raises_error(self):
        """Test that missing employee_id raises validation error."""
        data = {
            "date": date.today(),
            "status": AttendanceStatus.PRESENT
        }
        with pytest.raises(ValidationError):
            AttendanceBase(**data)
    
    def test_missing_date_raises_error(self):
        """Test that missing date raises validation error."""
        data = {
            "employee_id": "test-employee-uuid",
            "status": AttendanceStatus.PRESENT
        }
        with pytest.raises(ValidationError):
            AttendanceBase(**data)
    
    def test_missing_status_raises_error(self):
        """Test that missing status raises validation error."""
        data = {
            "employee_id": "test-employee-uuid",
            "date": date.today()
        }
        with pytest.raises(ValidationError):
            AttendanceBase(**data)


class TestAttendanceCreate:
    """Tests for AttendanceCreate schema."""
    
    def test_valid_attendance_create(self):
        """Test creating AttendanceCreate with valid data."""
        data = {
            "employee_id": "test-employee-uuid",
            "date": date.today(),
            "status": AttendanceStatus.PRESENT
        }
        attendance = AttendanceCreate(**data)
        assert attendance.employee_id == "test-employee-uuid"
        assert attendance.date == date.today()
        assert attendance.status == AttendanceStatus.PRESENT
    
    def test_inherits_validation_from_base(self):
        """Test that AttendanceCreate inherits validation from AttendanceBase."""
        data = {
            "employee_id": "test-employee-uuid",
            "date": date.today(),
            "status": "Invalid"
        }
        with pytest.raises(ValidationError):
            AttendanceCreate(**data)
    
    def test_date_string_parsing(self):
        """Test that date strings are properly parsed."""
        data = {
            "employee_id": "test-employee-uuid",
            "date": "2024-01-15",
            "status": AttendanceStatus.PRESENT
        }
        attendance = AttendanceCreate(**data)
        assert attendance.date == date(2024, 1, 15)


class TestAttendanceResponse:
    """Tests for AttendanceResponse schema."""
    
    def test_valid_attendance_response(self):
        """Test creating AttendanceResponse with valid data."""
        data = {
            "id": "test-attendance-uuid",
            "employee_id": "test-employee-uuid",
            "employee_name": "John Doe",
            "employee_employee_id": "EMP001",
            "date": date.today(),
            "status": AttendanceStatus.PRESENT,
            "created_at": datetime.now()
        }
        response = AttendanceResponse(**data)
        assert response.id == "test-attendance-uuid"
        assert response.employee_name == "John Doe"
        assert response.employee_employee_id == "EMP001"
    
    def test_response_with_absent_status(self):
        """Test AttendanceResponse with Absent status."""
        data = {
            "id": "test-attendance-uuid",
            "employee_id": "test-employee-uuid",
            "employee_name": "Jane Doe",
            "employee_employee_id": "EMP002",
            "date": date.today(),
            "status": AttendanceStatus.ABSENT,
            "created_at": datetime.now()
        }
        response = AttendanceResponse(**data)
        assert response.status == AttendanceStatus.ABSENT
    
    def test_missing_employee_name_raises_error(self):
        """Test that missing employee_name raises validation error."""
        data = {
            "id": "test-attendance-uuid",
            "employee_id": "test-employee-uuid",
            "employee_employee_id": "EMP001",
            "date": date.today(),
            "status": AttendanceStatus.PRESENT,
            "created_at": datetime.now()
        }
        with pytest.raises(ValidationError):
            AttendanceResponse(**data)


class TestAttendanceWithEmployeeName:
    """Tests for AttendanceWithEmployeeName schema."""
    
    def test_valid_attendance_with_employee_name(self):
        """Test creating AttendanceWithEmployeeName with valid data."""
        data = {
            "id": "test-attendance-uuid",
            "employee_id": "test-employee-uuid",
            "employee_name": "John Doe",
            "employee_employee_id": "EMP001",
            "date": date.today(),
            "status": AttendanceStatus.PRESENT,
            "created_at": datetime.now()
        }
        attendance = AttendanceWithEmployeeName(**data)
        assert attendance.id == "test-attendance-uuid"
        assert attendance.employee_name == "John Doe"
        assert attendance.employee_employee_id == "EMP001"
    
    def test_all_required_fields(self):
        """Test that all fields are required."""
        required_fields = [
            "id", "employee_id", "employee_name", 
            "employee_employee_id", "date", "status", "created_at"
        ]
        for field in required_fields:
            data = {
                "id": "test-attendance-uuid",
                "employee_id": "test-employee-uuid",
                "employee_name": "John Doe",
                "employee_employee_id": "EMP001",
                "date": date.today(),
                "status": AttendanceStatus.PRESENT,
                "created_at": datetime.now()
            }
            del data[field]
            with pytest.raises(ValidationError):
                AttendanceWithEmployeeName(**data)


class TestAttendanceStatusEnum:
    """Tests for AttendanceStatus enum."""
    
    def test_present_value(self):
        """Test PRESENT enum value."""
        assert AttendanceStatus.PRESENT.value == "Present"
    
    def test_absent_value(self):
        """Test ABSENT enum value."""
        assert AttendanceStatus.ABSENT.value == "Absent"
    
    def test_enum_is_string(self):
        """Test that enum values are strings."""
        assert isinstance(AttendanceStatus.PRESENT.value, str)
        assert isinstance(AttendanceStatus.ABSENT.value, str)
    
    def test_enum_membership(self):
        """Test enum membership."""
        assert AttendanceStatus("Present") == AttendanceStatus.PRESENT
        assert AttendanceStatus("Absent") == AttendanceStatus.ABSENT
    
    def test_invalid_enum_value(self):
        """Test that invalid enum value raises error."""
        with pytest.raises(ValueError):
            AttendanceStatus("Late")
