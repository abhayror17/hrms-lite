import { useState, useEffect } from 'react';
import { employeeApi, attendanceApi } from '../services/api';
import { Users, UserCheck, UserX, CalendarDays, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import './Dashboard.css';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        todayAttendance: 0,
        presentToday: 0,
        absentToday: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        setError('');
        try {
            const employees = await employeeApi.getAll();
            const today = new Date().toISOString().split('T')[0];
            const todayAttendance = await attendanceApi.getAll(today);

            const presentCount = todayAttendance.filter(a => a.status === 'Present').length;
            const absentCount = todayAttendance.filter(a => a.status === 'Absent').length;

            setStats({
                totalEmployees: employees.length,
                todayAttendance: todayAttendance.length,
                presentToday: presentCount,
                absentToday: absentCount
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;
    if (error) return <ErrorMessage message={error} onRetry={loadDashboardData} />;

    const attendanceRate = stats.totalEmployees > 0
        ? Math.round((stats.presentToday / stats.totalEmployees) * 100)
        : 0;

    const statCards = [
        {
            icon: Users,
            value: stats.totalEmployees,
            label: 'Total Employees',
            color: 'primary',
            link: '/employees'
        },
        {
            icon: UserCheck,
            value: stats.presentToday,
            label: 'Present Today',
            color: 'success',
            link: '/attendance'
        },
        {
            icon: UserX,
            value: stats.absentToday,
            label: 'Absent Today',
            color: 'error',
            link: '/attendance'
        },
        {
            icon: CalendarDays,
            value: stats.todayAttendance,
            label: "Today's Records",
            color: 'warning',
            link: '/attendance'
        }
    ];

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>Dashboard</h1>
                    <p>Welcome back! Here's your HR overview for today.</p>
                </div>
                <div className="header-date">
                    <span className="date-label">Today</span>
                    <span className="date-value">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </span>
                </div>
            </div>

            {/* Attendance Rate Banner */}
            <div className="attendance-banner">
                <div className="banner-content">
                    <div className="banner-icon">
                        <Sparkles size={20} />
                    </div>
                    <div className="banner-text">
                        <span className="banner-label">Today's Attendance Rate</span>
                        <span className="banner-value">{attendanceRate}%</span>
                    </div>
                </div>
                <div className="attendance-progress">
                    <div
                        className="attendance-progress-fill"
                        style={{ width: `${attendanceRate}%` }}
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {statCards.map(({ icon: Icon, value, label, color, link }) => (
                    <Link to={link} key={label} className="stat-card card">
                        <div className={`stat-icon stat-icon-${color}`}>
                            <Icon size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{value}</span>
                            <span className="stat-label">{label}</span>
                        </div>
                        <div className="stat-arrow">
                            <ArrowRight size={18} />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="dashboard-section">
                <h2>Quick Actions</h2>
                <div className="quick-actions">
                    <Link to="/employees" className="quick-action-card">
                        <div className="action-icon action-icon-primary">
                            <Users size={22} />
                        </div>
                        <div className="action-content">
                            <span className="action-title">Manage Employees</span>
                            <span className="action-description">Add, view, and edit employee records</span>
                        </div>
                        <ArrowRight size={18} className="action-arrow" />
                    </Link>
                    <Link to="/attendance" className="quick-action-card">
                        <div className="action-icon action-icon-secondary">
                            <CalendarDays size={22} />
                        </div>
                        <div className="action-content">
                            <span className="action-title">Track Attendance</span>
                            <span className="action-description">Mark and monitor daily attendance</span>
                        </div>
                        <ArrowRight size={18} className="action-arrow" />
                    </Link>
                </div>
            </div>

            {/* Info Card */}
            <div className="dashboard-info card">
                <h3>Welcome to HRMS Lite</h3>
                <p>
                    Your centralized hub for human resource management. This lightweight yet powerful
                    system helps you manage employees and track attendance efficiently.
                </p>
                <div className="info-features">
                    <div className="info-feature">
                        <Users size={18} />
                        <span>Employee Management</span>
                    </div>
                    <div className="info-feature">
                        <CalendarDays size={18} />
                        <span>Attendance Tracking</span>
                    </div>
                    <div className="info-feature">
                        <UserCheck size={18} />
                        <span>Real-time Insights</span>
                    </div>
                </div>
            </div>
        </div>
    );
}