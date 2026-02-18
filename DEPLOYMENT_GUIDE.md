# HRMS Lite - Deployment Guide

Professional deployment workflow for putting HRMS Lite into production.

---

## 🏗️ Recommended Architecture
- **Backend & Database**: [Render](https://render.com) (Free Tier)
- **Frontend**: [Vercel](https://vercel.com) (Free Tier)

---

## 📦 Phase 1: Code Preparation
Ensure your code is clean and ready for version control.

1. **Initialize Git**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial production-ready commit"
   ```
2. **Push to GitHub**:
   - Create a new repository on GitHub.
   - Run the provided `git remote add origin...` commands.

---

## 🚀 Phase 2: Backend Deployment (Render)

### 1. Database Setup
1. Create a **New PostgreSQL** instance on Render.
2. Name it `hrms-lite-db`.
3. Scroll to "Connections" and copy the **Internal Database URL**.

### 2. Web Service Setup
1. Create a **New Web Service** and connect your GitHub repo.
2. **Root Directory**: `backend`
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Environment Variables**:
   - `DATABASE_URL`: (The URL you copied above)
   - `CORS_ORIGINS`: `*` (Change this to your Vercel URL after it's live)

---

## 💻 Phase 3: Frontend Deployment (Vercel)

1. Create a **New Project** on Vercel and import your repo.
2. **Framework Preset**: Vite.
3. **Root Directory**: `frontend`.
4. **Build Command**: `npm run build`.
5. **Output Directory**: `dist`.
6. **Environment Variable**: 
   - `VITE_API_URL`: (Your live Render backend URL).

---

## 🛡️ Phase 4: Security (CORS)
Once your Vercel site is live:
1. Copy the Vercel URL (e.g., `https://hrms-lite.vercel.app`).
2. Go back to Render → Environment.
3. Update `CORS_ORIGINS` to match your Vercel URL exactly.
4. Save changes.

---

## ✅ Deployment Checklist
- [ ] Database is reachable.
- [ ] Backend `/docs` endpoint loads successfully.
- [ ] Frontend displays the correct API URL in browser logs.
- [ ] Employee creation and attendance logging tested on live site.

---
**Congratulations! Your professional HRMS Lite is now live. 🚀**
