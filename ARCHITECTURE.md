# HRMS Lite - Architecture Documentation

This document provides a comprehensive technical overview of the HRMS Lite system architecture, including system design, data models, API specifications, and frontend structure.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [Technology Stack Details](#technology-stack-details)
4. [Backend Architecture](#backend-architecture)
5. [Database Schema](#database-schema)
6. [API Endpoints Reference](#api-endpoints-reference)
7. [Frontend Architecture](#frontend-architecture)
8. [State Management](#state-management)
9. [Security Considerations](#security-considerations)
10. [Performance Characteristics](#performance-characteristics)
11. [Testing Architecture](#testing-architecture)
12. [Deployment Architecture](#deployment-architecture)
13. [Scaling Considerations](#scaling-considerations)

---

## Executive Summary

HRMS Lite is a full-stack web application built on a modern, layered architecture that emphasizes separation of concerns, type safety, and maintainability. The system follows a traditional three-tier architecture with a React-based presentation layer, FastAPI-based application layer, and PostgreSQL-based data layer.

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| FastAPI over Django | Lightweight, async support, automatic OpenAPI documentation |
| React + Vite over Create React App | Faster builds, better developer experience |
| SQLAlchemy ORM | Database-agnostic, type-safe queries, mature ecosystem |
| Pydantic for validation | Automatic validation, serialization, and OpenAPI schema generation |
| Context API over Redux | Simpler state management for the application's scope |

---

## System Architecture Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     Browser (React SPA)                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │   │
│  │  │Dashboard │  │Employees │  │Attendance│  │ Shared Components│ │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │   │
│  │       │             │             │                  │           │   │
│  │       └─────────────┴─────────────┴──────────────────┘           │   │
│  │                              │                                   │   │
│  │                    ┌─────────▼─────────┐                        │   │
│  │                    │   API Service     │                        │   │
│  │                    │   (Axios)         │                        │   │
│  │                    └─────────┬─────────┘                        │   │
│  └──────────────────────────────┼──────────────────────────────────┘   │
└─────────────────────────────────┼───────────────────────────────────────┘
                                  │ HTTP/REST
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION LAYER                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     FastAPI Application                          │   │
│  │  ┌─────────────────────────────────────────────────────────┐   │   │
│  │  │                    CORS Middleware                       │   │   │
│  │  └─────────────────────────────────────────────────────────┘   │   │
│  │                              │                                   │   │
│  │  ┌───────────────┐  ┌────────▼────────┐  ┌───────────────┐    │   │
│  │  │   Employees   │  │   Attendance    │  │   Schemas     │    │   │
│  │  │    Router     │  │     Router      │  │  (Pydantic)   │    │   │
│  │  └───────┬───────┘  └────────┬────────┘  └───────────────┘    │   │
│  │          │                   │                                   │   │
│  │          └─────────┬─────────┘                                   │   │
│  │                    │                                             │   │
│  │          ┌─────────▼─────────┐                                  │   │
│  │          │   SQLAlchemy ORM  │                                  │   │
│  │          └─────────┬─────────┘                                  │   │
│  └────────────────────┼────────────────────────────────────────────┘   │
└───────────────────────┼─────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    PostgreSQL Database                           │   │
│  │  ┌──────────────────┐     ┌──────────────────┐                  │   │
│  │  │    employees     │────<│    attendance    │                  │   │
│  │  └──────────────────┘     └──────────────────┘                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
User Action → React Component → API Service → FastAPI Router → Pydantic Validation
    ↓
SQLAlchemy Query → PostgreSQL → SQLAlchemy Model → Pydantic Schema → JSON Response
    ↓
React Component → UI Update
```

---

## Technology Stack Details

### Backend Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Web Framework | FastAPI | 0.115+ | REST API, routing, middleware |
| ASGI Server | Uvicorn | 0.30+ | Production server |
| ORM | SQLAlchemy | 2.0+ | Database abstraction |
| Validation | Pydantic | 2.7+ | Request/response validation |
| Database | PostgreSQL | 12+ | Primary data store |
| Migrations | SQLAlchemy DDL | - | Schema creation |

### Frontend Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| UI Library | React | 19.x | Component framework |
| Build Tool | Vite | 7.x | Development server, bundling |
| Router | React Router | 7.x | Client-side navigation |
| HTTP Client | Axios | 1.x | API communication |
| Charts | Recharts | 3.x | Data visualization |
| Icons | React Icons | 5.x | Icon library |
| CSS Framework | Bootstrap | 5.x | Base styling |
| Date Handling | date-fns | 4.x | Date manipulation |

---

## Backend Architecture

### Layered Architecture

The backend follows a clean, layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      ROUTES LAYER                           │
│  • HTTP request handling                                    │
│  • Route definition and parameter extraction                 │
│  • Response serialization                                    │
│  • Error handling and HTTP status codes                     │
├─────────────────────────────────────────────────────────────┤
│                      SCHEMAS LAYER                          │
│  • Request validation (Pydantic)                            │
│  • Response serialization                                    │
│  • Type safety and coercion                                 │
│  • OpenAPI schema generation                                │
├─────────────────────────────────────────────────────────────┤
│                      MODELS LAYER                           │
│  • Database entity definition                               │
│  • Relationships and constraints                            │
│  • Indexes and performance optimization                     │
└─────────────────────────────────────────────────────────────┘
```

### Models Layer

#### Employee Model

**File**: `backend/app/models/employee.py`

```python
class Employee(Base):
    __tablename__ = "employees"

    # Primary key - UUID for distributed systems compatibility
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Business identifier - unique, indexed for fast lookups
    employee_id = Column(String(20), unique=True, nullable=False, index=True)
    
    # Personal information
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    department = Column(String(100), nullable=False)
    
    # Soft delete support
    is_active = Column(Boolean, default=True)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship: One employee has many attendance records
    attendance_records = relationship(
        "Attendance", 
        back_populates="employee", 
        cascade="all, delete-orphan"
    )
```

**Design Decisions**:
- UUID primary keys for future horizontal scaling
- Indexed `employee_id` and `email` for fast unique constraint checks
- Soft delete via `is_active` flag
- Cascade delete ensures attendance records are cleaned up

#### Attendance Model

**File**: `backend/app/models/attendance.py`

```python
class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Foreign key to employees with cascade delete
    employee_id = Column(
        String(36), 
        ForeignKey("employees.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    
    # Attendance data
    date = Column(Date, nullable=False, index=True)
    status = Column(Enum(AttendanceStatus), nullable=False)
    
    # Audit field
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    employee = relationship("Employee", back_populates="attendance_records")
```

**Design Decisions**:
- Composite uniqueness enforced at application level (one record per employee per date)
- Indexed `date` for date-range queries
- Enum type for status ensures data integrity

### Schemas Layer

Schemas define the contract between API and clients using Pydantic:

#### Employee Schemas

**File**: `backend/app/schemas/employee.py`

```python
class EmployeeBase(BaseModel):
    """Base schema with shared fields"""
    employee_id: str = Field(..., min_length=1, max_length=20)
    full_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr = Field(...)
    department: str = Field(..., min_length=1, max_length=100)

    @field_validator('employee_id')
    @classmethod
    def validate_employee_id(cls, v):
        return v.strip().upper()

class EmployeeCreate(EmployeeBase):
    """Schema for creating new employees"""
    pass

class EmployeeUpdate(BaseModel):
    """Schema for updates - all fields optional"""
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None

class EmployeeResponse(EmployeeBase):
    """Schema for API responses"""
    id: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
```

### Routes Layer

Routes handle HTTP requests and contain business logic:

#### Employee Routes

**File**: `backend/app/routes/employees.py`

| Endpoint | Method | Handler | Description |
|----------|--------|---------|-------------|
| `/api/employees/` | POST | `create_employee` | Create with duplicate check |
| `/api/employees/` | GET | `get_employees` | List with search/filter |
| `/api/employees/{id}` | GET | `get_employee` | Get by UUID |
| `/api/employees/{id}` | PUT | `update_employee` | Update with validation |
| `/api/employees/{id}` | DELETE | `delete_employee` | Hard delete |
| `/api/employees/{id}/summary` | GET | `get_employee_summary` | Attendance stats |
| `/api/employees/dashboard/stats` | GET | `get_dashboard_stats` | Aggregated stats |

---

## Database Schema

### Entity-Relationship Diagram

```
┌───────────────────────────────────────┐
│              employees                 │
├───────────────────────────────────────┤
│ id (PK)            │ UUID             │
│ employee_id (UQ)   │ VARCHAR(20)      │
│ full_name          │ VARCHAR(100)     │
│ email (UQ)         │ VARCHAR(255)     │
│ department         │ VARCHAR(100)     │
│ is_active          │ BOOLEAN          │
│ created_at         │ TIMESTAMPTZ      │
│ updated_at         │ TIMESTAMPTZ      │
└─────────┬─────────────────────────────┘
          │
          │ 1:N (CASCADE DELETE)
          │
          ▼
┌───────────────────────────────────────┐
│              attendance                │
├───────────────────────────────────────┤
│ id (PK)            │ UUID             │
│ employee_id (FK)   │ UUID             │
│ date               │ DATE             │
│ status             │ ENUM             │
│ created_at         │ TIMESTAMPTZ      │
└───────────────────────────────────────┘
```

### Indexes

| Table | Column | Index Type | Purpose |
|-------|--------|------------|---------|
| employees | id | PRIMARY | Primary key lookup |
| employees | employee_id | UNIQUE | Business ID lookup, uniqueness |
| employees | email | UNIQUE | Email lookup, uniqueness |
| attendance | id | PRIMARY | Primary key lookup |
| attendance | employee_id | INDEX | Employee filtering |
| attendance | date | INDEX | Date range queries |

### Constraints

| Constraint | Table | Columns | Type |
|------------|-------|---------|------|
| pk_employees | employees | id | PRIMARY KEY |
| uq_employee_id | employees | employee_id | UNIQUE |
| uq_employee_email | employees | email | UNIQUE |
| pk_attendance | attendance | id | PRIMARY KEY |
| fk_attendance_employee | attendance | employee_id | FOREIGN KEY |

---

## API Endpoints Reference

### Employees API

#### Create Employee

```http
POST /api/employees/
Content-Type: application/json

{
  "employee_id": "EMP001",
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "department": "Engineering"
}
```

**Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "employee_id": "EMP001",
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "department": "Engineering",
  "is_active": true,
  "created_at": "2026-02-28T10:00:00Z",
  "updated_at": null
}
```

**Error Responses**:
- `409 Conflict`: Duplicate employee_id or email
- `422 Unprocessable Entity`: Validation error

#### List Employees

```http
GET /api/employees/?search=john&department=Engineering&skip=0&limit=100
```

**Response** (200 OK):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "employee_id": "EMP001",
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "department": "Engineering",
    "is_active": true,
    "created_at": "2026-02-28T10:00:00Z",
    "updated_at": null
  }
]
```

#### Dashboard Statistics

```http
GET /api/employees/dashboard/stats
```

**Response** (200 OK):
```json
{
  "total_employees": 50,
  "departments": [
    {"name": "Engineering", "count": 20},
    {"name": "Marketing", "count": 15},
    {"name": "Sales", "count": 15}
  ],
  "today_attendance": {
    "present": 40,
    "absent": 5,
    "not_marked": 5
  },
  "overall_attendance_rate": 85.5,
  "recent_employees": [...]
}
```

### Attendance API

#### Mark Attendance

```http
POST /api/attendance/
Content-Type: application/json

{
  "employee_id": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2026-02-28",
  "status": "Present"
}
```

**Response** (201 Created):
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "employee_id": "550e8400-e29b-41d4-a716-446655440000",
  "employee_name": "John Doe",
  "employee_employee_id": "EMP001",
  "date": "2026-02-28",
  "status": "Present",
  "created_at": "2026-02-28T10:00:00Z"
}
```

**Error Responses**:
- `404 Not Found`: Employee not found
- `409 Conflict`: Attendance already marked for this date
- `422 Unprocessable Entity`: Invalid date (future date)

#### List Attendance Records

```http
GET /api/attendance/?employee_id=xxx&start_date=2026-02-01&end_date=2026-02-28&status=Present
```

#### Today's Attendance

```http
GET /api/attendance/today
```

**Response** (200 OK):
```json
[
  {
    "employee_id": "550e8400-...",
    "employee_code": "EMP001",
    "full_name": "John Doe",
    "department": "Engineering",
    "date": "2026-02-28",
    "status": "Present"
  },
  {
    "employee_id": "550e8400-...",
    "employee_code": "EMP002",
    "full_name": "Jane Smith",
    "department": "Marketing",
    "date": "2026-02-28",
    "status": "Not Marked"
  }
]
```

---

## Frontend Architecture

### Component Hierarchy

```
App (AlertProvider + Router)
├── Alerts                    # Global alert notifications
├── Navbar                    # Top navigation bar
├── BottomNav                 # Mobile bottom navigation
└── Main Content (Routes)
    ├── Dashboard             # Dashboard page
    │   ├── Stat Cards
    │   ├── PieChart (Today's Attendance)
    │   ├── BarChart (Department Distribution)
    │   └── Recent Employees List
    │
    ├── Employees             # Employee management
    │   ├── Search Box
    │   ├── Employee Table/Cards
    │   ├── Modal (Add/Edit Form)
    │   └── Modal (Delete Confirmation)
    │
    └── Attendance            # Attendance management
        ├── Filter Controls
        ├── Attendance Table/Cards
        ├── Modal (Mark Attendance)
        └── Modal (Delete Confirmation)
```

### Component Structure

Each page component follows a consistent pattern:

```jsx
function PageComponent() {
  // 1. State declarations
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // 2. Effects
  useEffect(() => {
    fetchData();
  }, []);

  // 3. Event handlers
  const handleSubmit = async (formData) => { ... };

  // 4. Render
  if (loading) return <Spinner />;
  
  return (
    <div className="page-container">
      {/* Page header */}
      {/* Main content */}
      {/* Modals */}
    </div>
  );
}
```

### Shared Components

| Component | File | Purpose |
|-----------|------|---------|
| `Alerts` | `components/Alerts.jsx` | Global notification display |
| `BottomNav` | `components/BottomNav.jsx` | Mobile navigation |
| `EmptyState` | `components/EmptyState.jsx` | Placeholder for empty data |
| `Modal` | `components/Modal.jsx` | Reusable dialog component |
| `Navbar` | `components/Navbar.jsx` | Desktop navigation |
| `Spinner` | `components/Spinner.jsx` | Loading indicator |

---

## State Management

### Context API - Alert System

The application uses React Context for global alert state management:

**File**: `frontend/src/context/AlertContext.jsx`

```jsx
const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const addAlert = (message, type = 'info') => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 5000);
  };

  // Convenience methods
  const success = (message) => addAlert(message, 'success');
  const error = (message) => addAlert(message, 'danger');
  const warning = (message) => addAlert(message, 'warning');
  const info = (message) => addAlert(message, 'info');

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert, success, error, warning, info }}>
      {children}
    </AlertContext.Provider>
  );
}
```

### Local Component State

Most state is managed locally within components using `useState`:

- **Form state**: Input values, validation errors
- **UI state**: Loading states, modal visibility
- **Data state**: Fetched data from API

### State Flow Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Action   │────▶│  Event Handler  │────▶│   API Service   │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                        ┌─────────────────┐              │ Response
                        │  Alert Context  │◀─────────────┘
                        │   (success/error)│
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │  Local State    │
                        │  (data reload)  │
                        └─────────────────┘
```

---

## Security Considerations

### Current Security Model

HRMS Lite is designed for internal use with a single admin user model:

| Aspect | Implementation |
|--------|----------------|
| Authentication | None (assumes trusted network) |
| Authorization | None (all users have full access) |
| CORS | Whitelist-based origin checking |
| Input Validation | Pydantic schemas with strict validation |
| SQL Injection | Prevented by SQLAlchemy parameterized queries |
| XSS | React's automatic escaping |

### CORS Configuration

```python
# backend/app/main.py
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173")
allowed_origins = [origin.strip() for origin in cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Input Validation

All inputs are validated at multiple layers:

1. **Frontend**: Form validation before submission
2. **API**: Pydantic schema validation
3. **Business Logic**: Duplicate checks, existence checks
4. **Database**: Constraints (unique, not null)

### Recommendations for Production

For production deployment, consider implementing:

- [ ] Authentication (JWT, OAuth2, or session-based)
- [ ] Role-based authorization
- [ ] Rate limiting
- [ ] Audit logging
- [ ] HTTPS enforcement
- [ ] Environment variable encryption
- [ ] Database connection pooling

---

## Performance Characteristics

### Backend Performance

| Metric | Typical Value | Notes |
|--------|---------------|-------|
| API Response Time | < 50ms | For single record operations |
| Dashboard Stats | < 100ms | Aggregation queries |
| List Endpoint | < 200ms | With 100 records |

### Optimization Techniques

1. **Database Indexes**: On frequently queried columns
2. **Query Optimization**: Selective loading, pagination
3. **Connection Pooling**: SQLAlchemy session management
4. **Lazy Loading**: React components loaded on demand

### Frontend Performance

| Metric | Target | Notes |
|--------|--------|-------|
| First Contentful Paint | < 1.5s | Vite's optimized builds |
| Time to Interactive | < 3s | Minimal JavaScript |
| Bundle Size | < 200KB | Gzipped, excluding Bootstrap |

---

## Testing Architecture

### Testing Pyramid

```
                    ┌─────────┐
                    │   E2E   │  Playwright
                    │  Tests  │  3 test files
                    └─────────┘
                   ┌───────────┐
                   │Integration│  pytest + httpx
                   │   Tests   │  API endpoint tests
                   └───────────┘
               ┌─────────────────┐
               │   Unit Tests    │  pytest + Vitest
               │                 │  Component + schema tests
               └─────────────────┘
```

### Test Coverage

| Layer | Coverage | Tools |
|-------|----------|-------|
| Backend Routes | > 70% | pytest, httpx |
| Backend Schemas | > 80% | pytest, Pydantic |
| Frontend Components | > 70% | Vitest, Testing Library |
| E2E Flows | Critical paths | Playwright |

### Test Data Generation

Factory Boy factories provide consistent test data:

```python
# backend/tests/factories.py
class EmployeeFactory(SQLAlchemyModelFactory):
    class Meta:
        model = Employee
        sqlalchemy_session_persistence = 'commit'
    
    employee_id = Sequence(lambda n: f'EMP{n+1:04d}')
    full_name = Faker('name')
    email = LazyAttribute(lambda obj: f"{obj.full_name.lower().replace(' ', '.')}@example.com")
    department = Faker('job')
    is_active = True
```

---

## Deployment Architecture

### Production Deployment

```
┌──────────────────┐     ┌──────────────────┐
│     Vercel       │     │     Render       │
│   (Frontend)     │────▶│    (Backend)     │
│                  │     │                  │
│  - React SPA     │     │  - FastAPI       │
│  - CDN Caching   │     │  - Uvicorn       │
│  - Auto SSL      │     │  - Auto SSL      │
└──────────────────┘     └────────┬─────────┘
                                  │
                         ┌────────▼─────────┐
                         │ Render PostgreSQL │
                         │                  │
                         │  - Managed DB    │
                         │  - Auto backups  │
                         │  - SSL           │
                         └──────────────────┘
```

### Environment Variables

**Backend (.env)**:
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
CORS_ORIGINS=https://your-frontend.vercel.app
```

**Frontend (.env)**:
```env
VITE_API_URL=https://your-backend.onrender.com
```

---

## Scaling Considerations

### Current Limitations

- Single server deployment
- No caching layer
- No background job processing
- No database read replicas

### Scaling Path

For larger deployments, consider:

1. **Application Layer**:
   - Horizontal scaling with load balancer
   - Redis for session storage and caching
   - Celery for background tasks

2. **Database Layer**:
   - Read replicas for reporting queries
   - Connection pooling (PgBouncer)
   - Partitioning for large datasets

3. **Infrastructure**:
   - Container orchestration (Kubernetes)
   - CDN for static assets
   - Monitoring and observability stack

### Recommended Architecture (Scaled)

```
                    ┌─────────────┐
                    │    CDN      │
                    │  (Static)   │
                    └──────┬──────┘
                           │
┌──────────────────────────┼──────────────────────────┐
│                     Load Balancer                    │
└──────────────────────────┼──────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐
    │  FastAPI  │    │  FastAPI  │    │  FastAPI  │
    │  Instance │    │  Instance │    │  Instance │
    └─────┬─────┘    └─────┬─────┘    └─────┬─────┘
          │                │                │
          └────────────────┼────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐
    │  Redis    │    │PostgreSQL │    │  Celery   │
    │  (Cache)  │    │ (Primary) │    │ (Workers) │
    └───────────┘    └─────┬─────┘    └───────────┘
                           │
                    ┌─────▼─────┐
                    │PostgreSQL │
                    │  (Replica)│
                    └───────────┘
```

---

## Appendix: Design Patterns

### Patterns Used

| Pattern | Location | Purpose |
|---------|----------|---------|
| Repository (Simplified) | Routes → Models | Data access abstraction |
| DTO | Schemas | Data transfer and validation |
| Dependency Injection | FastAPI Depends | Database session management |
| Factory | Test factories | Test data generation |
| Provider | AlertContext | Global state management |
| Compound Components | Modal | Flexible component composition |

---

*This architecture documentation is maintained alongside the codebase. For implementation details, refer to the source code and inline documentation.*