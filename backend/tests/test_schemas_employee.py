"""
Unit tests for Employee schemas.
Tests validation logic, field constraints, and edge cases.
"""
import pytest
from datetime import datetime
from pydantic import ValidationError

from app.schemas.employee import (
    EmployeeBase,
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse
)


class TestEmployeeBase:
    """Tests for EmployeeBase schema validation."""
    
    def test_valid_employee_base(self):
        """Test creating EmployeeBase with valid data."""
        data = {
            "employee_id": "EMP001",
            "full_name": "John Doe",
            "email": "john@example.com",
            "department": "Engineering"
        }
        employee = EmployeeBase(**data)
        assert employee.employee_id == "EMP001"
        assert employee.full_name == "John Doe"
        assert employee.email == "john@example.com"
        assert employee.department == "Engineering"
    
    def test_employee_id_uppercase_conversion(self):
        """Test that employee_id is converted to uppercase."""
        data = {
            "employee_id": "emp001",
            "full_name": "John Doe",
            "email": "john@example.com",
            "department": "Engineering"
        }
        employee = EmployeeBase(**data)
        assert employee.employee_id == "EMP001"
    
    def test_employee_id_whitespace_trimming(self):
        """Test that employee_id whitespace is trimmed."""
        data = {
            "employee_id": "  EMP001  ",
            "full_name": "John Doe",
            "email": "john@example.com",
            "department": "Engineering"
        }
        employee = EmployeeBase(**data)
        assert employee.employee_id == "EMP001"
    
    def test_full_name_whitespace_trimming(self):
        """Test that full_name whitespace is trimmed."""
        data = {
            "employee_id": "EMP001",
            "full_name": "  John Doe  ",
            "email": "john@example.com",
            "department": "Engineering"
        }
        employee = EmployeeBase(**data)
        assert employee.full_name == "John Doe"
    
    def test_department_whitespace_trimming(self):
        """Test that department whitespace is trimmed."""
        data = {
            "employee_id": "EMP001",
            "full_name": "John Doe",
            "email": "john@example.com",
            "department": "  Engineering  "
        }
        employee = EmployeeBase(**data)
        assert employee.department == "Engineering"
    
    def test_empty_employee_id_raises_error(self):
        """Test that empty employee_id raises validation error."""
        data = {
            "employee_id": "",
            "full_name": "John Doe",
            "email": "john@example.com",
            "department": "Engineering"
        }
        with pytest.raises(ValidationError) as exc_info:
            EmployeeBase(**data)
        assert "Employee ID cannot be empty" in str(exc_info.value)
    
    def test_whitespace_only_employee_id_raises_error(self):
        """Test that whitespace-only employee_id raises validation error."""
        data = {
            "employee_id": "   ",
            "full_name": "John Doe",
            "email": "john@example.com",
            "department": "Engineering"
        }
        with pytest.raises(ValidationError) as exc_info:
            EmployeeBase(**data)
        assert "Employee ID cannot be empty" in str(exc_info.value)
    
    def test_empty_full_name_raises_error(self):
        """Test that empty full_name raises validation error."""
        data = {
            "employee_id": "EMP001",
            "full_name": "",
            "email": "john@example.com",
            "department": "Engineering"
        }
        with pytest.raises(ValidationError) as exc_info:
            EmployeeBase(**data)
        assert "Full name cannot be empty" in str(exc_info.value)
    
    def test_empty_department_raises_error(self):
        """Test that empty department raises validation error."""
        data = {
            "employee_id": "EMP001",
            "full_name": "John Doe",
            "email": "john@example.com",
            "department": ""
        }
        with pytest.raises(ValidationError) as exc_info:
            EmployeeBase(**data)
        assert "Department cannot be empty" in str(exc_info.value)
    
    def test_invalid_email_raises_error(self):
        """Test that invalid email raises validation error."""
        data = {
            "employee_id": "EMP001",
            "full_name": "John Doe",
            "email": "invalid-email",
            "department": "Engineering"
        }
        with pytest.raises(ValidationError):
            EmployeeBase(**data)
    
    def test_employee_id_max_length(self):
        """Test employee_id max length constraint."""
        data = {
            "employee_id": "A" * 21,  # Max is 20
            "full_name": "John Doe",
            "email": "john@example.com",
            "department": "Engineering"
        }
        with pytest.raises(ValidationError):
            EmployeeBase(**data)
    
    def test_full_name_max_length(self):
        """Test full_name max length constraint."""
        data = {
            "employee_id": "EMP001",
            "full_name": "A" * 101,  # Max is 100
            "email": "john@example.com",
            "department": "Engineering"
        }
        with pytest.raises(ValidationError):
            EmployeeBase(**data)
    
    def test_department_max_length(self):
        """Test department max length constraint."""
        data = {
            "employee_id": "EMP001",
            "full_name": "John Doe",
            "email": "john@example.com",
            "department": "A" * 101  # Max is 100
        }
        with pytest.raises(ValidationError):
            EmployeeBase(**data)


