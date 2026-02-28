import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';

const renderWithRouter = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <BottomNav />
    </MemoryRouter>
  );
};

describe('BottomNav Component', () => {
  it('renders navigation items', () => {
    renderWithRouter();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('Attendance')).toBeInTheDocument();
  });

  it('highlights active item on dashboard', () => {
    renderWithRouter('/');
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('active');
  });

  it('highlights active item on employees page', () => {
    renderWithRouter('/employees');
    const employeesLink = screen.getByText('Employees').closest('a');
    expect(employeesLink).toHaveClass('active');
  });

  it('highlights active item on attendance page', () => {
    renderWithRouter('/attendance');
    const attendanceLink = screen.getByText('Attendance').closest('a');
    expect(attendanceLink).toHaveClass('active');
  });

  it('has correct navigation hrefs', () => {
    renderWithRouter();
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('Employees').closest('a')).toHaveAttribute('href', '/employees');
    expect(screen.getByText('Attendance').closest('a')).toHaveAttribute('href', '/attendance');
  });

  it('renders navigation icons', () => {
    const { container } = renderWithRouter();
    const icons = container.querySelectorAll('.bottom-nav-item svg');
    expect(icons.length).toBe(3);
  });

  it('has bottom-nav class', () => {
    const { container } = renderWithRouter();
    expect(container.querySelector('.bottom-nav')).toBeInTheDocument();
  });
});
