import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IslandVerification } from '@/components/IslandVerification';

describe('Astro Core & React Island Smoke Tests', () => {
  it('should run tests in a jsdom environment', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });

  it('should resolve path aliases from @/*', () => {
    expect(IslandVerification).toBeDefined();
  });

  it('should successfully mount and render interactive React islands', () => {
    render(<IslandVerification title="Adopt A Run Island" initialCount={1200} />);
    
    expect(screen.getByText('Adopt A Run Island')).not.toBeNull();
    const container = screen.getByTestId('island-verification');
    expect(container.textContent).toMatch(/Current Count:\s*1200/i);

    const button = screen.getByRole('button', { name: /Increment Counter/i });
    fireEvent.click(button);
    expect(container.textContent).toMatch(/Current Count:\s*1201/i);
  });
});
