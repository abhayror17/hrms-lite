import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';
import { employeeService } from '../../services/api';
import { AlertProvider } from '../../context/AlertContext';

// Mock the API service
vi.mock('../../services/api', () => ({
  employeeService: {
    getDashboardStats: vi.fn(),
  },
}));

// Mock recharts to avoid rendering issues
vi.mock('recharts', () => ({
  PieChart: () => <div data-testid="pie-chart">PieChart</div>,
  Pie: () => <div>Pie</div>,
  Cell: () => <div>Cell</div>,
  BarChart: () => <div data-testid="bar-chart">BarChart</div>,
  Bar: () => <div>Bar</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  Legend: () => <div>Legend</div>,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
}));

const mockDashboardStats = {
  total_employees: 10,
  departments: [
    { name: 'Engineering', count: 5 },
    { name: 'Marketing', count: 3 },
    { name: 'Sales', count: 2 },
  ],
  today_attendance: {
    present: 7,
    absent: 2,
    not_marked: 1,
  },
  overall_attendance_rate: 85.5,
  recent_employees: [
    {
      id: '1',
      employee_id: 'EMP001',
      full_name: 'John Doe',
      department: 'Engineering',
      created_at: '2024-01-15T10:00:00',
    },
    {
      id: '2',
      employee_id: 'EMP002',
      full_name: 'Jane Smith',
      department: 'Marketing',
      created_at: '2024-01-14T10:00:00',
    },
  ],
};

const renderDashboard = () => {
  return render(
    <MemoryRouter>
      <AlertProvider>
        <Dashboard />
      </AlertProvider>
    </MemoryRouter>
  );
};

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner initially', () => {
    employeeService.getDashboardStats.mockImplementation(() => new Promise(() => {}));
    renderDashboard();
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('displays stats after loading', async () => {
    employeeService.getDashboardStats.mockResolvedValueOnce({ data: mockDashboardStats });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
    });
    expect(screen.getByText('Total Employees')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // Departments count
    expect(screen.getByText('Departments')).toBeInTheDocument();
  });

  it('displays attendance rate', async () => {
    employeeService.getDashboardStats.mockResolvedValueOnce({ data: mockDashboardStats });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('85.5%')).toBeInTheDocument();
    });
    expect(screen.getByText('Overall Attendance Rate')).toBeInTheDocument();
  });

  it('displays present today count', async () => {
    employeeService.getDashboardStats.mockResolvedValueOnce({ data: mockDashboardStats });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('7')).toBeInTheDocument();
    });
    expect(screen.getByText('Present Today')).toBeInTheDocument();
  });

  it('displays recent employees', async () => {
    employeeService.getDashboardStats.mockResolvedValueOnce({ data: mockDashboardStats });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('displays department badges for recent employees', async () => {
    employeeService.getDashboardStats.mockResolvedValueOnce({ data: mockDashboardStats });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Engineering')).toBeInTheDocument();
      expect(screen.getByText('Marketing')).toBeInTheDocument();
    });
  });

  it('displays employee ID badges', async () => {
    employeeService.getDashboardStats.mockResolvedValueOnce({ data: mockDashboardStats });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('EMP001')).toBeInTheDocument();
      expect(screen.getByText('EMP002')).toBeInTheDocument();
    });
  });

  it('displays no employees message when empty', async () => {
    const emptyStats = {
      total_employees: 0,
      departments: [],
      today_attendance: { present: 0, absent: 0, not_marked: 0 },
      overall_attendance_rate: 0,
      recent_employees: [],
    };
    employeeService.getDashboardStats.mockResolvedValueOnce({ data: emptyStats });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('No employees added yet')).toBeInTheDocument();
    });
  });

  it('displays charts', async () => {
    employeeService.getDashboardStats.mockResolvedValueOnce({ data: mockDashboardStats });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  it('displays navigation links', async () => {
    employeeService.getDashboardStats.mockResolvedValueOnce({ data: mockDashboardStats });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('View Detailed Attendance')).toBeInTheDocument();
      expect(screen.getByText('Manage Employees')).toBeInTheDocument();
      expect(screen.getByText('View All Employees')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    employeeService.getDashboardStats.mockRejectedValueOnce(new Error('API Error'));
    
    renderDashboard();

    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
    });
    
    // Should show empty stats or error state
    expect(screen.getByText('0')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('has page title and subtitle', async () => {
    employeeService.getDashboardStats.mockResolvedValueOnce({ data: mockDashboardStats });
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Overview of your HRMS system')).toBeInTheDocument();
    });
  });
});
