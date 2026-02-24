# HRMS Lite - Human Resource Management System

HRMS Lite is a professional, full-stack Human Resource Management System designed with a mobile-first approach. It provides organization-level workforce management through a clean, modern interface featuring real-time data visualizations and intuitive controls.

## 🚀 Recent Updates
*   **Data Infographics**: Integrated **Recharts** for visual analytics on the dashboard (Pie & Bar charts).
*   **Mobile-First Navigation**: Added a glassmorphic **Bottom Navigation Bar** for optimized mobile usage.
*   **Responsive Cards**: Refined mobile layouts for Employee and Attendance management.
*   **Global Alerts**: Implemented a prioritized notification system for real-time feedback.

## 🛠 Tech Stack

### Frontend
*   **React 19** with **Vite** (for blazing fast builds)
*   **Bootstrap 5** (Base UI framework)
*   **Vanilla CSS** (Custom high-fidelity styling & Glassmorphism)
*   **Recharts** (Interactive data infographics)
*   **React Icons** (Font-based iconography)
*   **Date-fns** (Advanced date manipulation)

### Backend
*   **FastAPI** (High-performance Python API)
*   **SQLAlchemy** (ORM for database interactions)
*   **Pydantic** (Data validation and settings management)
*   **PostgreSQL** (Relational database)

---

## 💻 Local Setup Instructions

### Prerequisites
*   **Python 3.9+**
*   **Node.js 18+**
*   **PostgreSQL 14+**
*   **Git**

### 1. Database Configuration
1.  Ensure PostgreSQL is running.
2.  Create a database named `hrms_lite`.
3.  (Optional) Execute `database_setup.sql` if you wish to pre-load the schema, though the backend will initialize the tables automatically on start.

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Ensure your DATABASE_URL in the .env file matches your local PG credentials
# Example: DATABASE_URL=postgresql://user:password@localhost:5432/hrms_lite

# Start the API server
python -m uvicorn app.main:app --reload
```
*   **API Docs**: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend

# Install Node packages
npm install

# Start the development server
npm run dev
```
*   **Local URL**: `http://localhost:5173`

---

## 📝 Assumptions and Limitations

### Assumptions
*   **PostgreSQL Availability**: The project assumes a running PostgreSQL instance reachable via the provided connection string in the `.env` file.
*   **Port Availability**: Assumes ports `8000` (Backend) and `5173` (Frontend) are free.
*   **Employee IDs**: Assumes Employee IDs are unique across the organization (enforced by DB constraints).

### Limitations
*   **Authentication**: This "Lite" version does not currently include a user login/authentication system. It is designed for internal network or single-operator use.
*   **Image Management**: No support for employee profile image uploads (uses auto-generated initials avatars).
*   **Database Search**: Search functionality is currently limited to basic string matching for name, ID, and email.
*   **Single Tenant**: The system is designed for a single organization/branch.

## 📂 Project Structure
*   `/backend`: FastAPI logic, models, and API routes.
*   `/frontend`: React components, custom styles, and Recharts integration.
*   `database_setup.sql`: SQL script for manual database setup.

---

## 📜 License
MIT License
