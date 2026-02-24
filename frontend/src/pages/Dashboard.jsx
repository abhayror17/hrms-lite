import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaBuilding, FaUserCheck, FaUserTimes, FaClock, FaChartLine, FaArrowRight } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { employeeService } from '../services/api';
import { useAlert } from '../context/AlertContext';
import Spinner from '../components/Spinner';
import './Dashboard.css';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];
const ATTENDANCE_COLORS = {
  present: '#10b981',
  absent: '#ef4444',
  not_marked: '#f59e0b'
};

function Dashboard() {
  const { error } = useAlert();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getDashboardStats();
      setStats(response.data);
    } catch (err) {
      error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <Spinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const attendanceData = stats?.today_attendance ? [
    { name: 'Present', value: stats.today_attendance.present, color: ATTENDANCE_COLORS.present },
    { name: 'Absent', value: stats.today_attendance.absent, color: ATTENDANCE_COLORS.absent },
    { name: 'Not Marked', value: stats.today_attendance.not_marked, color: ATTENDANCE_COLORS.not_marked }
  ] : [];

  const departmentData = stats?.departments?.map(dept => ({
    name: dept.name,
    value: dept.count
  })) || [];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your HRMS system</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card total-employees">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>{stats?.total_employees || 0}</h3>
            <p>Total Employees</p>
          </div>
        </div>

        <div className="stat-card departments">
          <div className="stat-icon">
            <FaBuilding />
          </div>
          <div className="stat-content">
            <h3>{stats?.departments?.length || 0}</h3>
            <p>Departments</p>
          </div>
        </div>

        <div className="stat-card attendance-rate">
          <div className="stat-icon">
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>{stats?.overall_attendance_rate || 0}%</h3>
            <p>Overall Attendance Rate</p>
          </div>
        </div>

        <div className="stat-card today-present">
          <div className="stat-icon">
            <FaUserCheck />
          </div>
          <div className="stat-content">
            <h3>{stats?.today_attendance?.present || 0}</h3>
            <p>Present Today</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card chart-card">
          <div className="card-header-custom">
            <h2>Today's Attendance Overview</h2>
            <span className="date-badge">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="attendance-footer">
            <Link to="/attendance" className="card-link">
              View Detailed Attendance <FaArrowRight />
            </Link>
          </div>
        </div>

        <div className="dashboard-card chart-card">
          <div className="card-header-custom">
            <h2>Employees by Department</h2>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={departmentData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="attendance-footer">
            <Link to="/employees" className="card-link">
              Manage Employees <FaArrowRight />
            </Link>
          </div>
        </div>

        <div className="dashboard-card recent-employees">
          <div className="card-header-custom">
            <h2>Recently Added Employees</h2>
          </div>
          {stats?.recent_employees?.length > 0 ? (
            <div className="recent-list">
              {stats.recent_employees.map((emp) => (
                <div key={emp.id} className="recent-item">
                  <div className="employee-avatar">
                    {emp.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="employee-info">
                    <span className="employee-name">{emp.full_name}</span>
                    <span className="employee-dept">{emp.department}</span>
                  </div>
                  <span className="employee-id-badge">{emp.employee_id}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">No employees added yet</div>
          )}
          <div className="attendance-footer pt-3">
            <Link to="/employees" className="card-link">
              View All Employees <FaArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
