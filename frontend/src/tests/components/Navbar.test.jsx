import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const renderWithRouter = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Navbar />
    </MemoryRouter>
  );
};

describe('Navbar Component', () => {
  it('renders brand name', () => {
    renderWithRouter();
    expect(screen.getByText('HRMS Lite')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderWithRouter();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('Attendance')).toBeInTheDocument();
  });

  it('highlights active link on dashboard', () => {
    renderWithRouter('/');
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('active');
  });

  it('highlights active link on employees page', () => {
    renderWithRouter('/employees');
    const employeesLink = screen.getByText('Employees').closest('a');
    expect(employeesLink).toHaveClass('active');
  });

  it('highlights active link on attendance page', () => {
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

  it('renders brand icon', () => {
    const { container } = renderWithRouter();
    expect(container.querySelector('.brand-icon')).toBeInTheDocument();
  });

  it('renders navigation icons', () => {
    const { container } = renderWithRouter();
    const navLinks = container.querySelectorAll('.nav-link svg');
    expect(navLinks.length).toBeGreaterThan(0);
  });
});
