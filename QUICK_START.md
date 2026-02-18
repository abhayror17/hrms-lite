# ⚡ HRMS Lite - Quick Start Guide

This guide will get you up and running with HRMS Lite in less than 5 minutes.

---

## 🏁 Prerequisites Checklist
1. **Node.js** (v18+)
2. **Python** (v3.9+)
3. **PostgreSQL** (v12+)

---

## 🛠️ Step 1: Database Setup
### Using pgAdmin (Recommended)
1. Open **pgAdmin 4**.
2. Create a user: `postgres` with password `12345678`.
3. Create a database: `hrms_db` with `postgres` as the owner.

### Using Command Line
```sql
CREATE USER postgres WITH PASSWORD '12345678';
ALTER USER postgres WITH SUPERUSER;
CREATE DATABASE hrms_db OWNER postgres;
```

---

## 🚀 Step 2: Start Backend
Open a terminal in the project root:
```bash
cd backend
python -m venv venv

# Activate Virtual Env (Windows)
venv\Scripts\activate

# Install Dependencies
pip install -r requirements.txt

# Start Server
uvicorn app.main:app --reload
```
🔗 **Backend Portal:** [http://localhost:8000](http://localhost:8000)  
🔗 **Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 💻 Step 3: Start Frontend
Open a **new** terminal:
```bash
cd frontend
npm install
npm run dev
```
🔗 **Web Dashboard:** [http://localhost:5173](http://localhost:5173)

---

## 🧪 Step 4: Verify Installation
1. Navigate to the Web Dashboard.
2. Add a new employee (e.g., "John Doe", ID: EMP001).
3. Record their attendance for today.
4. Check the Dashboard to see the statistics update.

---

## 📖 Related Documentation
- [POSTGRES_SETUP.md](./POSTGRES_SETUP.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---
**HRMS Lite Development Team**
