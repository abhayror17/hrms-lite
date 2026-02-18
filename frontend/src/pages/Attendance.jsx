import { useState, useEffect } from 'react';
import { Plus, X, CalendarCheck } from 'lucide-react';
import { attendanceApi } from '../services/api';
import AttendanceForm from '../components/attendance/AttendanceForm';
import AttendanceList from '../components/attendance/AttendanceList';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import './Attendance.css';

export default function Attendance() {
    const [attendances, setAttendances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);

    useEffect(() => {
        loadAttendances();
    }, []);

    const loadAttendances = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await attendanceApi.getAll();
            setAttendances(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="attendance-page">
            <div className="page-header">
                <div className="header-info">
                    <div className="header-icon attendance-icon">
                        <CalendarCheck size={24} />
                    </div>
                    <div>
                        <h1>Attendance</h1>
                        <p>Track daily employee attendance</p>
                    </div>
                </div>
                <button 
                    className={`btn ${isFormVisible ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => setIsFormVisible(!isFormVisible)}
                >
                    {isFormVisible ? (
                        <>
                            <X size={18} />
                            Close
                        </>
                    ) : (
                        <>
                            <Plus size={18} />
                            Mark Attendance
                        </>
                    )}
                </button>
            </div>
            
            {isFormVisible && (
                <AttendanceForm 
                    onAttendanceMarked={() => {
                        loadAttendances();
                        setIsFormVisible(false);
                    }} 
                />
            )}

            <div className="attendance-content">
                {loading ? (
                    <div className="card"><Loading /></div>
                ) : error ? (
                    <ErrorMessage message={error} onRetry={loadAttendances} />
                ) : (
                    <AttendanceList attendances={attendances} />
                )}
            </div>
        </div>
    );
}