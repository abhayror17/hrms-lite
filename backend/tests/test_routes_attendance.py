"""
Integration tests for Attendance API endpoints.
Tests CRUD operations, filtering, and business logic.
"""
import pytest
from datetime import date, datetime, timedelta
from fastapi import status

from app.enums import AttendanceStatus


class TestAttendanceEndpoints:
    """Tests for attendance API endpoints."""
    
    # ==================== MARK ATTENDANCE TESTS ====================
    
    def test_mark_attendance_success(self, client, create_test_employee):
        """Test successful attendance marking."""
        employee = create_test_employee()
        attendance_data = {
            "employee_id": employee.id,
            "date": str(date.today()),
            "status": AttendanceStatus.PRESENT.value
        }
        
        response = client.post("/api/attendance/", json=attendance_data)
        assert response.status_code == status.HTTP_201_CREATED
        
        data = response.json()
        assert data["employee_id"] == employee.id
        assert data["employee_name"] == employee.full_name
        assert data["employee_employee_id"] == employee.employee_id
        assert data["status"] == AttendanceStatus.PRESENT.value
    
    def test_mark_attendance_absent(self, client, create_test_employee):
        """Test marking absent attendance."""
        employee = create_test_employee()
        attendance_data = {
            "employee_id": employee.id,
            "date": str(date.today()),
            "status": AttendanceStatus.ABSENT.value
        }
        
        response = client.post("/api/attendance/", json=attendance_data)
        assert response.status_code == status.HTTP_201_CREATED
        
        data = response.json()
        assert data["status"] == AttendanceStatus.ABSENT.value
    
    def test_mark_attendance_nonexistent_employee(self, client):
        """Test marking attendance for non-existent employee."""
        attendance_data = {
            "employee_id": "non-existent-id",
            "date": str(date.today()),
            "status": AttendanceStatus.PRESENT.value
        }
        
        response = client.post("/api/attendance/", json=attendance_data)
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_mark_attendance_duplicate_same_date(self, client, create_test_employee):
        """Test marking attendance twice for same employee on same date."""
        employee = create_test_employee()
        attendance_data = {
            "employee_id": employee.id,
            "date": str(date.today()),
            "status": AttendanceStatus.PRESENT.value
        }
        
        # First marking should succeed
        response1 = client.post("/api/attendance/", json=attendance_data)
        assert response1.status_code == status.HTTP_201_CREATED
        
        # Second marking should fail
        response2 = client.post("/api/attendance/", json=attendance_data)
        assert response2.status_code == status.HTTP_409_CONFLICT
        assert "already marked" in response2.json()["detail"]
    
    def test_mark_attendance_different_dates(self, client, create_test_employee):
        """Test marking attendance for same employee on different dates."""
        employee = create_test_employee()
        
        today_data = {
            "employee_id": employee.id,
            "date": str(date.today()),
            "status": AttendanceStatus.PRESENT.value
        }
        yesterday_data = {
            "employee_id": employee.id,
            "date": str(date.today() - timedelta(days=1)),
            "status": AttendanceStatus.PRESENT.value
        }
        
        response1 = client.post("/api/attendance/", json=today_data)
        response2 = client.post("/api/attendance/", json=yesterday_data)
        
        assert response1.status_code == status.HTTP_201_CREATED
        assert response2.status_code == status.HTTP_201_CREATED
    
    def test_mark_attendance_past_date(self, client, create_test_employee):
        """Test marking attendance for past date."""
        employee = create_test_employee()
        attendance_data = {
            "employee_id": employee.id,
            "date": str(date.today() - timedelta(days=30)),
            "status": AttendanceStatus.PRESENT.value
        }
        
        response = client.post("/api/attendance/", json=attendance_data)
        assert response.status_code == status.HTTP_201_CREATED
    
    def test_mark_attendance_invalid_status(self, client, create_test_employee):
        """Test marking attendance with invalid status."""
        employee = create_test_employee()
        attendance_data = {
            "employee_id": employee.id,
            "date": str(date.today()),
            "status": "Late"
        }
        
        response = client.post("/api/attendance/", json=attendance_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_mark_attendance_inactive_employee(self, client, create_test_employee):
        """Test marking attendance for inactive employee."""
        employee = create_test_employee(is_active=False)
        attendance_data = {
            "employee_id": employee.id,
            "date": str(date.today()),
            "status": AttendanceStatus.PRESENT.value
        }
        
        response = client.post("/api/attendance/", json=attendance_data)
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    # ==================== GET ATTENDANCE RECORDS TESTS ====================
    
    def test_get_all_attendance_records(self, client, sample_attendance_records):
        """Test getting all attendance records."""
        response = client.get("/api/attendance/")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert len(data) == 4
    
    def test_get_attendance_empty_list(self, client):
        """Test getting attendance when none exist."""
        response = client.get("/api/attendance/")
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []
    
    def test_get_attendance_filter_by_employee(self, client, multiple_employees, create_test_attendance):
        """Test filtering attendance by employee."""
        # Create attendance for multiple employees
        create_test_attendance(multiple_employees[0], date.today(), AttendanceStatus.PRESENT)
        create_test_attendance(multiple_employees[1], date.today(), AttendanceStatus.ABSENT)
        
        response = client.get(f"/api/attendance/?employee_id={multiple_employees[0].id}")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert len(data) == 1
        assert data[0]["employee_id"] == multiple_employees[0].id
    
    def test_get_attendance_filter_by_date_range(self, client, create_test_employee, create_test_attendance):
        """Test filtering attendance by date range."""
        employee = create_test_employee()
        
        # Create records for different dates
        create_test_attendance(employee, date.today(), AttendanceStatus.PRESENT)
        create_test_attendance(employee, date.today() - timedelta(days=10), AttendanceStatus.PRESENT)
        create_test_attendance(employee, date.today() - timedelta(days=20), AttendanceStatus.ABSENT)
        
        start_date = str(date.today() - timedelta(days=5))
        end_date = str(date.today())
        
        response = client.get(f"/api/attendance/?start_date={start_date}&end_date={end_date}")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert len(data) == 1  # Only today's record within range
    
    def test_get_attendance_filter_by_status(self, client, multiple_employees, create_test_attendance):
        """Test filtering attendance by status."""
        create_test_attendance(multiple_employees[0], date.today(), AttendanceStatus.PRESENT)
        create_test_attendance(multiple_employees[1], date.today(), AttendanceStatus.ABSENT)
        
        response = client.get("/api/attendance/?status=Present")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert len(data) == 1
        assert data[0]["status"] == "Present"
    
    def test_get_attendance_with_pagination(self, client, create_test_employee, create_test_attendance):
        """Test getting attendance with pagination."""
        employee = create_test_employee()
        
        # Create multiple records
        for i in range(5):
            create_test_attendance(
                employee, 
                date.today() - timedelta(days=i), 
                AttendanceStatus.PRESENT
            )
        
        response = client.get("/api/attendance/?skip=0&limit=2")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert len(data) == 2
    
    def test_get_attendance_ordered_by_date_desc(self, client, create_test_employee, create_test_attendance):
        """Test that attendance records are ordered by date descending."""
        employee = create_test_employee()
        
        dates = [
            date.today() - timedelta(days=5),
            date.today() - timedelta(days=2),
            date.today(),
        ]
        
        for d in dates:
            create_test_attendance(employee, d, AttendanceStatus.PRESENT)
        
        response = client.get("/api/attendance/")
        data = response.json()
        
        # Should be ordered by date descending
        assert data[0]["date"] == str(date.today())
        assert data[2]["date"] == str(date.today() - timedelta(days=5))
    
    # ==================== GET EMPLOYEE ATTENDANCE TESTS ====================
    
    def test_get_employee_attendance(self, client, create_test_employee, create_test_attendance):
        """Test getting attendance for specific employee."""
        employee = create_test_employee()
        create_test_attendance(employee, date.today(), AttendanceStatus.PRESENT)
        create_test_attendance(employee, date.today() - timedelta(days=1), AttendanceStatus.ABSENT)
        
        response = client.get(f"/api/attendance/employee/{employee.id}")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert len(data) == 2
    
    def test_get_employee_attendance_not_found(self, client):
        """Test getting attendance for non-existent employee."""
        response = client.get("/api/attendance/employee/non-existent-id")
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_get_employee_attendance_with_date_filter(self, client, create_test_employee, create_test_attendance):
        """Test getting employee attendance with date filter."""
        employee = create_test_employee()
        
        create_test_attendance(employee, date.today(), AttendanceStatus.PRESENT)
        create_test_attendance(employee, date.today() - timedelta(days=30), AttendanceStatus.ABSENT)
        
        start_date = str(date.today() - timedelta(days=5))
        response = client.get(
            f"/api/attendance/employee/{employee.id}?start_date={start_date}"
        )
        
        data = response.json()
        assert len(data) == 1  # Only today's record
    
    # ==================== UPDATE ATTENDANCE TESTS ====================
    
    def test_update_attendance_status(self, client, create_test_employee, create_test_attendance):
        """Test updating attendance status."""
        employee = create_test_employee()
        attendance = create_test_attendance(employee, date.today(), AttendanceStatus.PRESENT)
        
        response = client.put(f"/api/attendance/{attendance.id}?status=Absent")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert data["status"] == "Absent"
    
    def test_update_attendance_not_found(self, client):
        """Test updating non-existent attendance record."""
        response = client.put("/api/attendance/non-existent-id?status=Present")
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    # ==================== DELETE ATTENDANCE TESTS ====================
    
    def test_delete_attendance_success(self, client, create_test_employee, create_test_attendance):
        """Test successful attendance deletion."""
        employee = create_test_employee()
        attendance = create_test_attendance(employee, date.today(), AttendanceStatus.PRESENT)
        
        response = client.delete(f"/api/attendance/{attendance.id}")
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify deletion - should return empty list
        response = client.get("/api/attendance/")
        data = response.json()
        assert len(data) == 0
    
    def test_delete_attendance_not_found(self, client):
        """Test deleting non-existent attendance record."""
        response = client.delete("/api/attendance/non-existent-id")
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    # ==================== TODAY'S ATTENDANCE TESTS ====================
    
    def test_get_today_attendance(self, client, multiple_employees, create_test_attendance):
        """Test getting today's attendance status for all employees."""
        # Create today's attendance for some employees
        create_test_attendance(multiple_employees[0], date.today(), AttendanceStatus.PRESENT)
        create_test_attendance(multiple_employees[1], date.today(), AttendanceStatus.ABSENT)
        # Third employee has no attendance
        
        response = client.get("/api/attendance/today")
        assert response.status_code == status.HTTP_200_OK
        
        data = response.json()
        assert len(data) == 3  # All employees
        
        statuses = [record["status"] for record in data]
        assert "Present" in statuses
        assert "Absent" in statuses
        assert "Not Marked" in statuses
    
    def test_get_today_attendance_includes_employee_info(self, client, create_test_employee, create_test_attendance):
        """Test that today's attendance includes employee details."""
        employee = create_test_employee()
        create_test_attendance(employee, date.today(), AttendanceStatus.PRESENT)
        
        response = client.get("/api/attendance/today")
        data = response.json()
        
        record = data[0]
        assert record["employee_id"] == employee.id
        assert record["employee_code"] == employee.employee_id
        assert record["full_name"] == employee.full_name
        assert record["department"] == employee.department
        assert record["date"] == str(date.today())
    
    def test_get_today_attendance_excludes_past_records(self, client, create_test_employee, create_test_attendance):
        """Test that today's attendance only shows today's records."""
        employee = create_test_employee()
        
        # Create records for today and yesterday
        create_test_attendance(employee, date.today(), AttendanceStatus.PRESENT)
        create_test_attendance(employee, date.today() - timedelta(days=1), AttendanceStatus.ABSENT)
        
        response = client.get("/api/attendance/today")
        data = response.json()
        
        # Should only have today's status
        record = next((r for r in data if r["employee_id"] == employee.id), None)
        assert record["status"] == "Present"


class TestAttendanceEdgeCases:
    """Tests for edge cases and boundary conditions."""
    
    def test_attendance_with_date_string(self, client, create_test_employee):
        """Test marking attendance with date string format."""
        employee = create_test_employee()
        attendance_data = {
            "employee_id": employee.id,
            "date": "2024-01-15",
            "status": AttendanceStatus.PRESENT.value
        }
        
        response = client.post("/api/attendance/", json=attendance_data)
        assert response.status_code == status.HTTP_201_CREATED
        
        data = response.json()
        assert data["date"] == "2024-01-15"
    
    def test_attendance_combined_filters(self, client, multiple_employees, create_test_attendance):
        """Test attendance with multiple filters combined."""
        today = date.today()
        yesterday = today - timedelta(days=1)
        
        create_test_attendance(multiple_employees[0], today, AttendanceStatus.PRESENT)
        create_test_attendance(multiple_employees[0], yesterday, AttendanceStatus.ABSENT)
        create_test_attendance(multiple_employees[1], today, AttendanceStatus.PRESENT)
        
        # Filter by employee AND status AND date range
        response = client.get(
            f"/api/attendance/?"
            f"employee_id={multiple_employees[0].id}&"
            f"status=Present&"
            f"start_date={str(today)}&"
            f"end_date={str(today)}"
        )
        
        data = response.json()
        assert len(data) == 1
        assert data[0]["employee_id"] == multiple_employees[0].id
        assert data[0]["status"] == "Present"
    
    def test_attendance_response_includes_employee_details(self, client, create_test_employee, create_test_attendance):
        """Test that attendance response includes employee name and code."""
        employee = create_test_employee()
        attendance = create_test_attendance(employee, date.today(), AttendanceStatus.PRESENT)
        
        response = client.get("/api/attendance/")
        data = response.json()
        
        record = data[0]
        assert "employee_name" in record
        assert "employee_employee_id" in record
        assert record["employee_name"] == employee.full_name
        assert record["employee_employee_id"] == employee.employee_id
