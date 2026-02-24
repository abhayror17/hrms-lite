import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaCalendarPlus, FaCalendarCheck, FaCalendarTimes, FaSearch, FaFilter, FaCalendarDay, FaUserClock, FaTrash } from 'react-icons/fa';
import { format, parseISO, isToday } from 'date-fns';
import { employeeService, attendanceService } from '../services/api';
import { useAlert } from '../context/AlertContext';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import './Attendance.css';

function Attendance() {
  const [searchParams] = useSearchParams();
  const preselectedEmployee = searchParams.get('employee');

  const { success, error } = useAlert();

  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [filters, setFilters] = useState({
    employee_id: preselectedEmployee || '',
    start_date: '',
    end_date: '',
    status: ''
  });

  const [formData, setFormData] = useState({
    employee_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'Present'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      fetchAttendanceRecords();
    }
  }, [employees, filters]);

  const fetchEmployees = async () => {
    try {
      const response = await employeeService.getAll();
      setEmployees(response.data);
    } catch (err) {
      error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      setRecordsLoading(true);
      const params = {};
      if (filters.employee_id) params.employee_id = filters.employee_id;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.status) params.status = filters.status;

      const response = await attendanceService.getAll(params);
      setAttendanceRecords(response.data);
    } catch (err) {
      error('Failed to load attendance records');
    } finally {
      setRecordsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.employee_id) {
      errors.employee_id = 'Please select an employee';
    }
    if (!formData.date) {
      errors.date = 'Please select a date';
    }
    if (!formData.status) {
      errors.status = 'Please select a status';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await attendanceService.create(formData);
      success('Attendance marked successfully');
      setShowModal(false);
      resetForm();
      fetchAttendanceRecords();
    } catch (err) {
      const detail = err.response?.data?.detail;
      let message = 'Failed to mark attendance. Please try again.';

      if (typeof detail === 'string') {
        if (detail.includes('already marked')) {
          const emp = employees.find(e => e.id === formData.employee_id);
          const empDisplay = emp ? `${emp.employee_id} - ${emp.full_name}` : 'this employee';
          message = `Attendance already marked for ${empDisplay} on ${formData.date}. Each employee can only have one attendance record per date.`;
        } else if (detail.includes('not found')) {
          message = 'Selected employee not found. Please refresh and try again.';
        } else {
          message = detail;
        }
      }

      error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;
    try {
      await attendanceService.delete(selectedRecord.id);
      success('Attendance record deleted successfully');
      setShowDeleteModal(false);
      setSelectedRecord(null);
      fetchAttendanceRecords();
    } catch (err) {
      const detail = err.response?.data?.detail;
      error(detail || 'Failed to delete attendance record');
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'Present'
    });
    setFormErrors({});
  };

  const clearFilters = () => {
    setFilters({
      employee_id: '',
      start_date: '',
      end_date: '',
      status: ''
    });
  };

  const getStatusClass = (status) => {
    return status === 'Present' ? 'status-present' : 'status-absent';
  };

  const getStatusIcon = (status) => {
    return status === 'Present' ? <FaCalendarCheck /> : <FaCalendarTimes />;
  };

  if (loading) {
    return (
      <div className="page-loading">
        <Spinner size="lg" text="Loading attendance data..." />
      </div>
    );
  }

  return (
    <div className="attendance-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Attendance Management</h1>
          <p className="page-subtitle">Track and manage employee attendance</p>
        </div>
        <button className="btn btn-primary add-btn" onClick={() => setShowModal(true)}>
          <FaCalendarPlus className="me-2" />
          Mark Attendance
        </button>
      </div>

      <div className="card">
        <div className="card-header-custom">
          <div className="filter-section">
            <FaFilter className="filter-icon" />
            <span className="filter-label">Filters</span>
          </div>
          <button className="btn btn-link clear-filters" onClick={clearFilters}>
            Clear All
          </button>
        </div>

        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label-small">Employee</label>
            <select
              name="employee_id"
              className="form-select"
              value={filters.employee_id}
              onChange={handleFilterChange}
            >
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.employee_id} - {emp.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label-small">From Date</label>
            <input
              type="date"
              name="start_date"
              className="form-control"
              value={filters.start_date}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label-small">To Date</label>
            <input
              type="date"
              name="end_date"
              className="form-control"
              value={filters.end_date}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label-small">Status</label>
            <select
              name="status"
              className="form-select"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card records-card">
        <div className="card-header-custom">
          <div className="records-title">
            <FaCalendarDay className="me-2" />
            Attendance Records
          </div>
          <div className="record-count">
            <span className="count-badge">{attendanceRecords.length}</span>
            <span>Records</span>
          </div>
        </div>

        {recordsLoading ? (
          <div className="records-loading">
            <Spinner text="Loading records..." />
          </div>
        ) : attendanceRecords.length === 0 ? (
          <EmptyState
            icon={FaUserClock}
            title="No attendance records found"
            description="Mark attendance for employees to see records here."
            action={
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <FaCalendarPlus className="me-2" />Mark Attendance
              </button>
            }
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover attendance-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map(record => (
                    <tr key={record.id}>
                      <td>
                        <div className="date-cell">
                          <span className="date-main">
                            {format(parseISO(record.date), 'MMM dd, yyyy')}
                          </span>
                          {isToday(parseISO(record.date)) && (
                            <span className="today-badge">Today</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="employee-info">
                          <div className="avatar">{record.employee_name.charAt(0).toUpperCase()}</div>
                          <span>{record.employee_name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="employee-id-badge">{record.employee_employee_id}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(record.status)}`}>
                          {getStatusIcon(record.status)}
                          {record.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-icon btn-delete"
                          onClick={() => {
                            setSelectedRecord(record);
                            setShowDeleteModal(true);
                          }}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="attendance-cards">
              {attendanceRecords.map(record => (
                <div key={record.id} className="attendance-card">
                  <div className="attendance-card-header">
                    <div className="attendance-card-employee">
                      <div className="avatar">{record.employee_name.charAt(0).toUpperCase()}</div>
                      <div className="attendance-card-employee-info">
                        <div className="attendance-card-name">{record.employee_name}</div>
                        <span className="employee-id-badge">{record.employee_employee_id}</span>
                      </div>
                    </div>
                    <div className="attendance-card-date">
                      <div className="attendance-card-date-main">
                        {format(parseISO(record.date), 'MMM dd, yyyy')}
                      </div>
                      {isToday(parseISO(record.date)) && (
                        <span className="today-badge">Today</span>
                      )}
                    </div>
                  </div>
                  <div className="attendance-card-footer">
                    <span className={`status-badge ${getStatusClass(record.status)}`}>
                      {getStatusIcon(record.status)}
                      {record.status}
                    </span>
                    <button
                      className="btn btn-icon btn-delete"
                      onClick={() => {
                        setSelectedRecord(record);
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

      {/* Mark Attendance Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Mark Attendance"
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Employee *</label>
            <select
              name="employee_id"
              className={`form-select ${formErrors.employee_id ? 'is-invalid' : ''}`}
              value={formData.employee_id}
              onChange={handleInputChange}
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.employee_id} - {emp.full_name}
                </option>
              ))}
            </select>
            {formErrors.employee_id && (
              <span className="error-message">{formErrors.employee_id}</span>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input
              type="date"
              name="date"
              className={`form-control ${formErrors.date ? 'is-invalid' : ''}`}
              value={formData.date}
              onChange={handleInputChange}
              max={format(new Date(), 'yyyy-MM-dd')}
            />
            {formErrors.date && (
              <span className="error-message">{formErrors.date}</span>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Status *</label>
            <div className="status-options">
              <label className={`status-option ${formData.status === 'Present' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="status"
                  value="Present"
                  checked={formData.status === 'Present'}
                  onChange={handleInputChange}
                />
                <FaCalendarCheck className="status-icon present" />
                <span>Present</span>
              </label>
              <label className={`status-option ${formData.status === 'Absent' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="status"
                  value="Absent"
                  checked={formData.status === 'Absent'}
                  onChange={handleInputChange}
                />
                <FaCalendarTimes className="status-icon absent" />
                <span>Absent</span>
              </label>
            </div>
            {formErrors.status && (
              <span className="error-message">{formErrors.status}</span>
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
              {submitting ? 'Saving...' : 'Mark Attendance'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Attendance Record"
        size="sm"
      >
        <div className="delete-confirmation">
          <p>Are you sure you want to delete this attendance record?</p>
          <p className="text-muted">
            {selectedRecord && (
              <>
                <strong>{selectedRecord.employee_name}</strong> -
                {format(parseISO(selectedRecord.date), 'MMM dd, yyyy')}
              </>
            )}
          </p>
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

export default Attendance;
