# HRMS Lite API Reference

Complete API documentation for the HRMS Lite backend. This document provides detailed information about all available endpoints, request/response formats, and error handling.

---

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Common Headers](#common-headers)
- [Error Handling](#error-handling)
- [Employees API](#employees-api)
- [Attendance API](#attendance-api)
- [Health Check](#health-check)
- [Data Types](#data-types)
- [Error Codes Reference](#error-codes-reference)

---

## Overview

The HRMS Lite API is a RESTful API built with FastAPI that provides endpoints for managing employees and attendance records. All endpoints return JSON responses and follow standard HTTP status codes.

### Interactive Documentation

When running the backend locally, interactive API documentation is available at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Authentication

The current version of HRMS Lite does not implement authentication. All endpoints are publicly accessible. This is designed for trusted internal network deployments.

> **Note**: For production deployments requiring security, implement authentication middleware before exposing the API.

---

## Base URL

| Environment | Base URL |
|-------------|----------|
| Development | `http://localhost:8000` |
| Production | `https://your-backend.onrender.com` |

---

## Common Headers

### Request Headers

| Header | Value | Required |
|--------|-------|----------|
| `Content-Type` | `application/json` | Yes (for POST/PUT) |
| `Accept` | `application/json` | Recommended |

### Response Headers

| Header | Value |
|--------|-------|
| `Content-Type` | `application/json` |
| `Access-Control-Allow-Origin` | Configured CORS origins |

---

## Error Handling

All errors follow a consistent format:

```json
{
  "detail": "Error message describing the issue"
}
```

### HTTP Status Codes

| Status Code | Meaning | When Used |
|-------------|---------|-----------|
| `200 OK` | Success | GET, PUT operations |
| `201 Created` | Resource created | POST operations |
| `204 No Content` | Success (no body) | DELETE operations |
| `400 Bad Request` | Invalid request | Malformed JSON |
| `404 Not Found` | Resource not found | Invalid ID references |
| `409 Conflict` | Conflict | Duplicate entries |
| `422 Unprocessable Entity` | Validation error | Invalid input data |
| `500 Internal Server Error` | Server error | Unexpected errors |

---

## Employees API

### Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/employees/` | Create a new employee |
| `GET` | `/api/employees/` | List all employees |
| `GET` | `/api/employees/{id}` | Get employee by ID |
| `PUT` | `/api/employees/{id}` | Update employee |
| `DELETE` | `/api/employees/{id}` | Delete employee |
| `GET` | `/api/employees/{id}/summary` | Get attendance summary |
| `GET` | `/api/employees/dashboard/stats` | Get dashboard statistics |

---

### Create Employee

Create a new employee record.

**Endpoint**: `POST /api/employees/`

#### Request

```http
POST /api/employees/ HTTP/1.1
Content-Type: application/json

{
  "employee_id": "EMP001",
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "department": "Engineering"
}
```

#### Request Body Schema

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `employee_id` | string | Yes | 1-20 chars, unique | Business identifier |
| `full_name` | string | Yes | 1-100 chars | Employee's full name |
| `email` | string | Yes | Valid email, unique | Email address |
| `department` | string | Yes | 1-100 chars | Department name |

#### Response (201 Created)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "employee_id": "EMP001",
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "department": "Engineering",
  "is_active": true,
  "created_at": "2026-02-28T10:30:00Z",
  "updated_at": null
}
```

#### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | System-generated unique identifier |
| `employee_id` | string | Business identifier (uppercase) |
| `full_name` | string | Employee's full name |
| `email` | string | Email address (lowercase) |
| `department` | string | Department name |
| `is_active` | boolean | Active status (default: true) |
| `created_at` | datetime | Creation timestamp (ISO 8601) |
| `updated_at` | datetime \| null | Last update timestamp |

#### Error Responses

**409 Conflict - Duplicate Employee ID**:
```json
{
  "detail": "Employee with ID 'EMP001' already exists"
}
```

**409 Conflict - Duplicate Email**:
```json
{
  "detail": "Employee with email 'john.doe@example.com' already exists"
}
```

**422 Unprocessable Entity - Validation Error**:
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

#### Example

```bash
curl -X POST http://localhost:8000/api/employees/ \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "EMP001",
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "department": "Engineering"
  }'
```

---

### List Employees

Retrieve all employees with optional filtering and pagination.

**Endpoint**: `GET /api/employees/`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `skip` | integer | No | 0 | Number of records to skip |
| `limit` | integer | No | 100 | Maximum records to return |
| `department` | string | No | - | Filter by department (partial match) |
| `search` | string | No | - | Search in name, ID, or email |

#### Request

```http
GET /api/employees/?search=john&department=Engineering&skip=0&limit=50 HTTP/1.1
```

#### Response (200 OK)

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "employee_id": "EMP001",
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "department": "Engineering",
    "is_active": true,
    "created_at": "2026-02-28T10:30:00Z",
    "updated_at": null
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "employee_id": "EMP002",
    "full_name": "John Smith",
    "email": "john.smith@example.com",
    "department": "Engineering",
    "is_active": true,
    "created_at": "2026-02-28T11:00:00Z",
    "updated_at": null
  }
]
```

#### Example

```bash
# Get all employees
curl http://localhost:8000/api/employees/

# Search employees
curl "http://localhost:8000/api/employees/?search=john"

# Filter by department
curl "http://localhost:8000/api/employees/?department=Engineering"

# Pagination
curl "http://localhost:8000/api/employees/?skip=10&limit=20"
```

---

### Get Employee by ID

Retrieve a specific employee by their UUID.

**Endpoint**: `GET /api/employees/{id}`

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Employee's unique identifier |

#### Request

```http
GET /api/employees/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
```

#### Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "employee_id": "EMP001",
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "department": "Engineering",
  "is_active": true,
  "created_at": "2026-02-28T10:30:00Z",
  "updated_at": null
}
```

#### Error Response (404 Not Found)

```json
{
  "detail": "Employee with ID '550e8400-e29b-41d4-a716-446655440000' not found"
}
```

#### Example

```bash
curl http://localhost:8000/api/employees/550e8400-e29b-41d4-a716-446655440000
```

---

### Update Employee

Update an existing employee's information.

**Endpoint**: `PUT /api/employees/{id}`

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Employee's unique identifier |

#### Request

```http
PUT /api/employees/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Content-Type: application/json

{
  "full_name": "John Updated",
  "email": "john.updated@example.com",
  "department": "Marketing"
}
```

#### Request Body Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `full_name` | string | No | Updated full name |
| `email` | string | No | Updated email (must be unique) |
| `department` | string | No | Updated department |

> **Note**: `employee_id` cannot be updated after creation.

#### Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "employee_id": "EMP001",
  "full_name": "John Updated",
  "email": "john.updated@example.com",
  "department": "Marketing",
  "is_active": true,
  "created_at": "2026-02-28T10:30:00Z",
  "updated_at": "2026-02-28T14:00:00Z"
}
```

#### Error Responses

**404 Not Found**:
```json
{
  "detail": "Employee with ID '550e8400-e29b-41d4-a716-446655440000' not found"
}
```

**409 Conflict - Duplicate Email**:
```json
{
  "detail": "Employee with email 'john.updated@example.com' already exists"
}
```

#### Example

```bash
curl -X PUT http://localhost:8000/api/employees/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Updated",
    "department": "Marketing"
  }'
```

---

### Delete Employee

Delete an employee and all associated attendance records.

**Endpoint**: `DELETE /api/employees/{id}`

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Employee's unique identifier |

#### Request

```http
DELETE /api/employees/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
```

#### Response (204 No Content)

No response body.

#### Error Response (404 Not Found)

```json
{
  "detail": "Employee with ID '550e8400-e29b-41d4-a716-446655440000' not found"
}
```

#### Example

```bash
curl -X DELETE http://localhost:8000/api/employees/550e8400-e29b-41d4-a716-446655440000
```

---

### Get Employee Attendance Summary

Retrieve attendance statistics for a specific employee.

**Endpoint**: `GET /api/employees/{id}/summary`

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Employee's unique identifier |

#### Request

```http
GET /api/employees/550e8400-e29b-41d4-a716-446655440000/summary HTTP/1.1
```

#### Response (200 OK)

```json
{
  "employee_id": "550e8400-e29b-41d4-a716-446655440000",
  "employee_code": "EMP001",
  "full_name": "John Doe",
  "department": "Engineering",
  "total_present": 22,
  "total_absent": 3,
  "attendance_rate": 88.0
}
```

#### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `employee_id` | string (UUID) | Employee's UUID |
| `employee_code` | string | Business identifier |
| `full_name` | string | Employee's name |
| `department` | string | Department name |
| `total_present` | integer | Number of days present |
| `total_absent` | integer | Number of days absent |
| `attendance_rate` | float | Attendance percentage |

#### Example

```bash
curl http://localhost:8000/api/employees/550e8400-e29b-41d4-a716-446655440000/summary
```

---

### Get Dashboard Statistics

Retrieve aggregated statistics for the dashboard.

**Endpoint**: `GET /api/employees/dashboard/stats`

#### Request

```http
GET /api/employees/dashboard/stats HTTP/1.1
```

#### Response (200 OK)

```json
{
  "total_employees": 50,
  "departments": [
    {"name": "Engineering", "count": 20},
    {"name": "Marketing", "count": 15},
    {"name": "Sales", "count": 10},
    {"name": "HR", "count": 5}
  ],
  "today_attendance": {
    "present": 40,
    "absent": 5,
    "not_marked": 5
  },
  "overall_attendance_rate": 85.5,
  "recent_employees": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "employee_id": "EMP050",
      "full_name": "New Employee",
      "department": "Engineering",
      "created_at": "2026-02-28T10:00:00Z"
    }
  ]
}
```

#### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `total_employees` | integer | Count of active employees |
| `departments` | array | Department breakdown |
| `departments[].name` | string | Department name |
| `departments[].count` | integer | Employee count |
| `today_attendance` | object | Today's attendance summary |
| `today_attendance.present` | integer | Present today |
| `today_attendance.absent` | integer | Absent today |
| `today_attendance.not_marked` | integer | Attendance not marked |
| `overall_attendance_rate` | float | Overall attendance percentage |
| `recent_employees` | array | 5 most recent employees |

#### Example

```bash
curl http://localhost:8000/api/employees/dashboard/stats
```

---

## Attendance API

### Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/attendance/` | Mark attendance |
| `GET` | `/api/attendance/` | List attendance records |
| `GET` | `/api/attendance/today` | Get today's attendance |
| `GET` | `/api/attendance/employee/{id}` | Get employee attendance |
| `PUT` | `/api/attendance/{id}` | Update attendance status |
| `DELETE` | `/api/attendance/{id}` | Delete attendance record |

---

### Mark Attendance

Record attendance for an employee on a specific date.

**Endpoint**: `POST /api/attendance/`

#### Request

```http
POST /api/attendance/ HTTP/1.1
Content-Type: application/json

{
  "employee_id": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2026-02-28",
  "status": "Present"
}
```

#### Request Body Schema

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `employee_id` | string (UUID) | Yes | Valid employee UUID | Employee reference |
| `date` | string (date) | Yes | ≤ today | Attendance date (YYYY-MM-DD) |
| `status` | string | Yes | "Present" or "Absent" | Attendance status |

#### Response (201 Created)

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "employee_id": "550e8400-e29b-41d4-a716-446655440000",
  "employee_name": "John Doe",
  "employee_employee_id": "EMP001",
  "date": "2026-02-28",
  "status": "Present",
  "created_at": "2026-02-28T10:30:00Z"
}
```

#### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Attendance record ID |
| `employee_id` | string (UUID) | Employee's UUID |
| `employee_name` | string | Employee's full name |
| `employee_employee_id` | string | Employee's business ID |
| `date` | string (date) | Attendance date |
| `status` | string | "Present" or "Absent" |
| `created_at` | datetime | Record creation timestamp |

#### Error Responses

**404 Not Found - Employee Not Found**:
```json
{
  "detail": "Employee with ID '550e8400-e29b-41d4-a716-446655440000' not found"
}
```

**409 Conflict - Duplicate Attendance**:
```json
{
  "detail": "Attendance already marked for employee 'EMP001' on 2026-02-28"
}
```

**422 Unprocessable Entity - Future Date**:
```json
{
  "detail": [
    {
      "loc": ["body", "date"],
      "msg": "Attendance date cannot be in the future",
      "type": "value_error.date"
    }
  ]
}
```

#### Example

```bash
curl -X POST http://localhost:8000/api/attendance/ \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2026-02-28",
    "status": "Present"
  }'
```

---

### List Attendance Records

Retrieve attendance records with optional filtering.

**Endpoint**: `GET /api/attendance/`

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `employee_id` | string (UUID) | No | - | Filter by employee |
| `start_date` | string (date) | No | - | Start of date range |
| `end_date` | string (date) | No | - | End of date range |
| `status` | string | No | - | Filter by status |
| `skip` | integer | No | 0 | Records to skip |
| `limit` | integer | No | 100 | Max records to return |

#### Request

```http
GET /api/attendance/?employee_id=550e8400-e29b-41d4-a716-446655440000&start_date=2026-02-01&end_date=2026-02-28&status=Present HTTP/1.1
```

#### Response (200 OK)

```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "employee_id": "550e8400-e29b-41d4-a716-446655440000",
    "employee_name": "John Doe",
    "employee_employee_id": "EMP001",
    "date": "2026-02-28",
    "status": "Present",
    "created_at": "2026-02-28T10:30:00Z"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440002",
    "employee_id": "550e8400-e29b-41d4-a716-446655440000",
    "employee_name": "John Doe",
    "employee_employee_id": "EMP001",
    "date": "2026-02-27",
    "status": "Present",
    "created_at": "2026-02-27T10:30:00Z"
  }
]
```

#### Example

```bash
# Get all attendance records
curl http://localhost:8000/api/attendance/

