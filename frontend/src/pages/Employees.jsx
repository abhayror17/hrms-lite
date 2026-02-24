import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUserTie, FaCalendarAlt } from 'react-icons/fa';
import { employeeService } from '../services/api';
import { useAlert } from '../context/AlertContext';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import './Employees.css';

function Employees() {
  const navigate = useNavigate();
  const { success, error } = useAlert();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    department: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeService.getAll();
      setEmployees(response.data);
    } catch (err) {
      error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    try {
      const response = await employeeService.getAll({ search: term });
      setEmployees(response.data);
    } catch (err) {
      error('Search failed');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.employee_id.trim()) {
      errors.employee_id = 'Employee ID is required';
    }
    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!formData.department.trim()) {
      errors.department = 'Department is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (selectedEmployee) {
        await employeeService.update(selectedEmployee.id, formData);
        success('Employee updated successfully');
      } else {
        await employeeService.create(formData);
        success('Employee added successfully');
      }
      setShowModal(false);
      resetForm();
      fetchEmployees();
    } catch (err) {
      const detail = err.response?.data?.detail;
      let message = 'Operation failed. Please try again.';

      if (typeof detail === 'string') {
        if (detail.includes('employee_id') && detail.includes('already exists')) {
          message = `Employee ID "${formData.employee_id}" is already in use. Please use a different ID.`;
        } else if (detail.includes('email') && detail.includes('already exists')) {
          message = `Email "${formData.email}" is already registered. Please use a different email.`;
        } else {
          message = detail;
        }
      }

      error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      employee_id: employee.employee_id,
      full_name: employee.full_name,
      email: employee.email,
      department: employee.department
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;
    try {
      await employeeService.delete(selectedEmployee.id);
      success('Employee deleted successfully');
      setShowDeleteModal(false);
      setSelectedEmployee(null);
      fetchEmployees();
    } catch (err) {
      const detail = err.response?.data?.detail;
      let message = 'Failed to delete employee. Please try again.';

      if (typeof detail === 'string') {
        if (detail.includes('not found')) {
          message = 'Employee not found. They may have already been deleted.';
        } else {
          message = detail;
        }
      }

      error(message);
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      full_name: '',
      email: '',
      department: ''
    });
    setFormErrors({});
    setSelectedEmployee(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="page-loading">
        <Spinner size="lg" text="Loading employees..." />
      </div>
    );
  }

  return (
    <div className="employees-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Employee Management</h1>
          <p className="page-subtitle">Manage your organization's workforce</p>
        </div>
        <button className="btn btn-primary add-btn" onClick={openAddModal}>
          <FaPlus className="me-2" />
          Add Employee
        </button>
      </div>

      <div className="card">
        <div className="card-header-custom">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, ID, or email..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="employee-count">
            <span className="count-badge">{employees.length}</span>
            <span>Employees</span>
          </div>
        </div>

        {employees.length === 0 ? (
          <EmptyState
            icon={FaUserTie}
            title="No employees found"
            description="Get started by adding your first employee to the system."
            action={
              <button className="btn btn-primary" onClick={openAddModal}>
                <FaPlus className="me-2" />Add Employee
              </button>
            }
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover employees-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(employee => (
                    <tr key={employee.id}>
                      <td>
                        <span className="employee-id-badge">{employee.employee_id}</span>
                      </td>
                      <td>
                        <div className="employee-name">
                          <div className="avatar">{employee.full_name.charAt(0).toUpperCase()}</div>
                          <span>{employee.full_name}</span>
                        </div>
                      </td>
                      <td className="email-cell">{employee.email}</td>
                      <td>
                        <span className="department-badge">{employee.department}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-icon btn-attendance"
                            onClick={() => navigate(`/attendance?employee=${employee.id}`)}
                            title="View Attendance"
                          >
                            <FaCalendarAlt />
                          </button>
                          <button
                            className="btn btn-icon btn-edit"
                            onClick={() => handleEdit(employee)}
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-icon btn-delete"
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setShowDeleteModal(true);
                            }}
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="employee-cards">
              {employees.map(employee => (
                <div key={employee.id} className="employee-card">
                  <div className="employee-card-header">
                    <div className="avatar">{employee.full_name.charAt(0).toUpperCase()}</div>
                    <div className="employee-card-info">
                      <div className="employee-card-name">{employee.full_name}</div>
                      <div className="employee-card-id">{employee.employee_id}</div>
                    </div>
                  </div>
                  <div className="employee-card-details">
                    <span className="department-badge">{employee.department}</span>
                    <span className="employee-card-email">{employee.email}</span>
                  </div>
                  <div className="employee-card-actions">
                    <button
                      className="btn btn-icon btn-attendance"
                      onClick={() => navigate(`/attendance?employee=${employee.id}`)}
                    >
                      <FaCalendarAlt /> Attendance
                    </button>
                    <button
                      className="btn btn-icon btn-edit"
                      onClick={() => handleEdit(employee)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      className="btn btn-icon btn-delete"
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setShowDeleteModal(true);
                      }}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Employee ID *</label>
            <input
              type="text"
              name="employee_id"
              className={`form-control ${formErrors.employee_id ? 'is-invalid' : ''}`}
              value={formData.employee_id}
              onChange={handleInputChange}
              disabled={!!selectedEmployee}
              placeholder="e.g., EMP001"
            />
            {formErrors.employee_id && (
              <span className="error-message">{formErrors.employee_id}</span>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="full_name"
              className={`form-control ${formErrors.full_name ? 'is-invalid' : ''}`}
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Enter full name"
            />
            {formErrors.full_name && (
              <span className="error-message">{formErrors.full_name}</span>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
              value={formData.email}
              onChange={handleInputChange}
              placeholder="email@example.com"
            />
            {formErrors.email && (
              <span className="error-message">{formErrors.email}</span>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Department *</label>
            <input
              type="text"
              name="department"
              className={`form-control ${formErrors.department ? 'is-invalid' : ''}`}
              value={formData.department}
              onChange={handleInputChange}
              placeholder="e.g., Engineering, Marketing"
            />
            {formErrors.department && (
              <span className="error-message">{formErrors.department}</span>
            )}
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : selectedEmployee ? 'Update' : 'Add Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Employee"
        size="sm"
      >
        <div className="delete-confirmation">
          <p>Are you sure you want to delete employee <strong>{selectedEmployee?.full_name}</strong>?</p>
          <p className="text-muted">This action cannot be undone.</p>
          <div className="form-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Employees;
