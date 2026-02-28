import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Spinner from '../../components/Spinner';

describe('Spinner Component', () => {
  it('renders with default props', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('.spinner-wrapper')).toBeInTheDocument();
    expect(container.querySelector('.spinner-md')).toBeInTheDocument();
  });

  it('renders with small size', () => {
    const { container } = render(<Spinner size="sm" />);
    expect(container.querySelector('.spinner-sm')).toBeInTheDocument();
  });

  it('renders with large size', () => {
    const { container } = render(<Spinner size="lg" />);
    expect(container.querySelector('.spinner-lg')).toBeInTheDocument();
  });

  it('renders with text', () => {
    render(<Spinner text="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders without text when not provided', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('.spinner-text')).not.toBeInTheDocument();
  });

  it('has spinning icon', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('.spinner-icon')).toBeInTheDocument();
  });
});
