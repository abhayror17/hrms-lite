import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Attendance from '../../pages/Attendance';
import { employeeService, attendanceService } from '../../services/api';
import { AlertProvider } from '../../context/AlertContext';

// Mock the API services
vi.mock('../../services/api', () => ({
  employeeService: {
    getAll: vi.fn(),
  },
  attendanceService: {
    getAll: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock useSearchParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(''), vi.fn()],
  };
});

const mockEmployees = [
  {
    id: '1',
    employee_id: 'EMP001',
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    department: 'Engineering',
  },
  {
    id: '2',
    employee_id: 'EMP002',
    full_name: 'Jane Smith',
    email: 'jane.smith@example.com',
    department: 'Marketing',
  },
];

const mockAttendanceRecords = [
  {
    id: '1',
    employee_id: '1',
    employee_name: 'John Doe',
    employee_employee_id: 'EMP001',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
  },
  {
    id: '2',
    employee_id: '2',
    employee_name: 'Jane Smith',
    employee_employee_id: 'EMP002',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    status: 'Absent',
  },
];

const renderAttendance = () => {
  return render(
    <MemoryRouter>
      <AlertProvider>
        <Attendance />
      </AlertProvider>
    </MemoryRouter>
  );
};

describe('Attendance Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Loading State Tests
  describe('Loading State', () => {
    it('shows loading spinner initially', () => {
      employeeService.getAll.mockImplementation(() => new Promise(() => {}));
      renderAttendance();
      expect(screen.getByText('Loading attendance data...')).toBeInTheDocument();
    });
  });

  // Page Header Tests
  describe('Page Header', () => {
    it('displays page title and subtitle', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      attendanceService.getAll.mockResolvedValueOnce({ data: mockAttendanceRecords });
      renderAttendance();

      await waitFor(() => {
        expect(screen.getByText('Attendance Management')).toBeInTheDocument();
        expect(screen.getByText(/Track and manage employee attendance/)).toBeInTheDocument();
      });
    });

    it('displays mark attendance button', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      attendanceService.getAll.mockResolvedValueOnce({ data: mockAttendanceRecords });
      renderAttendance();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Mark Attendance/i })).toBeInTheDocument();
      });
    });
  });

  // Filter Tests
  describe('Filter Section', () => {
    beforeEach(async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      attendanceService.getAll.mockResolvedValueOnce({ data: mockAttendanceRecords });
      renderAttendance();
      await waitFor(() => {
        expect(screen.getByText('Attendance Management')).toBeInTheDocument();
      });
    });

    it('displays filter section', () => {
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('displays employee filter dropdown', () => {
      expect(screen.getByLabelText(/Employee/i)).toBeInTheDocument();
    });

    it('displays date range filters', () => {
      expect(screen.getByLabelText(/From Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/To Date/i)).toBeInTheDocument();
    });

    it('displays status filter', () => {
      expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    });

    it('displays clear filters button', () => {
      expect(screen.getByRole('button', { name: /Clear All/i })).toBeInTheDocument();
    });

    it('populates employee dropdown with options', async () => {
      const employeeSelect = screen.getByLabelText(/Employee/i);
      const options = employeeSelect.querySelectorAll('option');
      
      await waitFor(() => {
        expect(options.length).toBeGreaterThan(1); // Including "All Employees" option
      });
    });
  });

  // Attendance Records Display Tests
  describe('Attendance Records Display', () => {
    it('displays attendance records after loading', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      attendanceService.getAll.mockResolvedValueOnce({ data: mockAttendanceRecords });
      renderAttendance();

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('displays employee IDs in records', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      attendanceService.getAll.mockResolvedValueOnce({ data: mockAttendanceRecords });
      renderAttendance();

      await waitFor(() => {
        expect(screen.getByText('EMP001')).toBeInTheDocument();
        expect(screen.getByText('EMP002')).toBeInTheDocument();
      });
    });

    it('displays status badges', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      attendanceService.getAll.mockResolvedValueOnce({ data: mockAttendanceRecords });
      renderAttendance();

      await waitFor(() => {
        expect(screen.getByText('Present')).toBeInTheDocument();
        expect(screen.getByText('Absent')).toBeInTheDocument();
      });
    });

    it('displays record count badge', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      attendanceService.getAll.mockResolvedValueOnce({ data: mockAttendanceRecords });
      renderAttendance();

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('Records')).toBeInTheDocument();
      });
    });

    it('displays today badge for current date records', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      attendanceService.getAll.mockResolvedValueOnce({ data: mockAttendanceRecords });
      renderAttendance();

      await waitFor(() => {
        expect(screen.getByText('Today')).toBeInTheDocument();
      });
    });
  });

  // Empty State Tests
  describe('Empty State', () => {
    it('displays empty state when no records', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      attendanceService.getAll.mockResolvedValueOnce({ data: [] });
      renderAttendance();

      await waitFor(() => {
        expect(screen.getByText('No attendance records found')).toBeInTheDocument();
        expect(screen.getByText(/Mark attendance for employees/)).toBeInTheDocument();
      });
    });

    it('has mark attendance button in empty state', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      attendanceService.getAll.mockResolvedValueOnce({ data: [] });
      renderAttendance();

      await waitFor(() => {
        const markButtons = screen.getAllByRole('button', { name: /Mark Attendance/i });
        expect(markButtons.length).toBeGreaterThan(0);
      });
    });
  });

  // Mark Attendance Modal Tests
  describe('Mark Attendance Modal', () => {
    beforeEach(async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      attendanceService.getAll.mockResolvedValueOnce({ data: mockAttendanceRecords });
      renderAttendance();

      await waitFor(() => {
        expect(screen.getByText('Attendance Management')).toBeInTheDocument();
      });
    });

    it('opens modal when clicking mark attendance button', async () => {
      fireEvent.click(screen.getByRole('button', { name: /Mark Attendance/i }));
      expect(screen.getByText('Mark Attendance')).toBeInTheDocument();
    });

    it('displays form fields in modal', async () => {
      fireEvent.click(screen.getByRole('button', { name: /Mark Attendance/i }));

      expect(screen.getByLabelText(/Employee/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
      expect(screen.getByText('Present')).toBeInTheDocument();
      expect(screen.getByText('Absent')).toBeInTheDocument();
    });

    it('has today as default date', async () => {
      fireEvent.click(screen.getByRole('button', { name: /Mark Attendance/i }));

      const dateInput = screen.getByLabelText(/Date/i);
      const today = new Date().toISOString().split('T')[0];
      expect(dateInput).toHaveValue(today);
    });

    it('has Present as default status', async () => {
      fireEvent.click(screen.getByRole('button', { name: /Mark Attendance/i }));

      const presentOption = screen.getByLabelText(/Present/);
      expect(presentOption).toBeChecked();
    });

    it('closes modal when clicking cancel', async () => {
      fireEvent.click(screen.getByRole('button', { name: /Mark Attendance/i }));
      expect(screen.getByText('Mark Attendance')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

      await waitFor(() => {
        expect(screen.queryByText('Mark Attendance')).not.toBeInTheDocument();
      });
    });
  });

  // Form Validation Tests
  describe('Form Validation', () => {
    beforeEach(async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      attendanceService.getAll.mockResolvedValueOnce({ data: mockAttendanceRecords });
      renderAttendance();

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /Mark Attendance/i }));
      });
    });

    it('validates required fields', async () => {
      fireEvent.click(screen.getByRole('button', { name: /^Mark Attendance$/i }));

      await waitFor(() => {
        expect(screen.getByText(/Please select an employee/i)).toBeInTheDocument();
      });
    });

    it('validates date selection', async () => {
      const dateInput = screen.getByLabelText(/Date/i);
      fireEvent.change(dateInput, { target: { value: '' } });
      fireEvent.click(screen.getByRole('button', { name: /^Mark Attendance$/i }));

      await waitFor(() => {
        expect(screen.getByText(/Please select a date/i)).toBeInTheDocument();
      });
    });
  });

  // Create Attendance Tests
  describe('Create Attendance', () => {
    it('creates attendance record successfully', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      attendanceService.getAll.mockResolvedValueOnce({ data: mockAttendanceRecords });
      attendanceService.create.mockResolvedValueOnce({ data: { id: '3' } });
      renderAttendance();

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /Mark Attendance/i }));
      });

      const employeeSelect = screen.getByLabelText(/Employee/i);
      fireEvent.change(employeeSelect, { target: { value: '1' } });

      fireEvent.click(screen.getByRole('button', { name: /^Mark Attendance$/i }));

      await waitFor(() => {
        expect(attendanceService.create).toHaveBeenCalled();
      });
    });

    it('handles already marked attendance error', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      attendanceService.getAll.mockResolvedValueOnce({ data: mockAttendanceRecords });
      attendanceService.create.mockRejectedValueOnce({
        response: { data: { detail: 'Attendance already marked for this employee on this date' } },
      });
      renderAttendance();

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /Mark Attendance/i }));
      });

      const employeeSelect = screen.getByLabelText(/Employee/i);
      fireEvent.change(employeeSelect, { target: { value: '1' } });

      fireEvent.click(screen.getByRole('button', { name: /^Mark Attendance$/i }));

      await waitFor(() => {
        expect(screen.getByText(/already marked/i)).toBeInTheDocument();
      });
    });

    it('allows selecting Absent status', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      attendanceService.getAll.mockResolvedValueOnce({ data: mockAttendanceRecords });
      renderAttendance();

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /Mark Attendance/i }));
      });

      const absentOption = screen.getByLabelText(/Absent/);
      fireEvent.click(absentOption);

      expect(absentOption).toBeChecked();
    });
  });

  // Delete Attendance Tests
  describe('Delete Attendance', () => {
    it('opens delete confirmation modal', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      attendanceService.getAll.mockResolvedValueOnce({ data: mockAttendanceRecords });
      renderAttendance();

      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle('Delete');
        fireEvent.click(deleteButtons[0]);
      });

      expect(screen.getByText('Delete Attendance Record')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    });

    it('deletes attendance record on confirmation', async () => {
      employeeService.getAll.mockResolvedValue({ data: mockEmployees });
      attendanceService.getAll.mockResolvedValue({ data: mockAttendanceRecords });
      attendanceService.delete.mockResolvedValueOnce({});
      renderAttendance();

      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle('Delete');
        fireEvent.click(deleteButtons[0]);
      });

      fireEvent.click(screen.getByRole('button', { name: /Delete$/i }));

      await waitFor(() => {
        expect(attendanceService.delete).toHaveBeenCalledWith('1');
      });
    });

    it('cancels delete operation', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      attendanceService.getAll.mockResolvedValueOnce({ data: mockAttendanceRecords });
      renderAttendance();

      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle('Delete');
        fireEvent.click(deleteButtons[0]);
      });

      const cancelButton = screen.getAllByRole('button', { name: /Cancel/i })[0];
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Delete Attendance Record')).not.toBeInTheDocument();
      });
    });

    it('handles delete error', async () => {
      employeeService.getAll.mockResolvedValue({ data: mockEmployees });
      attendanceService.getAll.mockResolvedValue({ data: mockAttendanceRecords });
      attendanceService.delete.mockRejectedValueOnce({
        response: { data: { detail: 'Record not found' } },
      });
      renderAttendance();

      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle('Delete');
        fireEvent.click(deleteButtons[0]);
      });

      fireEvent.click(screen.getByRole('button', { name: /Delete$/i }));

      await waitFor(() => {
        expect(attendanceService.delete).toHaveBeenCalled();
      });
    });
  });

  // Filter Functionality Tests
  describe('Filter Functionality', () => {
    beforeEach(async () => {
      employeeService.getAll.mockResolvedValue({ data: mockEmployees });
      attendanceService.getAll.mockResolvedValue({ data: mockAttendanceRecords });
      renderAttendance();

      await waitFor(() => {
        expect(screen.getByText('Attendance Management')).toBeInTheDocument();
      });
    });

    it('filters by employee', async () => {
      const employeeSelect = screen.getByLabelText(/Employee/i);
      fireEvent.change(employeeSelect, { target: { value: '1' } });

      await waitFor(() => {
        expect(attendanceService.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ employee_id: '1' })
        );
      });
    });

    it('filters by status', async () => {
      const statusSelect = screen.getByLabelText(/Status/i);
      fireEvent.change(statusSelect, { target: { value: 'Present' } });

      await waitFor(() => {
        expect(attendanceService.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'Present' })
        );
      });
    });

    it('filters by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';

      fireEvent.change(screen.getByLabelText(/From Date/i), { target: { value: startDate } });
      fireEvent.change(screen.getByLabelText(/To Date/i), { target: { value: endDate } });

      await waitFor(() => {
        expect(attendanceService.getAll).toHaveBeenCalledWith(
          expect.objectContaining({
            start_date: startDate,
            end_date: endDate,
          })
        );
      });
    });

    it('clears all filters', async () => {
      const employeeSelect = screen.getByLabelText(/Employee/i);
      fireEvent.change(employeeSelect, { target: { value: '1' } });

      fireEvent.click(screen.getByRole('button', { name: /Clear All/i }));

      await waitFor(() => {
        expect(employeeSelect).toHaveValue('');
      });
    });
  });

  // Records Loading Tests
  describe('Records Loading State', () => {
    it('shows loading spinner when fetching records', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      attendanceService.getAll.mockImplementation(() => new Promise(() => {}));
      renderAttendance();

      await waitFor(() => {
        expect(screen.getByText('Loading records...')).toBeInTheDocument();
      });
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    it('handles API error on employee load', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      employeeService.getAll.mockRejectedValueOnce(new Error('API Error'));
      renderAttendance();

      await waitFor(() => {
        expect(screen.queryByText('Loading attendance data...')).not.toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('handles API error on attendance load', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      attendanceService.getAll.mockRejectedValueOnce(new Error('API Error'));
      renderAttendance();

      await waitFor(() => {
        expect(screen.queryByText('Loading records...')).not.toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  // Status Badge Tests
  describe('Status Display', () => {
    it('applies correct CSS class for Present status', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      attendanceService.getAll.mockResolvedValueOnce({ data: mockAttendanceRecords });
      renderAttendance();

      await waitFor(() => {
        const presentBadge = screen.getByText('Present');
        expect(presentBadge.closest('.status-badge')).toHaveClass('status-present');
      });
    });

    it('applies correct CSS class for Absent status', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      attendanceService.getAll.mockResolvedValueOnce({ data: mockAttendanceRecords });
      renderAttendance();

      await waitFor(() => {
        const absentBadge = screen.getByText('Absent');
        expect(absentBadge.closest('.status-badge')).toHaveClass('status-absent');
      });
    });
  });
});
