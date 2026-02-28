# Contributing to HRMS Lite

Thank you for your interest in contributing to HRMS Lite! This document provides guidelines and instructions for contributing to this project.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Requirements](#testing-requirements)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please be considerate of others and follow standard open-source community guidelines.

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

| Tool | Minimum Version | Purpose |
|------|-----------------|---------|
| Python | 3.11+ | Backend runtime |
| Node.js | 18+ | Frontend runtime |
| PostgreSQL | 12+ | Database |
| Git | 2.x | Version control |

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/hrms-lite.git
cd hrms-lite
```

3. Add upstream remote:

```bash
git remote add upstream https://github.com/abhayror17/hrms-lite.git
```

---

## Development Environment Setup

### Backend Setup

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

# Create .env file
copy .env.example .env   # Windows
cp .env.example .env     # macOS/Linux
```

Edit `.env` with your local database settings:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hrms_lite_dev
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

Create the development database:

```bash
createdb -U postgres hrms_lite_dev
```

Run the development server:

```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

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

## Project Structure

Understanding the project structure helps you know where to make changes:

```
hrms-lite/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── models/            # SQLAlchemy models (database entities)
│   │   ├── routes/            # API endpoints (route handlers)
│   │   ├── schemas/           # Pydantic schemas (validation/serialization)
│   │   ├── main.py            # Application entry point
│   │   ├── database.py        # Database configuration
│   │   └── enums.py           # Enum definitions
│   └── tests/                 # Backend tests
│       ├── conftest.py        # Pytest fixtures
│       ├── factories.py       # Test data factories
│       └── test_*.py          # Test modules
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page-level components
│   │   ├── services/          # API service layer
│   │   ├── context/           # React context providers
│   │   └── tests/             # Frontend unit tests
│   └── e2e/                   # Playwright E2E tests
│
└── .github/
    └── workflows/
        └── test.yml           # CI/CD pipeline
```

### Where to Make Changes

| What you're changing | Where to look |
|---------------------|---------------|
| Add new API endpoint | `backend/app/routes/` |
| Add new database model | `backend/app/models/` |
| Add validation schema | `backend/app/schemas/` |
| Add new page | `frontend/src/pages/` |
| Add reusable component | `frontend/src/components/` |
| Modify API calls | `frontend/src/services/api.js` |

---

## Development Workflow

### 1. Create a Branch

Create a feature branch from `main`:

```bash
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features (e.g., `feature/add-leave-management`)
- `fix/` - Bug fixes (e.g., `fix/attendance-date-validation`)
- `docs/` - Documentation changes (e.g., `docs/api-documentation`)
- `refactor/` - Code refactoring (e.g., `refactor/employee-service`)

### 2. Make Your Changes

- Write clean, well-documented code
- Follow the code style guidelines
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

Run the relevant test suites:

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm run test

# E2E tests
cd frontend
npm run test:e2e
```

### 4. Commit Your Changes

Follow the commit message guidelines below.

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Create a pull request on GitHub.

---

## Code Style Guidelines

### Python (Backend)

Follow PEP 8 style guidelines with these specifics:

**Formatting**:
- Use 4 spaces for indentation
- Maximum line length: 88 characters (Black default)
- Use double quotes for strings

**Imports**:
```python
# Standard library
import os
from datetime import date

# Third-party
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# Local
from app.database import get_db
from app.models.employee import Employee
```

**Type Hints**:
```python
def get_employee(employee_id: str, db: Session = Depends(get_db)) -> EmployeeResponse:
    ...
```

**Docstrings**:
```python
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    """
    Create a new employee with validation.
    
    Args:
        employee: Employee creation schema with validated data
        db: Database session dependency
    
    Returns:
        EmployeeResponse: Created employee data
    
    Raises:
        HTTPException: 409 if employee_id or email already exists
    """
    ...
```

### JavaScript/React (Frontend)

**Formatting**:
- Use 2 spaces for indentation
- Use single quotes for strings (except in JSX)
- Use semicolons

**Component Structure**:
```jsx
function ComponentName({ prop1, prop2 }) {
  // 1. State declarations
  const [state, setState] = useState(initialValue);
  
  // 2. Effects
  useEffect(() => {
    // effect logic
  }, [dependencies]);
  
  // 3. Event handlers
  const handleClick = () => {
    // handler logic
  };
  
  // 4. Render
  return (
    <div className="component-name">
      {/* JSX */}
    </div>
  );
}

export default ComponentName;
```

**Naming Conventions**:
- Components: PascalCase (`EmployeeCard.jsx`)
- Functions: camelCase (`handleSubmit`)
- CSS classes: kebab-case (`employee-card`)

**Async/Await**:
```javascript
// Prefer async/await over .then()
const fetchData = async () => {
  try {
    const response = await api.get('/endpoint');
    setData(response.data);
  } catch (error) {
    handleError(error);
  }
};
```

---

## Testing Requirements

### Minimum Coverage

All contributions must maintain minimum coverage thresholds:

| Metric | Minimum |
|--------|---------|
| Lines | 70% |
| Functions | 70% |
| Branches | 60% |
| Statements | 70% |

### Backend Tests

**Location**: `backend/tests/`

**Running Tests**:
```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_routes_employees.py -v

# Run specific test
pytest tests/test_routes_employees.py::test_create_employee -v
```

**Writing Tests**:
```python
def test_create_employee(client, sample_employee_data):
    """Test employee creation endpoint."""
    response = client.post("/api/employees/", json=sample_employee_data)
    
    assert response.status_code == 201
    data = response.json()
    assert data["employee_id"] == sample_employee_data["employee_id"]
    assert data["email"] == sample_employee_data["email"].lower()
```

**Using Factories**:
```python
def test_with_factory(employee_factory):
    """Test using factory-generated data."""
    employee = employee_factory.create(
        full_name="Custom Name",
        department="Custom Dept"
    )
    assert employee.full_name == "Custom Name"
```

### Frontend Tests

**Location**: `frontend/src/tests/`

**Running Tests**:
```bash
cd frontend

# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run with coverage
npm run test:coverage
```

**Writing Component Tests**:
```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Component from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    render(<Component />);
    
    await user.click(screen.getByRole('button'));
    
    expect(screen.getByText('Result')).toBeInTheDocument();
  });
});
```

### E2E Tests

**Location**: `frontend/e2e/`

**Running Tests**:
```bash
cd frontend

# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

**Writing E2E Tests**:
```javascript
import { test, expect } from '@playwright/test';

test('should create employee', async ({ page }) => {
  await page.goto('/employees');
  
  await page.click('text=Add Employee');
  await page.fill('[name="employee_id"]', 'TEST001');
  await page.fill('[name="full_name"]', 'Test User');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="department"]', 'Testing');
  
  await page.click('text=Add Employee');
  
  await expect(page.locator('text=Employee added successfully')).toBeVisible();
});
```

---

## Commit Message Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, semicolons) |
| `refactor` | Code change without fix or feature |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies |

### Examples

```bash
# Feature
feat(attendance): add bulk attendance import

# Bug fix
fix(employees): prevent duplicate email on update

# Documentation
docs(api): update endpoint documentation

# Breaking change
feat(api)!: change employee ID format to UUID

BREAKING CHANGE: Employee IDs are now UUIDs instead of sequential numbers
```

### Commit Message Body

For complex changes, include a body:

```
fix(attendance): prevent marking attendance for future dates

Previously, users could mark attendance for future dates which
is not allowed. This fix adds server-side validation to reject
any date greater than today.

Fixes #123
```

---

## Pull Request Process

### Before Submitting

- [ ] Code compiles without errors
- [ ] All tests pass locally
- [ ] New code has test coverage
- [ ] Documentation is updated
- [ ] Commit messages follow guidelines

### PR Template

When creating a PR, include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No new warnings
```

### Review Process

1. Submit PR against `main` branch
2. CI checks must pass (tests, linting)
3. At least one approval required
4. Resolve all review comments
5. Squash and merge when approved

### CI Checks

All PRs must pass:
- Backend test suite
- Frontend test suite
- E2E tests (for UI changes)
- Coverage threshold

---

## Issue Reporting

### Bug Reports

When reporting bugs, include:

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen

**Actual Behavior**
What actually happened

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]
```

### Feature Requests

```markdown
**Problem**
Description of the problem this feature would solve

**Proposed Solution**
Description of the proposed solution

**Alternatives**
Any alternative solutions considered

**Additional Context**
Any other context or screenshots
```

---

## Getting Help

- **Documentation**: Check README.md and ARCHITECTURE.md
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions

---

Thank you for contributing to HRMS Lite! 🎉
