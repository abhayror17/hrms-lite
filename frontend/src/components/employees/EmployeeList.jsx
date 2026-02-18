import { useState } from 'react';
import { Search, Trash2, Mail, Building2, User, Hash, Users } from 'lucide-react';
import { employeeApi } from '../../services/api';
import EmptyState from '../common/EmptyState';
import ConfirmModal from '../common/ConfirmModal';
import './EmployeeList.css';

export default function EmployeeList({ employees, onEmployeeDeleted }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);

    const openDeleteModal = (employee) => {
        setEmployeeToDelete(employee);
    };

    const closeDeleteModal = () => {
        setEmployeeToDelete(null);
    };

    const handleDelete = async () => {
        if (!employeeToDelete) return;

        setDeletingId(employeeToDelete.id);
        closeDeleteModal();

        try {
            await employeeApi.delete(employeeToDelete.id);
            if (onEmployeeDeleted) {
                onEmployeeDeleted();
            }
        } catch (err) {
            alert('Error deleting employee: ' + err.message);
        } finally {
            setDeletingId(null);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        <>
            <div className="employee-list-container">
                <div className="search-container">
                    <div className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by name, ID, email, or department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="employee-count">
                        <Users size={16} />
                        <span>{filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {filteredEmployees.length === 0 ? (
                    <EmptyState
                        icon={<Users size={48} strokeWidth={1.5} />}
                        title="No employees found"
                        message={searchTerm ? "Try adjusting your search terms" : "Add your first employee to get started"}
                    />
                ) : (
                    <div className="employee-grid">
                        {filteredEmployees.map((employee) => (
                            <div key={employee.id} className="employee-card card">
                                <div className="employee-header">
                                    <div 
                                        className="employee-avatar"
                                        style={{ background: getAvatarColor(employee.full_name) }}
                                    >
                                        {employee.full_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="employee-info">
                                        <h4 className="employee-name">{employee.full_name}</h4>
                                        <span className="employee-id">
                                            <Hash size={12} />
                                            {employee.employee_id}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => openDeleteModal(employee)}
                                        disabled={deletingId === employee.id}
                                        className="delete-icon-btn"
                                        title="Delete employee"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="employee-details">
                                    <div className="detail-item">
                                        <Mail size={14} className="detail-icon" />
                                        <span className="detail-value">{employee.email}</span>
                                    </div>
                                    <div className="detail-item">
                                        <Building2 size={14} className="detail-icon" />
                                        <span className="detail-value">{employee.department}</span>
                                    </div>
                                </div>

                                <div className="employee-footer">
                                    <span className="badge badge-primary">
                                        <User size={12} />
                                        Active
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={!!employeeToDelete}
                title="Delete Employee"
                message={`Are you sure you want to delete ${employeeToDelete?.full_name}? This action cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={closeDeleteModal}
                confirmText="Delete"
                isDestructive
            />
        </>
    );
}