# Filter by employee
curl "http://localhost:8000/api/attendance/?employee_id=550e8400-e29b-41d4-a716-446655440000"

# Filter by date range
curl "http://localhost:8000/api/attendance/?start_date=2026-02-01&end_date=2026-02-28"

# Filter by status
curl "http://localhost:8000/api/attendance/?status=Present"
```

---

### Get Today's Attendance

Retrieve today's attendance status for all employees.

**Endpoint**: `GET /api/attendance/today`

#### Request

```http
GET /api/attendance/today HTTP/1.1
```

#### Response (200 OK)

```json
[
  {
    "employee_id": "550e8400-e29b-41d4-a716-446655440000",
    "employee_code": "EMP001",
    "full_name": "John Doe",
    "department": "Engineering",
    "date": "2026-02-28",
    "status": "Present"
  },
  {
    "employee_id": "550e8400-e29b-41d4-a716-446655440001",
    "employee_code": "EMP002",
    "full_name": "Jane Smith",
    "department": "Marketing",
    "date": "2026-02-28",
    "status": "Absent"
  },
  {
    "employee_id": "550e8400-e29b-41d4-a716-446655440002",
    "employee_code": "EMP003",
    "full_name": "Bob Wilson",
    "department": "Sales",
    "date": "2026-02-28",
    "status": "Not Marked"
  }
]
```

#### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `employee_id` | string (UUID) | Employee's UUID |
| `employee_code` | string | Business identifier |
| `full_name` | string | Employee's name |
| `department` | string | Department name |
| `date` | string (date) | Today's date |
| `status` | string | "Present", "Absent", or "Not Marked" |

#### Example

```bash
curl http://localhost:8000/api/attendance/today
```

---

### Get Employee Attendance

Retrieve all attendance records for a specific employee.

**Endpoint**: `GET /api/attendance/employee/{id}`

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Employee's unique identifier |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start_date` | string (date) | No | Start of date range |
| `end_date` | string (date) | No | End of date range |

