import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FaUserTie, FaCalendarAlt } from 'react-icons/fa';
import EmptyState from '../../components/EmptyState';

describe('EmptyState Component', () => {
  it('renders with default props', () => {
    render(<EmptyState />);
    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<EmptyState title="No employees" />);
    expect(screen.getByText('No employees')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(
      <EmptyState 
        title="No employees" 
        description="Add your first employee to get started." 
      />
    );
    expect(screen.getByText('Add your first employee to get started.')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    render(<EmptyState title="No employees" />);
    expect(screen.queryByText('Add your first employee')).not.toBeInTheDocument();
  });

  it('renders with action button', () => {
    const onAction = vi.fn();
    render(
      <EmptyState 
        title="No employees" 
        action={<button onClick={onAction}>Add Employee</button>}
      />
    );
    
    const button = screen.getByRole('button', { name: 'Add Employee' });
    fireEvent.click(button);
    
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renders with custom icon', () => {
    const { container } = render(<EmptyState icon={FaUserTie} title="No users" />);
    expect(container.querySelector('.empty-icon')).toBeInTheDocument();
  });

  it('renders with calendar icon', () => {
    const { container } = render(<EmptyState icon={FaCalendarAlt} title="No events" />);
    expect(container.querySelector('.empty-icon')).toBeInTheDocument();
  });

  it('has correct structure', () => {
    const { container } = render(
      <EmptyState 
        title="No data" 
        description="Add some data"
        action={<button>Action</button>}
      />
    );
    
    expect(container.querySelector('.empty-state')).toBeInTheDocument();
    expect(container.querySelector('.empty-icon')).toBeInTheDocument();
    expect(container.querySelector('.empty-title')).toBeInTheDocument();
    expect(container.querySelector('.empty-description')).toBeInTheDocument();
    expect(container.querySelector('.empty-action')).toBeInTheDocument();
  });
});
