import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { employeeService, attendanceService } from '../../services/api';

// Mock axios
vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn(() => mockAxios),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    default: mockAxios,
    ...mockAxios,
  };
});

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('employeeService', () => {
    describe('getAll', () => {
      it('calls GET /api/employees/ with no params', async () => {
        const mockResponse = { data: [{ id: '1', name: 'John' }] };
        axios.get.mockResolvedValueOnce(mockResponse);

        const result = await employeeService.getAll();

        expect(axios.get).toHaveBeenCalledWith('/api/employees/', { params: {} });
        expect(result).toEqual(mockResponse);
      });

      it('calls GET /api/employees/ with params', async () => {
        const mockResponse = { data: [{ id: '1', name: 'John' }] };
        axios.get.mockResolvedValueOnce(mockResponse);

        const result = await employeeService.getAll({ search: 'john', department: 'Eng' });

        expect(axios.get).toHaveBeenCalledWith('/api/employees/', { 
          params: { search: 'john', department: 'Eng' } 
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getById', () => {
      it('calls GET /api/employees/:id', async () => {
        const mockResponse = { data: { id: '123', name: 'John' } };
        axios.get.mockResolvedValueOnce(mockResponse);

        const result = await employeeService.getById('123');

        expect(axios.get).toHaveBeenCalledWith('/api/employees/123');
        expect(result).toEqual(mockResponse);
      });
    });

    describe('create', () => {
      it('calls POST /api/employees/ with data', async () => {
        const employeeData = { 
          employee_id: 'EMP001', 
          full_name: 'John Doe',
          email: 'john@example.com',
          department: 'Engineering'
        };
        const mockResponse = { data: { id: '123', ...employeeData } };
        axios.post.mockResolvedValueOnce(mockResponse);

        const result = await employeeService.create(employeeData);

        expect(axios.post).toHaveBeenCalledWith('/api/employees/', employeeData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('update', () => {
      it('calls PUT /api/employees/:id with data', async () => {
        const updateData = { full_name: 'Jane Doe' };
        const mockResponse = { data: { id: '123', full_name: 'Jane Doe' } };
        axios.put.mockResolvedValueOnce(mockResponse);

        const result = await employeeService.update('123', updateData);

        expect(axios.put).toHaveBeenCalledWith('/api/employees/123', updateData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('delete', () => {
      it('calls DELETE /api/employees/:id', async () => {
        axios.delete.mockResolvedValueOnce({ status: 204 });

        await employeeService.delete('123');

        expect(axios.delete).toHaveBeenCalledWith('/api/employees/123');
      });
    });

    describe('getSummary', () => {
      it('calls GET /api/employees/:id/summary', async () => {
        const mockResponse = { 
          data: { 
            employee_id: '123', 
            total_present: 10, 
            attendance_rate: 90 
          } 
        };
        axios.get.mockResolvedValueOnce(mockResponse);

        const result = await employeeService.getSummary('123');

        expect(axios.get).toHaveBeenCalledWith('/api/employees/123/summary');
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getDashboardStats', () => {
      it('calls GET /api/employees/dashboard/stats', async () => {
        const mockResponse = { 
          data: { 
            total_employees: 10, 
            departments: [] 
          } 
        };
        axios.get.mockResolvedValueOnce(mockResponse);

        const result = await employeeService.getDashboardStats();

        expect(axios.get).toHaveBeenCalledWith('/api/employees/dashboard/stats');
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('attendanceService', () => {
    describe('getAll', () => {
      it('calls GET /api/attendance/ with no params', async () => {
        const mockResponse = { data: [] };
        axios.get.mockResolvedValueOnce(mockResponse);

        const result = await attendanceService.getAll();

        expect(axios.get).toHaveBeenCalledWith('/api/attendance/', { params: {} });
        expect(result).toEqual(mockResponse);
      });

      it('calls GET /api/attendance/ with filter params', async () => {
        const mockResponse = { data: [] };
        axios.get.mockResolvedValueOnce(mockResponse);

        const result = await attendanceService.getAll({ 
          employee_id: '123', 
          start_date: '2024-01-01',
          status: 'Present'
        });

        expect(axios.get).toHaveBeenCalledWith('/api/attendance/', { 
          params: { employee_id: '123', start_date: '2024-01-01', status: 'Present' } 
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getByEmployee', () => {
      it('calls GET /api/attendance/employee/:id', async () => {
        const mockResponse = { data: [] };
        axios.get.mockResolvedValueOnce(mockResponse);

        const result = await attendanceService.getByEmployee('123');

        expect(axios.get).toHaveBeenCalledWith('/api/attendance/employee/123', { params: {} });
        expect(result).toEqual(mockResponse);
      });

      it('calls GET with additional params', async () => {
        const mockResponse = { data: [] };
        axios.get.mockResolvedValueOnce(mockResponse);

        await attendanceService.getByEmployee('123', { start_date: '2024-01-01' });

        expect(axios.get).toHaveBeenCalledWith('/api/attendance/employee/123', { 
          params: { start_date: '2024-01-01' } 
        });
      });
    });

    describe('create', () => {
      it('calls POST /api/attendance/ with data', async () => {
        const attendanceData = {
          employee_id: '123',
          date: '2024-01-15',
          status: 'Present'
        };
        const mockResponse = { data: { id: 'att-123', ...attendanceData } };
        axios.post.mockResolvedValueOnce(mockResponse);

        const result = await attendanceService.create(attendanceData);

        expect(axios.post).toHaveBeenCalledWith('/api/attendance/', attendanceData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('update', () => {
      it('calls PUT /api/attendance/:id with status query param', async () => {
        const mockResponse = { data: { id: 'att-123', status: 'Absent' } };
        axios.put.mockResolvedValueOnce(mockResponse);

        const result = await attendanceService.update('att-123', 'Absent');

        expect(axios.put).toHaveBeenCalledWith('/api/attendance/att-123?status=Absent');
        expect(result).toEqual(mockResponse);
      });
    });

    describe('delete', () => {
      it('calls DELETE /api/attendance/:id', async () => {
        axios.delete.mockResolvedValueOnce({ status: 204 });

        await attendanceService.delete('att-123');

        expect(axios.delete).toHaveBeenCalledWith('/api/attendance/att-123');
      });
    });

    describe('getToday', () => {
      it('calls GET /api/attendance/today', async () => {
        const mockResponse = { data: [] };
        axios.get.mockResolvedValueOnce(mockResponse);

        const result = await attendanceService.getToday();

        expect(axios.get).toHaveBeenCalledWith('/api/attendance/today');
        expect(result).toEqual(mockResponse);
      });
    });
  });
});
