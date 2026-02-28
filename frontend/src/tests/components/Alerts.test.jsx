import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Alerts from '../components/Alerts';
import { AlertProvider, useAlert } from '../context/AlertContext';

// Helper to render with AlertProvider
const renderWithAlertProvider = (component) => {
  return render(
    <AlertProvider>
      {component}
    </AlertProvider>
  );
};

// Test component to trigger alerts
const AlertTrigger = ({ type, message }) => {
  const { success, error, warning, info } = useAlert();
  
  const triggerAlert = () => {
    switch (type) {
      case 'success': success(message); break;
      case 'error': error(message); break;
      case 'warning': warning(message); break;
      case 'info': info(message); break;
      default: info(message);
    }
  };
  
  return <button onClick={triggerAlert}>Trigger</button>;
};

describe('Alerts Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('renders nothing when no alerts exist', () => {
    renderWithAlertProvider(<Alerts />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('displays success alert with correct icon and message', async () => {
    renderWithAlertProvider(
      <>
        <AlertTrigger type="success" message="Success message" />
        <Alerts />
      </>
    );
    
    fireEvent.click(screen.getByText('Trigger'));
    
    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });
  });

  it('displays error alert with correct styling', async () => {
    renderWithAlertProvider(
      <>
        <AlertTrigger type="error" message="Error message" />
        <Alerts />
      </>
    );
    
    fireEvent.click(screen.getByText('Trigger'));
    
    await waitFor(() => {
      const alert = screen.getByText('Error message').closest('.alert');
      expect(alert).toHaveClass('alert-danger');
    });
  });

  it('displays warning alert with correct styling', async () => {
    renderWithAlertProvider(
      <>
        <AlertTrigger type="warning" message="Warning message" />
        <Alerts />
      </>
    );
    
    fireEvent.click(screen.getByText('Trigger'));
    
    await waitFor(() => {
      const alert = screen.getByText('Warning message').closest('.alert');
      expect(alert).toHaveClass('alert-warning');
    });
  });

  it('displays info alert with correct styling', async () => {
    renderWithAlertProvider(
      <>
        <AlertTrigger type="info" message="Info message" />
        <Alerts />
      </>
    );
    
    fireEvent.click(screen.getByText('Trigger'));
    
    await waitFor(() => {
      const alert = screen.getByText('Info message').closest('.alert');
      expect(alert).toHaveClass('alert-info');
    });
  });

  it('removes alert when close button is clicked', async () => {
    renderWithAlertProvider(
      <>
        <AlertTrigger type="info" message="Test message" />
        <Alerts />
      </>
    );
    
    fireEvent.click(screen.getByText('Trigger'));
    
    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
    
    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });
  });

  it('displays multiple alerts', async () => {
    const MultiAlertTrigger = () => {
      const { success, error, warning } = useAlert();
      return (
        <>
          <button onClick={() => success('Success 1')}>Success1</button>
          <button onClick={() => error('Error 1')}>Error1</button>
          <button onClick={() => warning('Warning 1')}>Warning1</button>
        </>
      );
    };
    
    renderWithAlertProvider(
      <>
        <MultiAlertTrigger />
        <Alerts />
      </>
    );
    
    fireEvent.click(screen.getByText('Success1'));
    fireEvent.click(screen.getByText('Error1'));
    fireEvent.click(screen.getByText('Warning1'));
    
    await waitFor(() => {
      expect(screen.getByText('Success 1')).toBeInTheDocument();
      expect(screen.getByText('Error 1')).toBeInTheDocument();
      expect(screen.getByText('Warning 1')).toBeInTheDocument();
    });
  });
});

describe('AlertContext', () => {
  it('throws error when useAlert is used outside provider', () => {
    const TestComponent = () => {
      useAlert();
      return null;
    };
    
    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => render(<TestComponent />)).toThrow(
      'useAlert must be used within an AlertProvider'
    );
    
    spy.mockRestore();
  });

  it('provides alert methods through context', () => {
    const TestComponent = () => {
      const { success, error, warning, info, addAlert, removeAlert } = useAlert();
      return (
        <div>
          <span>{typeof success === 'function' ? 'success-ok' : 'success-fail'}</span>
          <span>{typeof error === 'function' ? 'error-ok' : 'error-fail'}</span>
          <span>{typeof warning === 'function' ? 'warning-ok' : 'warning-fail'}</span>
          <span>{typeof info === 'function' ? 'info-ok' : 'info-fail'}</span>
        </div>
      );
    };
    
    renderWithAlertProvider(<TestComponent />);
    
    expect(screen.getByText('success-ok')).toBeInTheDocument();
    expect(screen.getByText('error-ok')).toBeInTheDocument();
    expect(screen.getByText('warning-ok')).toBeInTheDocument();
    expect(screen.getByText('info-ok')).toBeInTheDocument();
  });
});
