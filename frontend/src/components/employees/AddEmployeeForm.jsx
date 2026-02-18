import { useState, useEffect } from 'react';
import { UserPlus, Hash, User, Mail, Building2, Check, Loader2 } from 'lucide-react';
import { employeeApi } from '../../services/api';
import './EmployeeForm.css';

export default function AddEmployeeForm({ onEmployeeAdded }) {
    const [formData, setFormData] = useState({
        employee_id: '',
        full_name: '',
        email: '',
        department: ''
    });
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const depts = await employeeApi.getDepartments();
                if (depts && depts.length > 0) {
                    setDepartments(depts);
                } else {
                    setDepartments([
                        "Human Resources",
                        "Engineering",
                        "Marketing",
                        "Sales",
                        "Finance",
                        "IT"
                    ]);
                }
            } catch (err) {
                console.error("Failed to fetch departments:", err);
                setDepartments([
                    "Human Resources",
                    "Engineering",
                    "Marketing",
                    "Sales",
                    "Finance",
                    "IT"
                ]);
            }
        };
        fetchDepartments();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await employeeApi.create(formData);
            setSuccess('Employee added successfully!');

            setTimeout(() => {
                setFormData({
                    employee_id: '',
                    full_name: '',
                    email: '',
                    department: ''
                });
                setSuccess('');
                if (onEmployeeAdded) {
                    onEmployeeAdded();
                }
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.detail || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="employee-form card">
            <div className="form-header">
                <div className="form-icon">
                    <UserPlus size={20} />
                </div>
                <div>
                    <h3>Add New Employee</h3>
                    <p>Fill in the details to add a new team member</p>
                </div>
            </div>

            {error && (
                <div className="form-error">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="form-success">
                    <Check size={16} />
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label className="label">
                            <Hash size={14} />
                            Employee ID
                        </label>
                        <input
                            type="text"
                            name="employee_id"
                            value={formData.employee_id}
                            onChange={handleChange}
                            className="input"
                            placeholder="e.g., EMP001"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">
                            <User size={14} />
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            className="input"
                            placeholder="e.g., John Doe"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">
                            <Mail size={14} />
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input"
                            placeholder="e.g., john.doe@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">
                            <Building2 size={14} />
                            Department
                        </label>
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            className="input"
                            required
                        >
                            <option value="" disabled>Select a department</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary submit-btn"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 size={18} className="spin" />
                            Adding Employee...
                        </>
                    ) : (
                        <>
                            <UserPlus size={18} />
                            Add Employee
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}