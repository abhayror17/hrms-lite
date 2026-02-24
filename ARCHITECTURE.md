# HRMS Backend - Architecture Documentation

## Overview

The HRMS Lite backend follows a clean, layered architecture using FastAPI's best practices. It separates concerns into Models, Routes, Schemas, and Database layers for maintainability and scalability.

## Architecture Layers

### 1. Models (Data Layer)

**Location**: `app/models/`

Defines database entities using SQLAlchemy ORM.

#### Employee Model (`employee.py`)
```python
class Employee(Base):
    __tablename__ = "employees"

    id = Column(String(36), primary_key=True)
    employee_id = Column(String(20), unique=True, nullable=False, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    department = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

#### Attendance Model (`attendance.py`)
```python
class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(String(36), primary_key=True)
    employee_id = Column(String(36), ForeignKey("employees.id"))
    date = Column(DateTime, nullable=False)
    status = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

**Responsibilities**:
- Database schema definition
- Entity relationships
- Field constraints and indexes

---

### 2. Schemas (DTO Layer)

**Location**: `app/schemas/`

Pydantic models for request/response validation and serialization.

#### Employee Schemas (`employee.py`)
- `EmployeeCreate` - Validation for employee creation
- `EmployeeResponse` - Response format for employee data
- `EmployeeUpdate` - Validation for employee updates

#### Attendance Schemas (`attendance.py`)
- `AttendanceCreate` - Validation for marking attendance
- `AttendanceResponse` - Response format for attendance data

**Responsibilities**:
- Request payload validation
- Response serialization
- Data transformation
- Type safety

---

### 3. Routes (API Layer)

**Location**: `app/routes/`

FastAPI routers that handle HTTP requests, business logic, and database operations.

#### Employee Routes (`employees.py`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/employees` | POST | Create new employee |
| `/api/employees` | GET | List all employees |
| `/api/employees/{id}` | GET | Get employee by ID |
| `/api/employees/{id}` | PUT | Update employee |
| `/api/employees/{id}` | DELETE | Delete employee |
| `/api/employees/{id}/summary` | GET | Get attendance summary |
| `/api/employees/dashboard/stats` | GET | Dashboard statistics |

#### Attendance Routes (`attendance.py`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/attendance` | POST | Mark attendance |
| `/api/attendance` | GET | Get all attendance |
| `/api/attendance/today` | GET | Get today's attendance |
| `/api/attendance/employee/{id}` | GET | Get employee attendance |
| `/api/attendance/{id}` | PUT | Update attendance |
| `/api/attendance/{id}` | DELETE | Delete attendance |

**Responsibilities**:
- Route definitions
- Request/response handling
- Business logic execution
- Database queries (via SQLAlchemy)
- Error handling

---

### 4. Database Configuration

**Location**: `app/database.py`

Manages database connection and session handling.

```python
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

**Key Functions**:
- `get_db()` - Dependency injection for database sessions
- `init_db()` - Initialize database tables

---

## Request Flow

```
HTTP Request
    ↓
FastAPI Router (Routes Layer)
    ↓
Pydantic Validation (Schemas Layer)
    ↓
Business Logic (in Route Handler)
    ↓
SQLAlchemy ORM (Models Layer)
    ↓
PostgreSQL Database
```

### Example: Creating an Employee

1. **POST** request to `/api/employees` with employee data
2. FastAPI validates request body against `EmployeeCreate` schema
3. Route handler checks for duplicate employee_id
4. Route handler checks for duplicate email
5. New `Employee` model instance is created
6. Instance is added to database session and committed
7. Response is serialized using `EmployeeResponse` schema

---

## File Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app setup & CORS
│   ├── database.py          # Database connection
│   ├── enums.py             # Enum definitions
│   │
│   ├── models/              # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── employee.py
│   │   └── attendance.py
│   │
│   ├── routes/              # API endpoints
│   │   ├── __init__.py
│   │   ├── employees.py
│   │   └── attendance.py
│   │
│   └── schemas/             # Pydantic schemas
│       ├── __init__.py
│       ├── employee.py
│       └── attendance.py
│
├── requirements.txt         # Python dependencies
├── runtime.txt              # Python version
├── .env.example             # Environment template
└── .env                     # Local environment (gitignored)
```

---

## Design Patterns Used

### 1. Repository Pattern (Simplified)
- Models encapsulate database schema
- Routes handle data access directly (simplified for this project size)

### 2. Dependency Injection
- Database sessions injected via FastAPI's `Depends(get_db)`
- Loose coupling between components

### 3. DTO Pattern
- Pydantic schemas define clear data contracts
- Separate schemas for create, update, and response operations

### 4. Router Pattern
- Routes organized by domain (employees, attendance)
- Each router handles its own endpoints

---

## Best Practices Followed

### 1. Separation of Concerns
- Models: Database structure
- Schemas: Data validation and serialization
- Routes: API endpoints and business logic

### 2. Type Safety
- Full type hints throughout
- Pydantic validation on all inputs

### 3. Error Handling
- Consistent HTTP status codes
- Descriptive error messages
- Proper exception handling with HTTPException

### 4. Database Best Practices
- Indexed columns for frequently queried fields
- Proper foreign key relationships
- Cascade delete for related records

### 5. API Design
- RESTful conventions
- Consistent naming
- Proper HTTP methods

---

## Environment Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | `http://localhost:5173,https://app.vercel.app` |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |

---

## Adding New Features

### Step 1: Create Model
Add new entity in `app/models/`

### Step 2: Create Schema
Add Pydantic schemas in `app/schemas/`

### Step 3: Create Routes
Add router in `app/routes/` with endpoints

### Step 4: Register Router
Import and include router in `app/main.py`

```python
from app.routes import new_router
app.include_router(new_router)
```

---

## Database Relationships

```
┌─────────────┐       ┌─────────────────┐
│  Employees  │       │   Attendance    │
├─────────────┤       ├─────────────────┤
│ id (PK)     │◄──────│ employee_id(FK) │
│ employee_id │       │ id (PK)         │
│ full_name   │       │ date            │
│ email       │       │ status          │
│ department  │       │ created_at      │
│ is_active   │       └─────────────────┘
│ created_at  │
│ updated_at  │
└─────────────┘

Relationship: Employee → Attendance (One-to-Many)
Cascade: DELETE cascades to attendance records
```

---

## Scaling Considerations

For larger applications, consider:

1. **Service Layer**: Move business logic from routes to dedicated service classes
2. **Repository Layer**: Abstract database operations into repository classes
3. **Caching**: Add Redis for frequently accessed data
4. **Background Tasks**: Use Celery for async operations
5. **API Versioning**: Structure routes under versioned prefixes

---

**This architecture ensures clean, maintainable, and testable code! 🚀**
