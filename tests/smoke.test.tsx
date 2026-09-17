import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AnnouncementBanner } from '@/components/AnnouncementBanner';
import { resetAnnouncement } from '@/stores/shell';

describe('Astro Core & React Island Smoke Tests', () => {
  beforeEach(() => {
    resetAnnouncement();
  });

  it('should run tests in a jsdom environment', () => {
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
  });

  it('should resolve path aliases from @/*', () => {
    expect(AnnouncementBanner).toBeDefined();
  });

  it('should successfully mount and render interactive React islands', () => {
    render(<AnnouncementBanner text="Adopt A Run Island" />);

    expect(screen.getByText('Adopt A Run Island')).not.toBeNull();

    const dismissBtn = screen.getByRole('button', { name: /Dismiss announcement/i });
    expect(dismissBtn).not.toBeNull();

    fireEvent.click(dismissBtn);
    expect(screen.queryByText('Adopt A Run Island')).toBeNull();
  });
});
