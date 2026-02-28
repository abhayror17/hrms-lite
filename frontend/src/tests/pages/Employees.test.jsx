import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Employees from '../../pages/Employees';
import { employeeService } from '../../services/api';
import { AlertProvider } from '../../context/AlertContext';

// Mock the API service
vi.mock('../../services/api', () => ({
  employeeService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockEmployees = [
  {
    id: '1',
    employee_id: 'EMP001',
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    department: 'Engineering',
    is_active: true,
  },
  {
    id: '2',
    employee_id: 'EMP002',
    full_name: 'Jane Smith',
    email: 'jane.smith@example.com',
    department: 'Marketing',
    is_active: true,
  },
];

const renderEmployees = () => {
  return render(
    <MemoryRouter>
      <AlertProvider>
        <Employees />
      </AlertProvider>
    </MemoryRouter>
  );
};

describe('Employees Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  // Loading State Tests
  describe('Loading State', () => {
    it('shows loading spinner initially', () => {
      employeeService.getAll.mockImplementation(() => new Promise(() => {}));
      renderEmployees();
      expect(screen.getByText('Loading employees...')).toBeInTheDocument();
    });

    it('shows spinner component while loading', () => {
      employeeService.getAll.mockImplementation(() => new Promise(() => {}));
      renderEmployees();
      expect(screen.getByRole('status') || screen.getByText('Loading employees...')).toBeTruthy();
    });
  });

  // Page Header Tests
  describe('Page Header', () => {
    it('displays page title and subtitle', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      renderEmployees();

      await waitFor(() => {
        expect(screen.getByText('Employee Management')).toBeInTheDocument();
        expect(screen.getByText(/Manage your organization's workforce/)).toBeInTheDocument();
      });
    });

    it('displays add employee button', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      renderEmployees();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Add Employee/i })).toBeInTheDocument();
      });
    });
  });

  // Employee List Tests
  describe('Employee List Display', () => {
    it('displays employees after loading', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      renderEmployees();

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('displays employee IDs', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      renderEmployees();

      await waitFor(() => {
        expect(screen.getByText('EMP001')).toBeInTheDocument();
        expect(screen.getByText('EMP002')).toBeInTheDocument();
      });
    });

    it('displays employee emails', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      renderEmployees();

      await waitFor(() => {
        expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
      });
    });

    it('displays department badges', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      renderEmployees();

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
        expect(screen.getByText('Marketing')).toBeInTheDocument();
      });
    });

    it('displays employee count badge', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      renderEmployees();

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('Employees')).toBeInTheDocument();
      });
    });

    it('displays action buttons for each employee', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      renderEmployees();

      await waitFor(() => {
        const editButtons = screen.getAllByTitle('Edit');
        const deleteButtons = screen.getAllByTitle('Delete');
        const attendanceButtons = screen.getAllByTitle('View Attendance');
        
        expect(editButtons.length).toBe(2);
        expect(deleteButtons.length).toBe(2);
        expect(attendanceButtons.length).toBe(2);
      });
    });
  });

  // Empty State Tests
  describe('Empty State', () => {
    it('displays empty state when no employees', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: [] });
      renderEmployees();

      await waitFor(() => {
        expect(screen.getByText('No employees found')).toBeInTheDocument();
        expect(screen.getByText(/Get started by adding your first employee/)).toBeInTheDocument();
      });
    });

    it('has add employee button in empty state', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: [] });
      renderEmployees();

      await waitFor(() => {
        const addButtons = screen.getAllByRole('button', { name: /Add Employee/i });
        expect(addButtons.length).toBeGreaterThan(0);
      });
    });
  });

  // Add Employee Modal Tests
  describe('Add Employee Modal', () => {
    it('opens add modal when clicking add button', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      renderEmployees();

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /Add Employee/i }));
      });

      expect(screen.getByText('Add New Employee')).toBeInTheDocument();
    });

    it('displays form fields in modal', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      renderEmployees();

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /Add Employee/i }));
      });

      expect(screen.getByLabelText(/Employee ID/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    it('closes modal when clicking cancel', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      renderEmployees();

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /Add Employee/i }));
      });

      expect(screen.getByText('Add New Employee')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

      await waitFor(() => {
        expect(screen.queryByText('Add New Employee')).not.toBeInTheDocument();
      });
    });
  });

  // Form Validation Tests
  describe('Form Validation', () => {
    beforeEach(async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      renderEmployees();

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /Add Employee/i }));
      });
    });

    it('validates required fields', async () => {
      fireEvent.click(screen.getByRole('button', { name: /Add Employee/i }));

      await waitFor(() => {
        const errors = screen.getAllByText(/is required/i);
        expect(errors.length).toBe(4);
      });
    });

    it('validates email format', async () => {
      const emailInput = screen.getByLabelText(/Email Address/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(screen.getByRole('button', { name: /Add Employee/i }));

      await waitFor(() => {
        expect(screen.getByText(/valid email/i)).toBeInTheDocument();
      });
    });

    it('clears error when field is filled', async () => {
      const nameInput = screen.getByLabelText(/Full Name/i);
      fireEvent.click(screen.getByRole('button', { name: /Add Employee/i }));

      await waitFor(() => {
        expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
      });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });

      await waitFor(() => {
        expect(screen.queryByText(/Full name is required/i)).not.toBeInTheDocument();
      });
    });
  });

  // Create Employee Tests
  describe('Create Employee', () => {
    it('creates employee successfully', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      employeeService.create.mockResolvedValueOnce({ data: { id: '3' } });
      renderEmployees();

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /Add Employee/i }));
      });

      fireEvent.change(screen.getByLabelText(/Employee ID/i), { target: { value: 'EMP003' } });
      fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'New User' } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'new@example.com' } });
      fireEvent.change(screen.getByLabelText(/Department/i), { target: { value: 'Sales' } });

      fireEvent.click(screen.getByRole('button', { name: /^Add Employee$/i }));

      await waitFor(() => {
        expect(employeeService.create).toHaveBeenCalledWith({
          employee_id: 'EMP003',
          full_name: 'New User',
          email: 'new@example.com',
          department: 'Sales',
        });
      });
    });

    it('handles duplicate employee_id error', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      employeeService.create.mockRejectedValueOnce({
        response: { data: { detail: 'Employee with this employee_id already exists' } },
      });
      renderEmployees();

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /Add Employee/i }));
      });

      fireEvent.change(screen.getByLabelText(/Employee ID/i), { target: { value: 'EMP001' } });
      fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/Department/i), { target: { value: 'Test' } });

      fireEvent.click(screen.getByRole('button', { name: /^Add Employee$/i }));

      await waitFor(() => {
        expect(screen.getByText(/already in use/i)).toBeInTheDocument();
      });
    });

    it('handles duplicate email error', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      employeeService.create.mockRejectedValueOnce({
        response: { data: { detail: 'Employee with this email already exists' } },
      });
      renderEmployees();

      await waitFor(() => {
        fireEvent.click(screen.getByRole('button', { name: /Add Employee/i }));
      });

      fireEvent.change(screen.getByLabelText(/Employee ID/i), { target: { value: 'EMP003' } });
      fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john.doe@example.com' } });
      fireEvent.change(screen.getByLabelText(/Department/i), { target: { value: 'Test' } });

      fireEvent.click(screen.getByRole('button', { name: /^Add Employee$/i }));

      await waitFor(() => {
        expect(screen.getByText(/already registered/i)).toBeInTheDocument();
      });
    });
  });

  // Edit Employee Tests
  describe('Edit Employee', () => {
    it('opens edit modal with employee data', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      renderEmployees();

      await waitFor(() => {
        const editButtons = screen.getAllByTitle('Edit');
        fireEvent.click(editButtons[0]);
      });

      expect(screen.getByText('Edit Employee')).toBeInTheDocument();
      expect(screen.getByDisplayValue('EMP001')).toBeDisabled();
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    it('updates employee successfully', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      employeeService.update.mockResolvedValueOnce({ data: { id: '1' } });
      renderEmployees();

      await waitFor(() => {
        const editButtons = screen.getAllByTitle('Edit');
        fireEvent.click(editButtons[0]);
      });

      const nameInput = screen.getByLabelText(/Full Name/i);
      fireEvent.change(nameInput, { target: { value: 'John Updated' } });

      fireEvent.click(screen.getByRole('button', { name: /Update/i }));

      await waitFor(() => {
        expect(employeeService.update).toHaveBeenCalledWith('1', expect.objectContaining({
          full_name: 'John Updated',
        }));
      });
    });
  });

  // Delete Employee Tests
  describe('Delete Employee', () => {
    it('opens delete confirmation modal', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      renderEmployees();

      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle('Delete');
        fireEvent.click(deleteButtons[0]);
      });

      expect(screen.getByText('Delete Employee')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    });

    it('deletes employee on confirmation', async () => {
      employeeService.getAll.mockResolvedValue({ data: mockEmployees });
      employeeService.delete.mockResolvedValueOnce({});
      renderEmployees();

      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle('Delete');
        fireEvent.click(deleteButtons[0]);
      });

      fireEvent.click(screen.getByRole('button', { name: /Delete$/i }));

      await waitFor(() => {
        expect(employeeService.delete).toHaveBeenCalledWith('1');
      });
    });

    it('cancels delete operation', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      renderEmployees();

      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle('Delete');
        fireEvent.click(deleteButtons[0]);
      });

      const cancelButton = screen.getAllByRole('button', { name: /Cancel/i })[0];
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Delete Employee')).not.toBeInTheDocument();
      });
    });

    it('handles delete error gracefully', async () => {
      employeeService.getAll.mockResolvedValue({ data: mockEmployees });
      employeeService.delete.mockRejectedValueOnce({
        response: { data: { detail: 'Employee not found' } },
      });
      renderEmployees();

      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle('Delete');
        fireEvent.click(deleteButtons[0]);
      });

      fireEvent.click(screen.getByRole('button', { name: /Delete$/i }));

      await waitFor(() => {
        expect(screen.getByText(/not found/i)).toBeInTheDocument();
      });
    });
  });

  // Search Tests
  describe('Search Functionality', () => {
    it('displays search input', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      renderEmployees();

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search by name, ID, or email/i)).toBeInTheDocument();
      });
    });

    it('calls search API on input change', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      employeeService.getAll.mockResolvedValueOnce({ data: [mockEmployees[0]] });
      renderEmployees();

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search by name, ID, or email/i);
      fireEvent.change(searchInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(employeeService.getAll).toHaveBeenCalledWith({ search: 'John' });
      });
    });
  });

  // Navigation Tests
  describe('Navigation', () => {
    it('navigates to attendance page for employee', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      renderEmployees();

      await waitFor(() => {
        const attendanceButtons = screen.getAllByTitle('View Attendance');
        fireEvent.click(attendanceButtons[0]);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/attendance?employee=1');
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    it('handles API error on load', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      employeeService.getAll.mockRejectedValueOnce(new Error('API Error'));
      renderEmployees();

      await waitFor(() => {
        expect(screen.queryByText('Loading employees...')).not.toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('handles search error', async () => {
      employeeService.getAll.mockResolvedValueOnce({ data: mockEmployees });
      employeeService.getAll.mockRejectedValueOnce(new Error('Search failed'));
      renderEmployees();

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search by name, ID, or email/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Should not crash
      await waitFor(() => {
        expect(searchInput).toHaveValue('test');
      });
    });
  });
});
