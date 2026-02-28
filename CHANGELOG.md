# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned Features
- User authentication and authorization
- Leave management module
- Payroll integration
- Report generation and export
- Bulk employee import
- Email notifications
- Audit logging

---

## [1.0.0] - 2026-02-28

### Added

#### Backend
- **Employee Management API**
  - Create, read, update, delete employees
  - Search and filter employees by name, ID, email, department
  - Duplicate prevention for employee ID and email
  - Employee attendance summary endpoint
  - UUID-based primary keys for scalability

- **Attendance Management API**
  - Mark daily attendance (Present/Absent)
  - Filter attendance by employee, date range, status
  - Today's attendance overview endpoint
  - Update and delete attendance records
  - Future date validation

- **Dashboard API**
  - Total employees count
  - Department breakdown statistics
  - Today's attendance summary (present, absent, not marked)
  - Overall attendance rate calculation
  - Recent employees list

- **Database**
  - PostgreSQL production database support
  - SQLAlchemy ORM with relationship mapping
  - Indexed columns for query optimization
  - Cascade delete for referential integrity

- **Validation & Error Handling**
  - Pydantic schemas for request/response validation
  - Custom field validators (employee_id uppercase, email lowercase)
  - Descriptive error messages for all failure cases
  - HTTP status code standards

#### Frontend
- **Dashboard Page**
  - Real-time statistics cards (employees, departments, attendance rate)
  - Interactive pie chart for today's attendance
  - Horizontal bar chart for department distribution
  - Recent employees list with navigation

- **Employees Page**
  - Employee table with responsive card view for mobile
  - Search functionality with real-time filtering
  - Add employee modal with form validation
  - Edit employee functionality
  - Delete confirmation modal
  - Quick navigation to employee attendance

- **Attendance Page**
  - Attendance records table with mobile card view
  - Filter by employee, date range, and status
  - Mark attendance modal with date picker
  - Present/Absent status selector
  - Delete attendance functionality
  - Today's date highlighting

- **Shared Components**
  - Navbar with desktop navigation
  - BottomNav for mobile navigation
  - Modal component for forms and confirmations
  - Alert system with auto-dismiss notifications
  - Spinner component for loading states
  - EmptyState component for no-data scenarios

- **Styling**
  - Dark theme with gradient accents
  - Responsive design for all screen sizes
  - Smooth animations and transitions
  - Touch-optimized mobile interactions

#### Testing
- **Backend Tests**
  - Pytest configuration with coverage reporting
  - Factory Boy factories for test data generation
  - Unit tests for routes and schemas
  - Integration tests for API endpoints
  - In-memory SQLite for fast test execution

- **Frontend Tests**
  - Vitest configuration with jsdom environment
  - React Testing Library for component tests
  - Coverage thresholds (70% minimum)
  - Mock API service layer

- **E2E Tests**
  - Playwright configuration
  - Dashboard, Employee, and Attendance flow tests
  - CI/CD integration

#### Infrastructure
- **CI/CD Pipeline**
  - GitHub Actions workflow
  - Automated test runs on push and PR
  - Coverage reporting to Codecov
  - E2E tests with PostgreSQL service

- **Deployment Configuration**
  - Render-ready backend configuration
  - Vercel-ready frontend configuration
  - Environment variable templates
  - Production build optimization

### Technical Details

#### Dependencies

**Backend**:
- FastAPI 0.115+
- SQLAlchemy 2.0+
- Pydantic 2.7+
- Uvicorn 0.30+
- PostgreSQL (via psycopg2-binary)
- pytest 8.0+ with coverage

**Frontend**:
- React 19.x
- Vite 7.x
- React Router 7.x
- Axios 1.x
- Recharts 3.x
- Bootstrap 5.x
- date-fns 4.x

#### Database Schema

```
employees
├── id (UUID, PK)
├── employee_id (VARCHAR, UQ)
├── full_name (VARCHAR)
├── email (VARCHAR, UQ)
├── department (VARCHAR)
├── is_active (BOOLEAN)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

attendance
├── id (UUID, PK)
├── employee_id (UUID, FK)
├── date (DATE)
├── status (ENUM)
└── created_at (TIMESTAMPTZ)
```

### Security

- CORS middleware with configurable origins
- Input validation on all API endpoints
- SQL injection prevention via SQLAlchemy ORM
- XSS prevention via React's automatic escaping

### Performance

- Indexed database columns for fast lookups
- Pagination support for list endpoints
- Optimized frontend bundle with Vite
- Lazy loading for React components

---

## Version History Summary

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-02-28 | Initial release with core HRMS features |

---

## Upgrade Guide

### To 1.0.0

This is the initial release. To set up:

1. Clone the repository
2. Set up PostgreSQL database
3. Configure environment variables
4. Install backend dependencies and run migrations
5. Install frontend dependencies
6. Start both servers

See [README.md](README.md) for detailed installation instructions.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to this project.

---

## Links

- [Repository](https://github.com/abhayror17/hrms-lite)
- [Issue Tracker](https://github.com/abhayror17/hrms-lite/issues)
- [Documentation](./README.md)

---

*This changelog is maintained manually. For detailed commit history, see the [Git history](https://github.com/abhayror17/hrms-lite/commits/main).*
