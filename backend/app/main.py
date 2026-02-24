import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .routes import employees_router, attendance_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    init_db()
    yield

app = FastAPI(
    title="HRMS Lite API",
    description="A lightweight Human Resource Management System API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS from environment variable
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173")
allowed_origins = [origin.strip() for origin in cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(employees_router)
app.include_router(attendance_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to HRMS Lite API",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "hrms-lite-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
