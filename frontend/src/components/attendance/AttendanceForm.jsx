import { useState, useEffect } from 'react';
import { CalendarCheck, User, Calendar, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { attendanceApi, employeeApi } from '../../services/api';
import './AttendanceForm.css';

export default function AttendanceForm({ onAttendanceMarked }) {
    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        employee_id: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Present'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const data = await employeeApi.getAll();
                setEmployees(data);
            } catch (err) {
                setError('Failed to load employees. Please try again.');
            }
        };
        loadEmployees();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await attendanceApi.markAttendance({
                ...formData,
                employee_id: parseInt(formData.employee_id)
            });
            setSuccess('Attendance marked successfully!');
            
            setTimeout(() => {
                setFormData({
                    employee_id: '',
                    date: new Date().toISOString().split('T')[0],
                    status: 'Present'
                });
                setSuccess('');
                if (onAttendanceMarked) {
                    onAttendanceMarked();
                }
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.detail || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="attendance-form card">
            <div className="form-header">
                <div className="form-icon">
                    <CalendarCheck size={20} />
                </div>
                <div>
                    <h3>Mark Attendance</h3>
                    <p>Record daily attendance for employees</p>
                </div>
            </div>

            {error && (
                <div className="form-error">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="form-success">
                    <CheckCircle size={16} />
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="label">
                            <User size={14} />
                            Employee
                        </label>
                        <select
                            name="employee_id"
                            value={formData.employee_id}
                            onChange={handleChange}
                            className="input"
                            required
                        >
                            <option value="" disabled>Select an employee</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.full_name} ({emp.employee_id})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="label">
                            <Calendar size={14} />
                            Date
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="input"
                            max={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    <div className="form-group full-width">
                        <label className="label">Status</label>
                        <div className="status-buttons">
                            <button
                                type="button"
                                className={`status-btn ${formData.status === 'Present' ? 'active-present' : ''}`}
                                onClick={() => setFormData({ ...formData, status: 'Present' })}
                            >
                                <CheckCircle size={18} />
                                Present
                            </button>
                            <button
                                type="button"
                                className={`status-btn ${formData.status === 'Absent' ? 'active-absent' : ''}`}
                                onClick={() => setFormData({ ...formData, status: 'Absent' })}
                            >
                                <XCircle size={18} />
                                Absent
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary submit-btn"
                    disabled={loading || !formData.employee_id}
                >
                    {loading ? (
                        <>
                            <Loader2 size={18} className="spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <CalendarCheck size={18} />
                            Submit Attendance
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}