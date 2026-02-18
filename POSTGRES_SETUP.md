# HRMS Lite - PostgreSQL Setup Guide

This guide details how to configure a local PostgreSQL environment for the HRMS Lite application.

---

## 🛠️ Step 1: Installation
### Download & Install
1. **Download**: Visit [PostgreSQL Downloads](https://www.postgresql.org/download/windows/) and get the latest version (v15 or v16 recommended).
2. **Setup**: Run the installer and keep all default components selected.
3. **Password**: Set a master password for the `postgres` user (e.g., `12345678`).
4. **Port**: Use the default port `5432`.

---

## 🏗️ Step 2: Database Configuration
You need to create a dedicated user and database that matches the application's configuration.

### Option A: Using pgAdmin (GUI)
1. **Open pgAdmin 4**.
2. **Create User**:
   - Right-click **Login/Group Roles** → Create → Login/Group Role.
   - **General Tab**: Name = `dev_admin`.
   - **Definition Tab**: Password = `db_password`.
   - **Privileges Tab**: Enable "Can login?" and "Superuser".
3. **Create Database**:
   - Right-click **Databases** → Create → Database.
   - **Name**: `hrms_db`.
   - **Owner**: `dev_admin`.

### Option B: Using SQL Shell (psql)
Run the following commands:
```sql
CREATE USER dev_admin WITH PASSWORD 'db_password';
ALTER USER dev_admin WITH SUPERUSER;
CREATE DATABASE hrms_db OWNER dev_admin;
```

---

## 🔗 Step 3: Update Application Environment
Ensure your `backend/.env` file matches these credentials:
```env
DATABASE_URL=postgresql://dev_admin:db_password@localhost:5432/hrms_db
```

---

## 🧪 Step 4: Verification
1. Open a terminal in the `backend` folder.
2. Activate your virtual environment.
3. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```
4. If you see "Uvicorn running on http://127.0.0.1:8000" without errors, your database is connected!

---

## 🔧 Troubleshooting
- **Connection Refused**: Ensure the "postgresql-x64-x" service is running in Windows Services (`services.msc`).
- **Auth Failed**: Double-check the username and password in your `.env` file.
- **DB Not Found**: Ensure you created the database named exactly `hrms_db`.

---
📖 **Back to [README.md](./README.md)**
