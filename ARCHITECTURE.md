# HRMS Lite - System Architecture (MVC+)

## 🏛️ Architecture Overview

HRMS Lite is built using a decoupled, layered architecture to maintain high standards of code quality and scalability. The system follows an **MVC (Model-View-Controller)** pattern, augmented with specialized Service and Repository layers.

---

## 층 Layers of Responsibility

### 1. Data Layer (Models)
**Location**: `backend/app/models.py`
The source of truth for database entities.
- **Tools**: SQLAlchemy ORM.
- **Goal**: Define the physical storage structure and table relationships (e.g., One employee to many attendance records).

### 2. Data Access Layer (Repositories)
**Location**: `backend/app/repositories/`
The "Librarian" of the app.
- **Role**: Pure CRUD operations.
- **Benefit**: Decouples the database engine (SQLAlchemy) from the rest of the application.

### 3. Business Logic Layer (Services)
**Location**: `backend/app/services/`
The "Brain" of the system.
- **Role**: Validates business rules (e.g., "Email must be unique", "Attendance cannot be marked twice for the same day").
- **Benefit**: Centralizes rules in one place, making them easy to test.

### 4. API Layer (Controllers)
**Location**: `backend/app/controllers/`
The "Public Face" of the backend.
- **Role**: Handles HTTP requests, authentication, and status codes.
- **Benefit**: Keeps the API thin and focused only on communication.

### 5. Validation Layer (Schemas)
**Location**: `backend/app/schemas.py`
The "Policeman" for data entry.
- **Tools**: Pydantic.
- **Role**: Ensures that data coming into or leaving the API matches a specific format.

---

## 🔄 The Request Lifecycle

1. **Client** sends a request to a **Controller**.
2. **Controller** uses a **Schema** to validate the data format.
3. **Controller** passes validated data to a **Service**.
4. **Service** checks business rules (e.g., "Does this employee exist?").
5. **Service** tells a **Repository** to save/fetch data.
6. **Repository** interacts with a **Model** to talk to the Database.
7. The result flows back up the chain to the user.

---

## 🎨 Frontend Architecture
- **Framework**: React 18 (with Vite).
- **Style**: Professional Dark Theme using Vanilla CSS.
- **State**: Reactive hooks for data fetching and form management.
- **API Client**: Axios with centralized service modules.

---

## 🛡️ Design Decisions
- **FastAPI**: Chosen for its high performance and automatic OpenAPI (Swagger) documentation.
- **PostgreSQL**: Selected for robust ACID compliance and relational data integrity.
- **Monorepo**: Keeps frontend and backend in a single version-controlled repository for easier deployment synchronization.

---
📖 **See [README.md](./README.md) for setup instructions.**
