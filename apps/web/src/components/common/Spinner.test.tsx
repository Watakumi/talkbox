import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  describe('accessibility', () => {
    it('should have role="status"', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have aria-label', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
    });
  });

  describe('sizes', () => {
    it('should render default md size', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-6', 'w-6');
    });

    it('should render sm size', () => {
      render(<Spinner size="sm" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-4', 'w-4');
    });

    it('should render lg size', () => {
      render(<Spinner size="lg" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-8', 'w-8');
    });
  });

  describe('styling', () => {
    it('should have animate-spin class', () => {
      render(<Spinner />);
      expect(screen.getByRole('status')).toHaveClass('animate-spin');
    });

    it('should apply custom className', () => {
      render(<Spinner className="custom-spinner" />);
      expect(screen.getByRole('status')).toHaveClass('custom-spinner');
    });
  });
});
