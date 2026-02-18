import { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Search, Calendar, User, Clock, CheckCircle, XCircle, Filter, X } from 'lucide-react';
import EmptyState from '../common/EmptyState';
import './AttendanceList.css';

export default function AttendanceList({ attendances }) {
    const [filterEmployee, setFilterEmployee] = useState('');
    const [filterDate, setFilterDate] = useState(null);

    const filteredAttendances = useMemo(() => {
        return attendances.filter(att => {
            const matchesEmployee = !filterEmployee || att.employee_name.toLowerCase().includes(filterEmployee.toLowerCase());
            
            if (!filterDate) return matchesEmployee;

            const attDate = new Date(att.date);
            if (filterDate.type === 'day') {
                return matchesEmployee && format(attDate, 'yyyy-MM-dd') === filterDate.value;
            }
            if (filterDate.type === 'week') {
                return matchesEmployee && isWithinInterval(attDate, { start: filterDate.start, end: filterDate.end });
            }
            if (filterDate.type === 'month') {
                return matchesEmployee && isWithinInterval(attDate, { start: filterDate.start, end: filterDate.end });
            }
            return matchesEmployee;
        });
    }, [attendances, filterEmployee, filterDate]);

    const setDateFilter = (type) => {
        const today = new Date();
        if (type === 'today') {
            setFilterDate({ type: 'day', value: format(today, 'yyyy-MM-dd') });
        } else if (type === 'this_week') {
            setFilterDate({ type: 'week', start: startOfWeek(today, { weekStartsOn: 1 }), end: endOfWeek(today, { weekStartsOn: 1 }) });
        } else if (type === 'this_month') {
            setFilterDate({ type: 'month', start: startOfMonth(today), end: endOfMonth(today) });
        } else {
            setFilterDate(null);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return format(date, 'MMM d, yyyy');
    };

    const clearFilters = () => {
        setFilterDate(null);
        setFilterEmployee('');
    };

    const getAvatarColor = (name) => {
        const colors = [
            'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
            'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
            'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
            'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
            'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div className="attendance-list-container">
            {/* Filters */}
            <div className="filters-wrapper">
                <div className="search-filter">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by employee name..."
                        value={filterEmployee}
                        onChange={(e) => setFilterEmployee(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="date-filter-group">
                    <Filter size={16} className="filter-icon" />
                    <div className="date-buttons">
                        <button 
                            onClick={() => setDateFilter('today')} 
                            className={`filter-btn ${filterDate?.type === 'day' ? 'active' : ''}`}
                        >
                            Today
                        </button>
                        <button 
                            onClick={() => setDateFilter('this_week')} 
                            className={`filter-btn ${filterDate?.type === 'week' ? 'active' : ''}`}
                        >
                            This Week
                        </button>
                        <button 
                            onClick={() => setDateFilter('this_month')} 
                            className={`filter-btn ${filterDate?.type === 'month' ? 'active' : ''}`}
                        >
                            This Month
                        </button>
                    </div>
                    {(filterDate || filterEmployee) && (
                        <button onClick={clearFilters} className="clear-btn">
                            <X size={14} />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Summary */}
            {filteredAttendances.length > 0 && (
                <div className="attendance-stats">
                    <div className="stat-item">
                        <span className="stat-number">{filteredAttendances.length}</span>
                        <span className="stat-text">Total Records</span>
                    </div>
                    <div className="stat-item stat-present">
                        <CheckCircle size={16} />
                        <span className="stat-number">{filteredAttendances.filter(a => a.status === 'Present').length}</span>
                        <span className="stat-text">Present</span>
                    </div>
                    <div className="stat-item stat-absent">
                        <XCircle size={16} />
                        <span className="stat-number">{filteredAttendances.filter(a => a.status === 'Absent').length}</span>
                        <span className="stat-text">Absent</span>
                    </div>
                </div>
            )}

            {/* Content */}
            {filteredAttendances.length === 0 ? (
                <EmptyState
                    icon={<Calendar size={48} strokeWidth={1.5} />}
                    title="No attendance records found"
                    message={filterDate || filterEmployee ? "Try adjusting your filters" : "Mark attendance to see records here"}
                />
            ) : (
                <div className="attendance-table-wrapper card">
                    <table className="attendance-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Marked At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAttendances.map((attendance) => (
                                <tr key={attendance.id}>
                                    <td className="employee-cell">
                                        <div 
                                            className="employee-avatar"
                                            style={{ background: getAvatarColor(attendance.employee_name) }}
                                        >
                                            {attendance.employee_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="employee-info">
                                            <span className="employee-name">{attendance.employee_name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="date-cell">
                                            <Calendar size={14} />
                                            {formatDate(attendance.date)}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${attendance.status === 'Present' ? 'status-present' : 'status-absent'}`}>
                                            {attendance.status === 'Present' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {attendance.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="time-cell">
                                            <Clock size={14} />
                                            {format(new Date(attendance.created_at), 'PPp')}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}