import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../../components/Modal';

describe('Modal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <p>Modal content</p>,
  };

  it('renders when isOpen is true', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    
    const backdrop = screen.getByText('Test Modal').closest('.modal-backdrop');
    fireEvent.click(backdrop);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when modal content is clicked', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    
    const modalContent = screen.getByText('Modal content');
    fireEvent.click(modalContent);
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders with different sizes', () => {
    const { container } = render(<Modal {...defaultProps} size="lg" />);
    expect(container.querySelector('.modal-lg')).toBeInTheDocument();
  });

  it('renders with small size', () => {
    const { container } = render(<Modal {...defaultProps} size="sm" />);
    expect(container.querySelector('.modal-sm')).toBeInTheDocument();
  });

  it('sets body overflow to hidden when open', () => {
    render(<Modal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('resets body overflow when closed', () => {
    const { rerender } = render(<Modal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
    
    rerender(<Modal {...defaultProps} isOpen={false} />);
    expect(document.body.style.overflow).toBe('unset');
  });

  it('resets body overflow on unmount', () => {
    const { unmount } = render(<Modal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
    
    unmount();
    expect(document.body.style.overflow).toBe('unset');
  });
});
