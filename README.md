# HRMS Lite

[![Build Status](https://img.shields.io/github/actions/workflow/status/abhayror17/hrms-lite/test.yml?branch=main&label=tests&style=flat-square)](https://github.com/abhayror17/hrms-lite/actions/workflows/test.yml)
[![Coverage](https://img.shields.io/codecov/c/github/abhayror17/hrms-lite?style=flat-square)](https://codecov.io/gh/abhayror17/hrms-lite)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11+-blue?style=flat-square&logo=python)](https://www.python.org/)
[![React](https://img.shields.io/badge/react-19-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/fastapi-0.115+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)

A modern, lightweight Human Resource Management System for tracking employees and attendance. Built with a **React + Vite** frontend and **FastAPI + SQLAlchemy** backend, featuring real-time dashboards, comprehensive validation, and a responsive mobile-first design.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage Guide](#usage-guide)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

HRMS Lite is a full-stack web application designed to simplify employee management and attendance tracking for small to medium-sized organizations. The system provides an intuitive interface for HR personnel to manage employee records, mark daily attendance, and view real-time statistics through an interactive dashboard.

### Key Highlights

- **Real-time Dashboard**: Live statistics with interactive charts powered by Recharts
- **Mobile-First Design**: Fully responsive UI with optimized touch interactions
- **Comprehensive Validation**: Both client-side and server-side validation with detailed error messages
- **RESTful API**: Well-documented API with OpenAPI/Swagger documentation
- **High Test Coverage**: 70%+ code coverage with unit, integration, and E2E tests
- **Production Ready**: Configured for deployment on Render (backend) and Vercel (frontend)

---

## Features

### Employee Management

| Feature | Description |
|---------|-------------|
| **Add Employees** | Create new employee records with validated fields (ID, name, email, department) |
| **Search & Filter** | Real-time search by name, employee ID, or email address |
| **Update Records** | Edit employee information with conflict prevention |
| **Delete Records** | Remove employees with cascading attendance record cleanup |
| **Duplicate Prevention** | Automatic detection of duplicate employee IDs and emails |

### Attendance Management

| Feature | Description |
|---------|-------------|
| **Mark Attendance** | Record daily attendance (Present/Absent) for any employee |
| **Date Validation** | Prevents marking attendance for future dates |
| **Duplicate Prevention** | One attendance record per employee per day |
| **Filter Records** | Filter by employee, date range, or attendance status |
| **Today's Overview** | Quick view of today's attendance status for all employees |

### Dashboard & Analytics

| Feature | Description |
|---------|-------------|
| **Statistics Overview** | Total employees, departments, and attendance rate |
| **Today's Summary** | Present, absent, and unmarked counts |
| **Department Breakdown** | Bar chart visualization of employees by department |
| **Attendance Pie Chart** | Visual breakdown of today's attendance |
| **Recent Employees** | List of recently added team members |

### User Interface

- **Dark Theme**: Modern gradient-based design with smooth transitions
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Bottom Navigation**: Mobile-friendly navigation bar
- **Loading States**: Spinner components for async operations
- **Alert System**: Contextual notifications for success, error, and warning states
- **Modal Dialogs**: Accessible modals for forms and confirmations

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| [React](https://reactjs.org/) | 19.x | UI component library |
| [Vite](https://vitejs.dev/) | 7.x | Build tool and dev server |
| [React Router](https://reactrouter.com/) | 7.x | Client-side routing |
| [Axios](https://axios-http.com/) | 1.x | HTTP client |
| [Recharts](https://recharts.org/) | 3.x | Data visualization |
| [React Icons](https://react-icons.github.io/react-icons/) | 5.x | Icon library |
| [date-fns](https://date-fns.org/) | 4.x | Date manipulation |
| [Bootstrap](https://getbootstrap.com/) | 5.x | CSS framework |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| [FastAPI](https://fastapi.tiangolo.com/) | 0.115+ | Web framework |
| [SQLAlchemy](https://www.sqlalchemy.org/) | 2.x | ORM and database toolkit |
| [Pydantic](https://pydantic-docs.helpmanual.io/) | 2.x | Data validation |
| [Uvicorn](https://www.uvicorn.org/) | 0.30+ | ASGI server |
| [PostgreSQL](https://www.postgresql.org/) | 12+ | Primary database |
| [SQLite](https://www.sqlite.org/) | - | Testing database (in-memory) |

### Testing

| Technology | Purpose |
|------------|---------|
| [pytest](https://pytest.org/) | Backend unit/integration tests |
| [pytest-cov](https://pytest-cov.readthedocs.io/) | Coverage reporting |
| [Vitest](https://vitest.dev/) | Frontend unit tests |
| [Playwright](https://playwright.dev/) | End-to-end testing |
| [Factory Boy](https://factoryboy.readthedocs.io/) | Test data generation |
| [Testing Library](https://testing-library.com/) | React testing utilities |

---

## Prerequisites

Before installing HRMS Lite, ensure you have the following installed:

| Requirement | Minimum Version | Verification Command |
|-------------|-----------------|---------------------|
| Python | 3.11+ | `python --version` |
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| PostgreSQL | 12+ | `psql --version` |
| Git | 2.x | `git --version` |

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/abhayror17/hrms-lite.git
cd hrms-lite
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
```

Edit the `.env` file with your database credentials:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/hrms_lite
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

Create the PostgreSQL database:

```bash
# Using psql
psql -U postgres
CREATE DATABASE hrms_lite;
\q

# Or using createdb
createdb -U postgres hrms_lite
```

Initialize and start the server:

```bash
# Start the development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at:
- **API**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 3. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at http://localhost:5173

---

## Usage Guide

### Dashboard

The dashboard provides a real-time overview of your HR data:

1. **Statistics Cards**: View total employees, department count, attendance rate, and today's present count
2. **Attendance Chart**: Pie chart showing today's attendance breakdown (Present/Absent/Not Marked)
3. **Department Chart**: Horizontal bar chart showing employee distribution across departments
4. **Recent Employees**: Quick list of the 5 most recently added employees

### Managing Employees

**Adding an Employee:**

1. Navigate to **Employees** page
2. Click **Add Employee** button
3. Fill in the required fields:
   - **Employee ID**: Unique identifier (e.g., EMP001)
   - **Full Name**: Employee's full name
   - **Email**: Valid email address (must be unique)
   - **Department**: Department name
4. Click **Add Employee** to save

**Editing an Employee:**

1. Click the **Edit** (pencil) icon on the employee row
2. Modify the desired fields
3. Click **Update** to save changes

**Deleting an Employee:**

1. Click the **Delete** (trash) icon on the employee row
2. Confirm the deletion in the modal dialog
3. Note: This will also delete all attendance records for this employee

### Managing Attendance

**Marking Attendance:**

1. Navigate to **Attendance** page
2. Click **Mark Attendance** button
3. Select the employee from the dropdown
4. Choose the date (cannot be in the future)
5. Select status: **Present** or **Absent**
6. Click **Mark Attendance** to save

**Filtering Attendance Records:**

Use the filter options at the top of the attendance page:
- **Employee**: Filter by specific employee
- **From Date**: Start of date range
- **To Date**: End of date range
- **Status**: Filter by Present or Absent

---

## API Reference

For complete API documentation, see [API.md](API.md) or visit the interactive documentation at `/docs` when running the backend.

### Quick Reference

#### Employees API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/employees/` | Create a new employee |
| `GET` | `/api/employees/` | List all employees (with optional filters) |
| `GET` | `/api/employees/{id}` | Get employee by UUID |
| `PUT` | `/api/employees/{id}` | Update employee |
| `DELETE` | `/api/employees/{id}` | Delete employee |
| `GET` | `/api/employees/{id}/summary` | Get attendance summary |
| `GET` | `/api/employees/dashboard/stats` | Get dashboard statistics |

#### Attendance API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/attendance/` | Mark attendance |
| `GET` | `/api/attendance/` | List attendance records (with filters) |
| `GET` | `/api/attendance/today` | Get today's attendance for all employees |
| `GET` | `/api/attendance/employee/{id}` | Get attendance for specific employee |
| `PUT` | `/api/attendance/{id}` | Update attendance status |
| `DELETE` | `/api/attendance/{id}` | Delete attendance record |

---

## Testing

### Backend Tests

```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_routes_employees.py -v

# Run with markers
pytest -m unit
pytest -m integration
```

### Frontend Tests

```bash
cd frontend

# Run unit tests
npm run test

# Run tests once (CI mode)
npm run test:run

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Coverage Requirements

The project enforces minimum coverage thresholds:
- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 60%
- **Statements**: 70%

---

## Deployment

### Backend (Render)

1. **Create PostgreSQL Database**:
   - Go to Render Dashboard → New → PostgreSQL
   - Note the Internal Database URL

2. **Create Web Service**:
   - Go to New → Web Service
   - Connect your GitHub repository
   - Configure:
     - **Root Directory**: `backend`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Set Environment Variables**:
   ```
   DATABASE_URL=<internal-postgres-url>
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```

### Frontend (Vercel)

1. **Import Project**:
   - Go to Vercel Dashboard → Import Project
   - Connect your GitHub repository

2. **Configure**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite

3. **Set Environment Variables**:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```

---

## Project Structure

```
hrms-lite/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── database.py          # Database configuration
│   │   ├── enums.py             # Enum definitions (AttendanceStatus)
│   │   ├── models/              # SQLAlchemy ORM models
│   │   │   ├── __init__.py
│   │   │   ├── employee.py      # Employee model
│   │   │   └── attendance.py    # Attendance model
│   │   ├── routes/              # API route handlers
│   │   │   ├── __init__.py
│   │   │   ├── employees.py     # Employee endpoints
│   │   │   └── attendance.py    # Attendance endpoints
│   │   └── schemas/             # Pydantic schemas
│   │       ├── __init__.py
│   │       ├── employee.py      # Employee DTOs
│   │       └── attendance.py    # Attendance DTOs
│   ├── tests/                   # Test suite
│   │   ├── conftest.py          # Pytest fixtures
│   │   ├── factories.py         # Factory Boy factories
│   │   └── test_*.py            # Test modules
│   ├── requirements.txt         # Python dependencies
│   ├── pytest.ini               # Pytest configuration
│   └── .env.example             # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Root component
│   │   ├── main.jsx             # Application entry
│   │   ├── index.css            # Global styles
│   │   ├── components/          # Reusable components
│   │   │   ├── Alerts.jsx       # Alert notification system
│   │   │   ├── BottomNav.jsx    # Mobile navigation
│   │   │   ├── EmptyState.jsx   # Empty state placeholder
│   │   │   ├── Modal.jsx        # Modal dialog
│   │   │   ├── Navbar.jsx       # Top navigation
│   │   │   └── Spinner.jsx      # Loading spinner
│   │   ├── context/             # React context providers
│   │   │   └── AlertContext.jsx # Alert state management
│   │   ├── pages/               # Page components
│   │   │   ├── Dashboard.jsx    # Dashboard page
│   │   │   ├── Employees.jsx    # Employee management
│   │   │   └── Attendance.jsx   # Attendance management
│   │   ├── services/            # API service layer
│   │   │   └── api.js           # Axios configuration
│   │   └── tests/               # Frontend tests
│   ├── e2e/                     # Playwright E2E tests
│   ├── package.json             # NPM configuration
│   ├── vite.config.js           # Vite configuration
│   └── vitest.config.js         # Vitest configuration
│
├── .github/
│   └── workflows/
│       └── test.yml             # CI/CD pipeline
│
├── README.md                    # This file
├── ARCHITECTURE.md              # Architecture documentation
├── API.md                       # API reference
├── CONTRIBUTING.md              # Contribution guidelines
└── CHANGELOG.md                 # Version history
```

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Development environment setup
- Code style guidelines
- Commit message conventions
- Pull request process
- Testing requirements

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/) - modern, fast web framework for Python
- UI powered by [React](https://reactjs.org/) and [Vite](https://vitejs.dev/)
- Charts by [Recharts](https://recharts.org/)
- Icons from [React Icons](https://react-icons.github.io/react-icons/)

---

<p align="center">
  <strong>Built with ❤️ for modern HR management</strong>
</p>