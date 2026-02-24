-- HRMS Lite Database Setup Script
-- Run this in pgAdmin4 or psql

-- Create database (run as superuser)
CREATE DATABASE hrms_lite;

-- Connect to hrms_lite database
\c hrms_lite;

-- The tables will be created automatically by SQLAlchemy when the backend starts
-- But you can also create them manually using this script:

CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS attendance (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('Present', 'Absent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

-- Insert sample data (optional)
INSERT INTO employees (id, employee_id, full_name, email, department) VALUES
    (gen_random_uuid(), 'EMP001', 'John Smith', 'john.smith@company.com', 'Engineering'),
    (gen_random_uuid(), 'EMP002', 'Sarah Johnson', 'sarah.johnson@company.com', 'Marketing'),
    (gen_random_uuid(), 'EMP003', 'Michael Chen', 'michael.chen@company.com', 'Finance'),
    (gen_random_uuid(), 'EMP004', 'Emily Davis', 'emily.davis@company.com', 'Human Resources'),
    (gen_random_uuid(), 'EMP005', 'David Wilson', 'david.wilson@company.com', 'Engineering');

-- Verify the setup
SELECT * FROM employees;