#### Request

```http
GET /api/attendance/employee/550e8400-e29b-41d4-a716-446655440000?start_date=2026-02-01 HTTP/1.1
```

#### Response (200 OK)

```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "employee_id": "550e8400-e29b-41d4-a716-446655440000",
    "employee_name": "John Doe",
    "employee_employee_id": "EMP001",
    "date": "2026-02-28",
    "status": "Present",
    "created_at": "2026-02-28T10:30:00Z"
  }
]
```

#### Error Response (404 Not Found)

```json
{
  "detail": "Employee with ID '550e8400-e29b-41d4-a716-446655440000' not found"
}
```

#### Example

```bash
curl http://localhost:8000/api/attendance/employee/550e8400-e29b-41d4-a716-446655440000
```

---

### Update Attendance Status

Update the status of an existing attendance record.

**Endpoint**: `PUT /api/attendance/{id}`

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Attendance record ID |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | Yes | New status ("Present" or "Absent") |

#### Request

```http
PUT /api/attendance/660e8400-e29b-41d4-a716-446655440001?status=Absent HTTP/1.1
```

#### Response (200 OK)

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "employee_id": "550e8400-e29b-41d4-a716-446655440000",
  "employee_name": "John Doe",
  "employee_employee_id": "EMP001",
  "date": "2026-02-28",
  "status": "Absent",
  "created_at": "2026-02-28T10:30:00Z"
}
```

#### Error Response (404 Not Found)

```json
{
  "detail": "Attendance record with ID '660e8400-e29b-41d4-a716-446655440001' not found"
}
```

#### Example

```bash
curl -X PUT "http://localhost:8000/api/attendance/660e8400-e29b-41d4-a716-446655440001?status=Absent"
```

---

### Delete Attendance Record

Delete an attendance record.

**Endpoint**: `DELETE /api/attendance/{id}`

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string (UUID) | Attendance record ID |

#### Request

```http
DELETE /api/attendance/660e8400-e29b-41d4-a716-446655440001 HTTP/1.1
```

#### Response (204 No Content)

No response body.

#### Error Response (404 Not Found)

```json
{
  "detail": "Attendance record with ID '660e8400-e29b-41d4-a716-446655440001' not found"
}
```

#### Example

```bash
curl -X DELETE http://localhost:8000/api/attendance/660e8400-e29b-41d4-a716-446655440001
```

---

## Health Check

### Root Endpoint

Get API information and available endpoints.

**Endpoint**: `GET /`

#### Response (200 OK)

```json
{
  "message": "Welcome to HRMS Lite API",
  "docs": "/docs",
  "version": "1.0.0"
}
```

### Health Check

Check if the API is running and healthy.

**Endpoint**: `GET /api/health`

#### Response (200 OK)

```json
{
  "status": "healthy",
  "service": "hrms-lite-api"
}
```

---

## Data Types

### UUID

All IDs are UUID v4 strings:

```
"550e8400-e29b-41d4-a716-446655440000"
```

### DateTime

All timestamps are ISO 8601 format with timezone:

```
"2026-02-28T10:30:00Z"
```

### Date

Dates are in ISO 8601 format (YYYY-MM-DD):

```
"2026-02-28"
```

### Attendance Status

Enum values:

| Value | Description |
|-------|-------------|
| `Present` | Employee was present |
| `Absent` | Employee was absent |
| `Not Marked` | Attendance not yet recorded (read-only) |

---

## Error Codes Reference

### Business Logic Errors

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `EMPLOYEE_NOT_FOUND` | 404 | Employee UUID does not exist |
| `EMPLOYEE_ID_EXISTS` | 409 | Employee ID already registered |
| `EMAIL_EXISTS` | 409 | Email already registered |
| `ATTENDANCE_NOT_FOUND` | 404 | Attendance record does not exist |
| `ATTENDANCE_EXISTS` | 409 | Attendance already marked for date |
| `FUTURE_DATE` | 422 | Cannot mark attendance for future |

### Validation Errors

| Error Type | HTTP Status | Description |
|------------|-------------|-------------|
| `value_error.email` | 422 | Invalid email format |
| `value_error.missing` | 422 | Required field missing |
| `value_error.number` | 422 | Invalid number format |
| `value_error.date` | 422 | Invalid date format |

---

## Rate Limiting

The current version does not implement rate limiting. For production deployments, consider adding rate limiting middleware.

Recommended limits:
- **Read operations**: 100 requests/minute
- **Write operations**: 30 requests/minute

---

## API Versioning

The current API version is `1.0.0`. Future versions will use URL-based versioning:

- Current: `/api/employees/`
- Future: `/api/v2/employees/`

---

## Changelog

### v1.0.0 (Current)

- Initial API release
- Employee CRUD operations
- Attendance management
- Dashboard statistics
- Health check endpoints

---

*For interactive API documentation, visit `/docs` when running the backend server.*
