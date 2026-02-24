# HRMS Lite - Human Resource Management System

A modern, full-stack web application for managing employee records and tracking daily attendance. Built with React, FastAPI, and PostgreSQL.

## 🌟 Features

### Employee Management
- ✅ Add new employees with validation
- ✅ View all employees in a card-based layout
- ✅ Search employees by name, ID, email, or department
- ✅ Delete employee records
- ✅ Duplicate employee ID and email prevention

### Attendance Management
- ✅ Mark daily attendance (Present/Absent)
- ✅ View attendance records in table format
- ✅ Filter attendance by employee name or date
- ✅ Prevent duplicate attendance for the same date
- ✅ Automatic date validation

### Dashboard
- ✅ Real-time statistics overview
- ✅ Total employees count
- ✅ Today's attendance summary
- ✅ Present/Absent counts
- ✅ Interactive charts with Recharts

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Recharts** - Data visualization
- **Bootstrap 5** - UI framework
- **CSS3** - Custom styling with glassmorphism

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **PostgreSQL** - Relational database
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **PostgreSQL** 12+

## 🚀 Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/abhayror17/hrms-lite.git
cd hrms-lite
```

### 2. Backend Setup

```bash
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
copy .env.example .env

# Edit .env and update DATABASE_URL with your PostgreSQL credentials
# Example: DATABASE_URL=postgresql://username:password@localhost:5432/hrms_lite

# Create database (in PostgreSQL)
# psql -U postgres
# CREATE DATABASE hrms_lite;

# Run the server
uvicorn app.main:app --reload
```

The backend API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative Docs: `http://localhost:8000/redoc`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file if needed
# Default API URL: http://localhost:8000

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
hrms-lite/
├── backend/
│   ├── app/
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── employee.py
│   │   │   └── attendance.py
│   │   ├── routes/              # API endpoints
│   │   │   ├── employees.py
│   │   │   └── attendance.py
│   │   ├── schemas/             # Pydantic schemas
│   │   │   ├── employee.py
│   │   │   └── attendance.py
│   │   ├── main.py              # FastAPI app entry
│   │   ├── database.py          # Database configuration
│   │   └── enums.py             # Enum definitions
│   ├── requirements.txt
│   ├── runtime.txt              # Python version for Render
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API service layer
│   │   ├── context/             # React context
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── database_setup.sql
├── ARCHITECTURE.md
└── README.md
```

## 🔌 API Endpoints

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/employees` | Create new employee |
| GET | `/api/employees` | Get all employees |
| GET | `/api/employees/{id}` | Get employee by ID |
| PUT | `/api/employees/{id}` | Update employee |
| DELETE | `/api/employees/{id}` | Delete employee |
| GET | `/api/employees/{id}/summary` | Get attendance summary |
| GET | `/api/employees/dashboard/stats` | Get dashboard statistics |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attendance` | Mark attendance |
| GET | `/api/attendance` | Get all attendance records |
| GET | `/api/attendance/today` | Get today's attendance |
| GET | `/api/attendance/employee/{id}` | Get employee attendance |
| PUT | `/api/attendance/{id}` | Update attendance status |
| DELETE | `/api/attendance/{id}` | Delete attendance record |

## 🎨 UI Features

- 🌙 Light theme with gradient accents
- ✨ Smooth animations and transitions
- 📱 Fully responsive mobile design
- 🎯 Intuitive navigation with bottom nav bar
- 💫 Loading states and error handling
- 🔍 Search and filter functionality
- 📊 Interactive charts and visualizations

## 🚢 Deployment

### Backend (Render)

1. Create a PostgreSQL database on Render
2. Create a Web Service:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Set environment variables:
   - `DATABASE_URL` - Internal Database URL
   - `CORS_ORIGINS` - Your frontend URL

### Frontend (Vercel)

1. Import project from GitHub
2. **Root Directory**: `frontend`
3. Set environment variable:
   - `VITE_API_URL` - Your backend URL

## 🔒 Validation & Error Handling

### Backend Validations
- ✅ Email format validation
- ✅ Duplicate employee ID check
- ✅ Duplicate email check
- ✅ Employee existence check for attendance
- ✅ Duplicate attendance prevention (same date)

### Frontend Validations
- ✅ Required field validation
- ✅ Email format validation
- ✅ Date picker with max date (today)
- ✅ Form state management
- ✅ Error message display

## 📝 Assumptions & Limitations

### Assumptions
- Single admin user (no authentication required)
- Attendance can only be marked for dates up to today
- One attendance record per employee per day
- Employee deletion cascades to attendance records

### Limitations
- No user authentication/authorization
- No attendance editing (only create and view)
- No payroll or leave management
- No file uploads or document management

## 👨‍💻 Development Commands

**Backend:**
```bash
uvicorn app.main:app --reload          # Development server
uvicorn app.main:app --host 0.0.0.0    # Production server
```

**Frontend:**
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

## 🔗 Live URLs

- **Frontend**: [Vercel URL]
- **Backend API**: [Render URL]
- **API Docs**: [Render URL]/docs
- **GitHub**: https://github.com/abhayror17/hrms-lite

## 📄 License

MIT License

---

**Built with ❤️ using React + FastAPI + PostgreSQL**
