import { useState, useEffect } from 'react';
import { Plus, X, Users } from 'lucide-react';
import { employeeApi } from '../services/api';
import AddEmployeeForm from '../components/employees/AddEmployeeForm';
import EmployeeList from '../components/employees/EmployeeList';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import './Employees.css';

export default function Employees() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await employeeApi.getAll();
            setEmployees(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="employees-page">
            <div className="page-header">
                <div className="header-info">
                    <div className="header-icon">
                        <Users size={24} />
                    </div>
                    <div>
                        <h1>Employees</h1>
                        <p>Manage your organization's workforce</p>
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
                            Add Employee
                        </>
                    )}
                </button>
            </div>

            {isFormVisible && (
                <AddEmployeeForm 
                    onEmployeeAdded={() => {
                        loadEmployees();
                        setIsFormVisible(false);
                    }} 
                />
            )}

            <div className="employees-content card">
                <div className="section-header">
                    <h2>All Employees</h2>
                    <span className="count-badge">{employees.length}</span>
                </div>
                {loading ? (
                    <Loading />
                ) : error ? (
                    <ErrorMessage message={error} onRetry={loadEmployees} />
                ) : (
                    <EmployeeList employees={employees} onEmployeeDeleted={loadEmployees} />
                )}
            </div>
        </div>
    );
}