class TestEmployeeCreate:
    """Tests for EmployeeCreate schema."""
    
    def test_valid_employee_create(self):
        """Test creating EmployeeCreate with valid data."""
        data = {
            "employee_id": "EMP001",
            "full_name": "John Doe",
            "email": "john@example.com",
            "department": "Engineering"
        }
        employee = EmployeeCreate(**data)
        assert employee.employee_id == "EMP001"
        assert employee.full_name == "John Doe"
        assert employee.email == "john@example.com"
        assert employee.department == "Engineering"
    
    def test_inherits_validation_from_base(self):
        """Test that EmployeeCreate inherits validation from EmployeeBase."""
        data = {
            "employee_id": "",
            "full_name": "John Doe",
            "email": "john@example.com",
            "department": "Engineering"
        }
        with pytest.raises(ValidationError):
            EmployeeCreate(**data)


class TestEmployeeUpdate:
    """Tests for EmployeeUpdate schema."""
    
    def test_valid_partial_update(self):
        """Test partial update with valid data."""
        data = {"full_name": "Jane Doe"}
        employee = EmployeeUpdate(**data)
        assert employee.full_name == "Jane Doe"
        assert employee.email is None
        assert employee.department is None
    
    def test_valid_full_update(self):
        """Test full update with valid data."""
        data = {
            "full_name": "Jane Doe",
            "email": "jane@example.com",
            "department": "Marketing"
        }
        employee = EmployeeUpdate(**data)
        assert employee.full_name == "Jane Doe"
        assert employee.email == "jane@example.com"
        assert employee.department == "Marketing"
    
    def test_empty_update(self):
        """Test update with no fields."""
        employee = EmployeeUpdate()
        assert employee.full_name is None
        assert employee.email is None
        assert employee.department is None
    
    def test_whitespace_full_name_raises_error(self):
        """Test that whitespace-only full_name raises error."""
        data = {"full_name": "   "}
        with pytest.raises(ValidationError) as exc_info:
            EmployeeUpdate(**data)
        assert "cannot be empty" in str(exc_info.value)
    
    def test_whitespace_department_raises_error(self):
        """Test that whitespace-only department raises error."""
        data = {"department": "   "}
        with pytest.raises(ValidationError) as exc_info:
            EmployeeUpdate(**data)
        assert "cannot be empty" in str(exc_info.value)
    
    def test_invalid_email_raises_error(self):
        """Test that invalid email raises validation error."""
        data = {"email": "invalid-email"}
        with pytest.raises(ValidationError):
            EmployeeUpdate(**data)


class TestEmployeeResponse:
    """Tests for EmployeeResponse schema."""
    
    def test_valid_employee_response(self):
        """Test creating EmployeeResponse with valid data."""
        data = {
            "id": "test-uuid-123",
            "employee_id": "EMP001",
            "full_name": "John Doe",
            "email": "john@example.com",
            "department": "Engineering",
            "is_active": True,
            "created_at": datetime.now(),
            "updated_at": None
        }
        employee = EmployeeResponse(**data)
        assert employee.id == "test-uuid-123"
        assert employee.employee_id == "EMP001"
        assert employee.is_active is True
    
    def test_from_attributes(self):
        """Test creating EmployeeResponse from ORM model."""
        # Create a mock ORM object
        class MockEmployee:
            id = "test-uuid-123"
            employee_id = "EMP001"
            full_name = "John Doe"
            email = "john@example.com"
            department = "Engineering"
            is_active = True
            created_at = datetime.now()
            updated_at = None
        
        mock_employee = MockEmployee()
        response = EmployeeResponse.model_validate(mock_employee)
        assert response.id == "test-uuid-123"
        assert response.employee_id == "EMP001"
