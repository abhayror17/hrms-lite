"""
Integration tests for Employee API endpoints.
Tests CRUD operations, filtering, and business logic.
"""
import pytest
from datetime import date, datetime, timedelta
from fastapi import status

from app.enums import AttendanceStatus


class TestEmployeeEndpoints:
    """Tests for employee API endpoints."""
    
    # ==================== CREATE EMPLOYEE TESTS ====================
    
    def test_create_employee_success(self, client, sample_employee_data):
        """Test successful employee creation."""
        response = client.post("/api/employees/", json=sample_employee_data)
        assert response.status_code == status.HTTP_201_CREATED
        
        data = response.json()
        assert data["employee_id"] == sample_employee_data["employee_id"]
        assert data["full_name"] == sample_employee_data["full_name"]
        assert data["email"] == sample_employee_data["email"].lower()
        assert data["department"] == sample_employee_data["department"]
        assert data["is_active"] is True
        assert "id" in data
        assert "created_at" in data
    
    def test_create_employee_duplicate_id(self, client, sample_employee_data):
        """Test creating employee with duplicate employee_id."""
        # Create first employee
        client.post("/api/employees/", json=sample_employee_data)
        
        # Try to create second with same employee_id
        new_employee = sample_employee_data.copy()
        new_employee["email"] = "different@example.com"
        response = client.post("/api/employees/", json=new_employee)
        
        assert response.status_code == status.HTTP_409_CONFLICT
        assert "already exists" in response.json()["detail"]
    
    def test_create_employee_duplicate_email(self, client, sample_employee_data):
        """Test creating employee with duplicate email."""
        # Create first employee
        client.post("/api/employees/", json=sample_employee_data)
        
        # Try to create second with same email
        new_employee = sample_employee_data.copy()
        new_employee["employee_id"] = "EMP002"
        response = client.post("/api/employees/", json=new_employee)
        
        assert response.status_code == status.HTTP_409_CONFLICT
        assert "already exists" in response.json()["detail"]
    
    def test_create_employee_email_case_insensitive(self, client, sample_employee_data):
        """Test that duplicate email check is case insensitive."""
        # Create first employee
        client.post("/api/employees/", json=sample_employee_data)
        
        # Try to create with uppercase email
        new_employee = sample_employee_data.copy()
        new_employee["employee_id"] = "EMP002"
        new_employee["email"] = sample_employee_data["email"].upper()
        response = client.post("/api/employees/", json=new_employee)
        
        assert response.status_code == status.HTTP_409_CONFLICT
    
    def test_create_employee_invalid_email(self, client, sample_employee_data):
        """Test creating employee with invalid email."""
        invalid_data = sample_employee_data.copy()
        invalid_data["email"] = "invalid-email"
        response = client.post("/api/employees/", json=invalid_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_create_employee_missing_fields(self, client):
        """Test creating employee with missing required fields."""
        incomplete_data = {"employee_id": "EMP001"}
        response = client.post("/api/employees/", json=incomplete_data)
        
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    # ==================== GET EMPLOYEES TESTS ====================
    
    def test_get_all_employees(self, client, multiple_employees):
        """Test getting all employees."""
        response = client.get("/api/employees/")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert len(data) == 3
    
    def test_get_employees_empty_list(self, client):
        """Test getting employees when none exist."""
        response = client.get("/api/employees/")
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []
    
    def test_get_employees_with_pagination(self, client, multiple_employees):
        """Test getting employees with pagination."""
        response = client.get("/api/employees/?skip=0&limit=2")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert len(data) == 2
    
    def test_get_employees_filter_by_department(self, client, multiple_employees):
        """Test filtering employees by department."""
        response = client.get("/api/employees/?department=Engineering")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert len(data) == 2
        for emp in data:
            assert "Engineering" in emp["department"]
    
    def test_get_employees_search_by_name(self, client, multiple_employees):
        """Test searching employees by name."""
        response = client.get("/api/employees/?search=Alice")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert len(data) == 1
        assert "Alice" in data[0]["full_name"]
    
    def test_get_employees_search_by_employee_id(self, client, multiple_employees):
        """Test searching employees by employee_id."""
        response = client.get("/api/employees/?search=EMP001")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert len(data) == 1
        assert data[0]["employee_id"] == "EMP001"
    
    def test_get_employees_search_by_email(self, client, multiple_employees):
        """Test searching employees by email."""
        response = client.get("/api/employees/?search=bob@example.com")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert len(data) == 1
        assert data[0]["email"] == "bob@example.com"
    
    # ==================== GET SINGLE EMPLOYEE TESTS ====================
    
    def test_get_employee_by_id(self, client, create_test_employee):
        """Test getting a single employee by ID."""
        employee = create_test_employee()
        response = client.get(f"/api/employees/{employee.id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == employee.id
        assert data["employee_id"] == employee.employee_id
    
    def test_get_employee_not_found(self, client):
        """Test getting a non-existent employee."""
        response = client.get("/api/employees/non-existent-id")
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "not found" in response.json()["detail"]
    
    # ==================== UPDATE EMPLOYEE TESTS ====================
    
    def test_update_employee_full_name(self, client, create_test_employee):
        """Test updating employee full name."""
        employee = create_test_employee()
        update_data = {"full_name": "Updated Name"}
        
        response = client.put(f"/api/employees/{employee.id}", json=update_data)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data["full_name"] == "Updated Name"
    
    def test_update_employee_email(self, client, create_test_employee):
        """Test updating employee email."""
        employee = create_test_employee()
        update_data = {"email": "newemail@example.com"}
        
        response = client.put(f"/api/employees/{employee.id}", json=update_data)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data["email"] == "newemail@example.com"
    
    def test_update_employee_department(self, client, create_test_employee):
        """Test updating employee department."""
        employee = create_test_employee()
        update_data = {"department": "Sales"}
        
        response = client.put(f"/api/employees/{employee.id}", json=update_data)
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data["department"] == "Sales"
    
    def test_update_employee_duplicate_email(self, client, create_test_employee):
        """Test updating employee with duplicate email."""
        employee1 = create_test_employee(employee_id="EMP001", email="emp1@example.com")
        employee2 = create_test_employee(employee_id="EMP002", email="emp2@example.com")
        
        update_data = {"email": "emp2@example.com"}
        response = client.put(f"/api/employees/{employee1.id}", json=update_data)
        
        assert response.status_code == status.HTTP_409_CONFLICT
    
    def test_update_employee_not_found(self, client):
        """Test updating a non-existent employee."""
        update_data = {"full_name": "New Name"}
        response = client.put("/api/employees/non-existent-id", json=update_data)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    # ==================== DELETE EMPLOYEE TESTS ====================
    
    def test_delete_employee_success(self, client, create_test_employee):
        """Test successful employee deletion."""
        employee = create_test_employee()
        response = client.delete(f"/api/employees/{employee.id}")
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify employee is deleted
        response = client.get(f"/api/employees/{employee.id}")
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_delete_employee_not_found(self, client):
        """Test deleting a non-existent employee."""
        response = client.delete("/api/employees/non-existent-id")
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    # ==================== EMPLOYEE SUMMARY TESTS ====================
    
    def test_get_employee_summary(self, client, create_test_employee, create_test_attendance):
        """Test getting employee attendance summary."""
        employee = create_test_employee()
        
        # Create some attendance records
        create_test_attendance(employee, date.today(), AttendanceStatus.PRESENT)
        create_test_attendance(employee, date.today() - timedelta(days=1), AttendanceStatus.ABSENT)
        
        response = client.get(f"/api/employees/{employee.id}/summary")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data["employee_id"] == employee.id
        assert data["total_present"] == 1
        assert data["total_absent"] == 1
        assert data["attendance_rate"] == 50.0
    
    def test_get_employee_summary_no_attendance(self, client, create_test_employee):
        """Test getting employee summary with no attendance."""
        employee = create_test_employee()
        
        response = client.get(f"/api/employees/{employee.id}/summary")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data["total_present"] == 0
        assert data["total_absent"] == 0
        assert data["attendance_rate"] == 0
    
    def test_get_employee_summary_not_found(self, client):
        """Test getting summary for non-existent employee."""
        response = client.get("/api/employees/non-existent-id/summary")
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestDashboardStats:
    """Tests for dashboard stats endpoint."""
    
    def test_get_dashboard_stats_empty(self, client):
        """Test dashboard stats with no data."""
        response = client.get("/api/employees/dashboard/stats")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data["total_employees"] == 0
        assert data["departments"] == []
        assert data["today_attendance"]["present"] == 0
        assert data["today_attendance"]["absent"] == 0
        assert data["overall_attendance_rate"] == 0
    
    def test_get_dashboard_stats_with_data(self, client, multiple_employees, create_test_attendance):
        """Test dashboard stats with employees and attendance."""
        # Create attendance for today
        create_test_attendance(multiple_employees[0], date.today(), AttendanceStatus.PRESENT)
        create_test_attendance(multiple_employees[1], date.today(), AttendanceStatus.ABSENT)
        
        response = client.get("/api/employees/dashboard/stats")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data["total_employees"] == 3
        assert len(data["departments"]) == 2  # Engineering and Marketing
        assert data["today_attendance"]["present"] == 1
        assert data["today_attendance"]["absent"] == 1
        assert data["today_attendance"]["not_marked"] == 1
    
    def test_dashboard_recent_employees(self, client, multiple_employees):
        """Test that recent employees are returned in dashboard stats."""
        response = client.get("/api/employees/dashboard/stats")
        
        data = response.json()
        assert len(data["recent_employees"]) <= 5
        
        # Should be ordered by created_at desc
        recent = data["recent_employees"]
        if len(recent) > 1:
            # Last created should be first in list
            assert recent[0]["employee_id"] == "EMP003"


class TestHealthAndRootEndpoints:
    """Tests for health check and root endpoints."""
    
    def test_root_endpoint(self, client):
        """Test root endpoint returns welcome message."""
        response = client.get("/")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert "message" in data
        assert "docs" in data
        assert "version" in data
    
    def test_health_check(self, client):
        """Test health check endpoint."""
        response = client.get("/api/health")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "hrms-lite-api"
