# HRMS Lite - Build From Scratch Guide

A complete step-by-step guide to build a Human Resource Management System from scratch using React, FastAPI, and PostgreSQL.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Project Structure](#project-structure)
5. [Backend Development](#backend-development)
6. [Frontend Development](#frontend-development)
7. [Database Design](#database-design)
8. [API Endpoints](#api-endpoints)
9. [Deployment](#deployment)
10. [Testing](#testing)

---

## Project Overview

HRMS Lite is a full-stack web application for:
- Managing employee records (Add, View, Delete, Search)
- Tracking daily attendance (Mark, View, Filter)
- Dashboard with real-time statistics

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI library |
| Vite | Build tool & dev server |
| React Router | Client-side routing |
| Axios | HTTP client |
| CSS3 | Styling |

### Backend
| Technology | Purpose |
|------------|---------|
| FastAPI | Python web framework |
| SQLAlchemy | ORM for database operations |
| PostgreSQL | Relational database |
| Pydantic | Data validation |
| Uvicorn | ASGI server |

---

## Prerequisites

Ensure you have installed:
- **Node.js** 18+ and npm
- **Python** 3.10+
- **PostgreSQL** 12+
- **Git**

---

## Project Structure

```
hrms-lite/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── database.py          # Database configuration
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── controllers/         # HTTP request handlers
│   │   │   ├── __init__.py
│   │   │   ├── employee_controller.py
│   │   │   └── attendance_controller.py
│   │   ├── services/            # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── employee_service.py
│   │   │   └── attendance_service.py
│   │   ├── repositories/        # Database operations
│   │   │   ├── __init__.py
│   │   │   ├── employee_repository.py
│   │   │   └── attendance_repository.py
│   │   └── routers/             # API route definitions
│   │       ├── __init__.py
│   │       ├── employees.py
│   │       └── attendance.py
│   ├── requirements.txt
│   ├── runtime.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Reusable components
│   │   │   │   ├── Loading.jsx
│   │   │   │   ├── ErrorMessage.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   └── ConfirmModal.jsx
│   │   │   ├── employees/
│   │   │   │   ├── EmployeeList.jsx
│   │   │   │   └── AddEmployeeForm.jsx
│   │   │   ├── attendance/
│   │   │   │   ├── AttendanceList.jsx
│   │   │   │   └── AttendanceForm.jsx
│   │   │   └── layouts/
│   │   │       ├── Layout.jsx
│   │   │       └── Navigation.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Employees.jsx
│   │   │   └── Attendance.jsx
│   │   ├── services/
│   │   │   └── api.js           # API service layer
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
└── README.md
```

---

## Backend Development

### Step 1: Create Project Directory

```bash
mkdir hrms-lite
cd hrms-lite
mkdir backend
cd backend
```

### Step 2: Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

Create `requirements.txt`:
```txt
fastapi>=0.115.0
uvicorn[standard]>=0.32.0
sqlalchemy>=2.0.36
psycopg2-binary>=2.9.10
pydantic>=2.10.0
pydantic-settings>=2.6.0
python-dotenv>=1.0.0
python-multipart>=0.0.18
email-validator>=2.2.0
```

Install:
```bash
pip install -r requirements.txt
```

### Step 4: Create Environment File

Create `.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hrms_db
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Step 5: Database Configuration

Create `app/database.py`:
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/hrms_db")

# Add SSL for cloud databases (Render, Railway, etc.)
if "sslmode" not in DATABASE_URL:
    separator = "&" if "?" in DATABASE_URL else "?"
    DATABASE_URL = f"{DATABASE_URL}{separator}sslmode=require"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Step 6: Create Database Models

Create `app/models.py`:
```python
from sqlalchemy import Column, Integer, String, Date, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    department = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    attendance_records = relationship("Attendance", back_populates="employee", cascade="all, delete-orphan")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    is_present = Column(Boolean, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    employee = relationship("Employee", back_populates="attendance_records")
```

### Step 7: Create Pydantic Schemas

Create `app/schemas.py`:
```python
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import date

# Employee Schemas
class EmployeeBase(BaseModel):
    employee_id: str
    name: str
    email: EmailStr
    department: str

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeResponse(EmployeeBase):
    id: int
    created_at: Optional[str] = None
    
    class Config:
        from_attributes = True

# Attendance Schemas
class AttendanceBase(BaseModel):
    employee_id: int
    date: date
    is_present: bool

class AttendanceCreate(AttendanceBase):
    @field_validator('date')
    @classmethod
    def validate_date(cls, v):
        if v > date.today():
            raise ValueError('Cannot mark attendance for future dates')
        return v

class AttendanceResponse(AttendanceBase):
    id: int
    employee_name: Optional[str] = None
    created_at: Optional[str] = None
    
    class Config:
        from_attributes = True
```

### Step 8: Create Repository Layer

Create `app/repositories/employee_repository.py`:
```python
from sqlalchemy.orm import Session
from ..models import Employee

class EmployeeRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def get_all(self):
        return self.db.query(Employee).all()
    
    def get_by_id(self, employee_id: int):
        return self.db.query(Employee).filter(Employee.id == employee_id).first()
    
    def get_by_employee_id(self, employee_id: str):
        return self.db.query(Employee).filter(Employee.employee_id == employee_id).first()
    
    def get_by_email(self, email: str):
        return self.db.query(Employee).filter(Employee.email == email).first()
    
    def create(self, employee: Employee):
        self.db.add(employee)
        self.db.commit()
        self.db.refresh(employee)
        return employee
    
    def delete(self, employee_id: int):
        employee = self.get_by_id(employee_id)
        if employee:
            self.db.delete(employee)
            self.db.commit()
            return True
        return False
```

Create `app/repositories/attendance_repository.py`:
```python
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import date
from ..models import Attendance, Employee

class AttendanceRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def get_all(self):
        return self.db.query(Attendance).all()
    
    def get_by_date(self, date_filter: date):
        return self.db.query(Attendance).filter(Attendance.date == date_filter).all()
    
    def get_by_employee(self, employee_id: int):
        return self.db.query(Attendance).filter(Attendance.employee_id == employee_id).all()
    
    def get_by_employee_and_date(self, employee_id: int, date_filter: date):
        return self.db.query(Attendance).filter(
            and_(
                Attendance.employee_id == employee_id,
                Attendance.date == date_filter
            )
        ).first()
    
    def create(self, attendance: Attendance):
        self.db.add(attendance)
        self.db.commit()
        self.db.refresh(attendance)
        return attendance
    
    def count_by_date_and_status(self, date_filter: date, is_present: bool):
        return self.db.query(Attendance).filter(
            and_(
                Attendance.date == date_filter,
                Attendance.is_present == is_present
            )
        ).count()
```

### Step 9: Create Service Layer

Create `app/services/employee_service.py`:
```python
from sqlalchemy.orm import Session
from ..models import Employee
from ..repositories.employee_repository import EmployeeRepository
from ..schemas import EmployeeCreate

class EmployeeService:
    def __init__(self, db: Session):
        self.repository = EmployeeRepository(db)
    
    def get_all_employees(self):
        return self.repository.get_all()
    
    def create_employee(self, employee_data: EmployeeCreate):
        # Check for duplicate employee_id
        if self.repository.get_by_employee_id(employee_data.employee_id):
            raise ValueError("Employee ID already exists")
        
        # Check for duplicate email
        if self.repository.get_by_email(employee_data.email):
            raise ValueError("Email already exists")
        
        employee = Employee(**employee_data.model_dump())
        return self.repository.create(employee)
    
    def delete_employee(self, employee_id: int):
        return self.repository.delete(employee_id)
```

Create `app/services/attendance_service.py`:
```python
from sqlalchemy.orm import Session
from datetime import date
from ..models import Attendance
from ..repositories.attendance_repository import AttendanceRepository
from ..repositories.employee_repository import EmployeeRepository
from ..schemas import AttendanceCreate

class AttendanceService:
    def __init__(self, db: Session):
        self.repository = AttendanceRepository(db)
        self.employee_repository = EmployeeRepository(db)
    
    def get_all_attendance(self, date_filter: date = None):
        if date_filter:
            records = self.repository.get_by_date(date_filter)
        else:
            records = self.repository.get_all()
        
        # Add employee names to records
        for record in records:
            employee = self.employee_repository.get_by_id(record.employee_id)
            record.employee_name = employee.name if employee else "Unknown"
        
        return records
    
    def mark_attendance(self, attendance_data: AttendanceCreate):
        # Check if employee exists
        employee = self.employee_repository.get_by_id(attendance_data.employee_id)
        if not employee:
            raise ValueError("Employee not found")
        
        # Check for duplicate attendance
        existing = self.repository.get_by_employee_and_date(
            attendance_data.employee_id, 
            attendance_data.date
        )
        if existing:
            raise ValueError("Attendance already marked for this date")
        
        attendance = Attendance(**attendance_data.model_dump())
        return self.repository.create(attendance)
    
    def get_attendance_stats(self, target_date: date = None):
        if target_date is None:
            target_date = date.today()
        
        present_count = self.repository.count_by_date_and_status(target_date, True)
        absent_count = self.repository.count_by_date_and_status(target_date, False)
        
        return {
            "date": target_date,
            "present": present_count,
            "absent": absent_count,
            "total": present_count + absent_count
        }
```

### Step 10: Create Controllers

Create `app/controllers/employee_controller.py`:
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.employee_service import EmployeeService
from ..schemas import EmployeeCreate, EmployeeResponse

router = APIRouter(prefix="/api/employees", tags=["Employees"])

@router.get("/", response_model=list[EmployeeResponse])
def get_employees(db: Session = Depends(get_db)):
    service = EmployeeService(db)
    return service.get_all_employees()

@router.post("/", response_model=EmployeeResponse, status_code=201)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    service = EmployeeService(db)
    try:
        return service.create_employee(employee)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{employee_id}", status_code=204)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    service = EmployeeService(db)
    if not service.delete_employee(employee_id):
        raise HTTPException(status_code=404, detail="Employee not found")
    return None
```

Create `app/controllers/attendance_controller.py`:
```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from ..database import get_db
from ..services.attendance_service import AttendanceService
from ..schemas import AttendanceCreate, AttendanceResponse

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])

@router.get("/", response_model=list[AttendanceResponse])
def get_attendance(
    date: date = Query(None),
    db: Session = Depends(get_db)
):
    service = AttendanceService(db)
    return service.get_all_attendance(date)

@router.post("/", response_model=AttendanceResponse, status_code=201)
def mark_attendance(attendance: AttendanceCreate, db: Session = Depends(get_db)):
    service = AttendanceService(db)
    try:
        return service.mark_attendance(attendance)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/stats")
def get_attendance_stats(
    date: date = Query(None),
    db: Session = Depends(get_db)
):
    service = AttendanceService(db)
    return service.get_attendance_stats(date)
```

### Step 11: Create Main Application

Create `app/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from .database import engine, Base
from .controllers import employee_controller, attendance_controller

load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HRMS Lite API",
    description="Human Resource Management System",
    version="1.0.0"
)

# Configure CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(employee_controller.router)
app.include_router(attendance_controller.router)

@app.get("/")
def root():
    return {
        "message": "HRMS Lite API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

### Step 12: Create Runtime File

Create `runtime.txt`:
```
python-3.12.10
```

### Step 13: Run Backend Locally

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE hrms_db;
\q

# Run the server
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`

---

## Frontend Development

### Step 1: Create React Project

```bash
cd ..
npm create vite@latest frontend -- --template react
cd frontend
npm install
```

### Step 2: Install Dependencies

```bash
npm install react-router-dom axios
```

### Step 3: Configure Vite

Update `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
})
```

### Step 4: Create Environment File

Create `.env`:
```env
VITE_API_URL=http://localhost:8000
```

### Step 5: Create API Service

Create `src/services/api.js`:
```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const employeeApi = {
  getAll: async () => {
    const response = await api.get('/api/employees');
    return response.data;
  },
  
  create: async (employeeData) => {
    const response = await api.post('/api/employees', employeeData);
    return response.data;
  },
  
  delete: async (id) => {
    await api.delete(`/api/employees/${id}`);
  },
};

export const attendanceApi = {
  markAttendance: async (attendanceData) => {
    const response = await api.post('/api/attendance', attendanceData);
    return response.data;
  },
  
  getAll: async (dateFilter = null) => {
    const url = dateFilter 
      ? `/api/attendance?date=${dateFilter}` 
      : '/api/attendance';
    const response = await api.get(url);
    return response.data;
  },
};

export default api;
```

### Step 6: Create Components

Create `src/components/common/Loading.jsx`:
```jsx
import './Loading.css';

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  );
};

export default Loading;
```

Create `src/components/common/Loading.css`:
```css
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #333;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

Create `src/components/common/ErrorMessage.jsx`:
```jsx
import './ErrorMessage.css';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-container">
      <div className="error-icon">!</div>
      <h3>Something went wrong</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="retry-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
```

Create `src/components/common/ErrorMessage.css`:
```css
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.error-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  margin-bottom: 1rem;
}

.error-container h3 {
  margin: 0 0 0.5rem;
  color: #fff;
}

.error-container p {
  color: #888;
  margin: 0 0 1.5rem;
}

.retry-btn {
  background: #2d2d44;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #3d3d5c;
}
```

Create `src/components/common/EmptyState.jsx`:
```jsx
import './EmptyState.css';

const EmptyState = ({ message, icon }) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon || '📭'}</div>
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;
```

Create `src/components/common/EmptyState.css`:
```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state p {
  color: #888;
  margin: 0;
}
```

### Step 7: Create Employee Components

Create `src/components/employees/EmployeeList.jsx`:
```jsx
import { useState } from 'react';
import { employeeApi } from '../../services/api';
import ConfirmModal from '../common/ConfirmModal';
import './EmployeeList.css';

const EmployeeList = ({ employees, loading, error, onRefresh, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, employee: null });

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (deleteModal.employee) {
      await onDelete(deleteModal.employee.id);
      setDeleteModal({ open: false, employee: null });
    }
  };

  if (error) {
    return <ErrorMessage message={error} onRetry={onRefresh} />;
  }

  return (
    <div className="employee-list">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <Loading />
      ) : filteredEmployees.length === 0 ? (
        <EmptyState 
          message={searchTerm ? "No employees found" : "No employees yet"} 
        />
      ) : (
        <div className="employee-grid">
          {filteredEmployees.map(employee => (
            <div key={employee.id} className="employee-card">
              <div className="employee-avatar">
                {employee.name.charAt(0).toUpperCase()}
              </div>
              <div className="employee-info">
                <h3>{employee.name}</h3>
                <p className="employee-id">{employee.employee_id}</p>
                <p className="employee-email">{employee.email}</p>
                <span className="department-badge">{employee.department}</span>
              </div>
              <button
                className="delete-btn"
                onClick={() => setDeleteModal({ open: true, employee })}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete Employee"
        message={`Are you sure you want to delete ${deleteModal.employee?.name}? This will also delete all their attendance records.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, employee: null })}
      />
    </div>
  );
};

export default EmployeeList;
```

### Step 8: Create Layout and Navigation

Create `src/components/layouts/Navigation.jsx`:
```jsx
import { NavLink } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  return (
    <nav className="sidebar">
      <div className="logo">
        <span className="logo-icon">🏢</span>
        <div className="logo-text">
          <span className="logo-title">HRMS</span>
          <span className="logo-subtitle">LITE</span>
        </div>
      </div>
      
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">📊</span>
          Dashboard
        </NavLink>
        <NavLink to="/employees" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">👥</span>
          Employees
        </NavLink>
        <NavLink to="/attendance" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">📅</span>
          Attendance
        </NavLink>
      </div>
    </nav>
  );
};

export default Navigation;
```

### Step 9: Create Pages

Create `src/pages/Dashboard.jsx`:
```jsx
import { useState, useEffect } from 'react';
import { employeeApi, attendanceApi } from '../services/api';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    todayPresent: 0,
    todayAbsent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [employees, attendance] = await Promise.all([
        employeeApi.getAll(),
        attendanceApi.getAll(new Date().toISOString().split('T')[0]),
      ]);
      
      const present = attendance.filter(a => a.is_present).length;
      const absent = attendance.filter(a => !a.is_present).length;
      
      setStats({
        totalEmployees: employees.length,
        todayPresent: present,
        todayAbsent: absent,
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={fetchStats} />;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Employees</h3>
            <p className="stat-value">{stats.totalEmployees}</p>
          </div>
        </div>
        <div className="stat-card present">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Present Today</h3>
            <p className="stat-value">{stats.todayPresent}</p>
          </div>
        </div>
        <div className="stat-card absent">
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <h3>Absent Today</h3>
            <p className="stat-value">{stats.todayAbsent}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
```

### Step 10: Create Main App

Update `src/App.jsx`:
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layouts/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/attendance" element={<Attendance />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
```

### Step 11: Run Frontend Locally

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

---

## Database Design

### Employees Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| employee_id | VARCHAR(50) | UNIQUE, NOT NULL |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(100) | UNIQUE, NOT NULL |
| department | VARCHAR(100) | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |

### Attendance Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| employee_id | INTEGER | FOREIGN KEY, NOT NULL |
| date | DATE | NOT NULL |
| is_present | BOOLEAN | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |

### Indexes

```sql
CREATE INDEX idx_employee_employee_id ON employees(employee_id);
CREATE INDEX idx_employee_email ON employees(email);
CREATE INDEX idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(date);
```

---

## API Endpoints

### Employees

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | Get all employees |
| POST | `/api/employees` | Create new employee |
| DELETE | `/api/employees/{id}` | Delete employee |

### Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance` | Get all attendance (optional `?date=YYYY-MM-DD`) |
| POST | `/api/attendance` | Mark attendance |
| GET | `/api/attendance/stats` | Get attendance statistics |

### Request/Response Examples

**Create Employee:**
```json
// POST /api/employees
{
  "employee_id": "EMP001",
  "name": "John Doe",
  "email": "john@example.com",
  "department": "Engineering"
}

// Response
{
  "id": 1,
  "employee_id": "EMP001",
  "name": "John Doe",
  "email": "john@example.com",
  "department": "Engineering",
  "created_at": "2024-01-15T10:30:00"
}
```

**Mark Attendance:**
```json
// POST /api/attendance
{
  "employee_id": 1,
  "date": "2024-01-15",
  "is_present": true
}

// Response
{
  "id": 1,
  "employee_id": 1,
  "employee_name": "John Doe",
  "date": "2024-01-15",
  "is_present": true,
  "created_at": "2024-01-15T09:00:00"
}
```

---

## Deployment

### Backend (Render)

1. Create PostgreSQL database on Render
2. Create Web Service:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Set Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `CORS_ORIGINS`: Your frontend URL

### Frontend (Vercel)

1. Import repository
2. Root Directory: `frontend`
3. Framework: Vite
4. Set Environment Variables:
   - `VITE_API_URL`: Your backend URL

---

## Testing

### Backend Testing

```bash
# Test API endpoints
curl http://localhost:8000/health
curl http://localhost:8000/api/employees
```

### Frontend Testing

1. Add an employee
2. Mark attendance
3. View dashboard statistics
4. Search employees
5. Filter attendance by date

---

## Key Features Implemented

- CRUD operations for employees
- Attendance tracking with validation
- Dashboard with real-time statistics
- Search and filter functionality
- Duplicate prevention (employee_id, email, attendance)
- Responsive UI design
- Error handling and loading states

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| CORS error | Update `CORS_ORIGINS` in backend |
| Database connection failed | Check `DATABASE_URL` and SSL settings |
| Build fails on Render | Pin Python version in `runtime.txt` |
| Environment variables not working | Redeploy after updating env vars |

---

**Built with React + FastAPI + PostgreSQL**
