import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AnnouncementBanner } from '@/components/AnnouncementBanner';
import { MobileNavDrawer, NAV_EXIT_MS } from '@/components/MobileNavDrawer';
import {
  $announcementTicker,
  $isNavOpen,
  setAnnouncement,
  resetAnnouncement,
  openNav,
  closeNav,
} from '@/stores/shell';

describe('Header Interactive Components', () => {
  beforeEach(() => {
    resetAnnouncement();
    closeNav();
  });

  describe('AnnouncementBanner Island', () => {
    it('renders default announcement text and link', () => {
      render(<AnnouncementBanner />);
      const link = screen.getByRole('link');
      expect(link.getAttribute('href')).toBe('/signup');
      expect(link.textContent).toBe('Looking for Community Run Route Suggestions');
    });

    it('updates text and link dynamically from store', () => {
      render(<AnnouncementBanner />);
      act(() => {
        setAnnouncement('Next Group Run: Saturday 7am', '/routes');
      });
      const link = screen.getByRole('link');
      expect(link.getAttribute('href')).toBe('/routes');
      expect(link.textContent).toBe('Next Group Run: Saturday 7am');
    });

    it('dismisses banner on dismiss button click and adds announcement-dismissed class', () => {
      render(<AnnouncementBanner />);
      const dismissBtn = screen.getByRole('button', { name: /dismiss announcement/i });
      fireEvent.click(dismissBtn);
      expect($announcementTicker.get().isVisible).toBe(false);
      expect(screen.queryByRole('link')).toBeNull();
      expect(document.documentElement.classList.contains('announcement-dismissed')).toBe(true);
    });

    it('does not render when isVisible is false', () => {
      $announcementTicker.setKey('isVisible', false);
      const { container } = render(<AnnouncementBanner />);
      expect(container.firstChild).toBeNull();
    });

    it('dismisses banner on mount if already dismissed in sessionStorage', () => {
      sessionStorage.setItem('adoptarun_announcement_dismissed', 'true');
      const { container } = render(<AnnouncementBanner />);
      expect(container.firstChild).toBeNull();
      expect($announcementTicker.get().isVisible).toBe(false);
      expect(document.documentElement.classList.contains('announcement-dismissed')).toBe(true);
    });
  });

  describe('MobileNavDrawer Island', () => {
    it('does not render content when $isNavOpen is false', () => {
      render(<MobileNavDrawer />);
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('renders mobile navigation links when open', () => {
      act(() => {
        openNav();
      });
      render(<MobileNavDrawer />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).not.toBeNull();

      const routesLink = screen.getByRole('link', { name: /routes/i });
      expect(routesLink.getAttribute('href')).toBe('/routes');

      const charitiesLink = screen.getByRole('link', { name: /charities/i });
      expect(charitiesLink.getAttribute('href')).toBe('/charities');

      const donateLink = screen.getByRole('link', { name: /donate/i });
      expect(donateLink.getAttribute('href')).toBe('/donate');

      const logLink = screen.getByRole('link', { name: /log a run/i });
      expect(logLink.getAttribute('href')).toBe('/log');

      const runWithUsLinks = screen.getAllByRole('link', { name: /run with us/i });
      expect(runWithUsLinks.length).toBeGreaterThan(0);
      runWithUsLinks.forEach((link) => {
        expect(link.getAttribute('href')).toBe('/signup');
      });
    });

    it('closes drawer when clicking backdrop or close button', () => {
      act(() => {
        openNav();
      });
      render(<MobileNavDrawer />);

      const closeButton = screen.getByRole('button', { name: /close navigation/i });
      fireEvent.click(closeButton);
      expect($isNavOpen.get()).toBe(false);
    });

    it('closes drawer on Escape key press', () => {
      act(() => {
        openNav();
      });
      render(<MobileNavDrawer />);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect($isNavOpen.get()).toBe(false);
    });

    it('offers a sign up link to the adoption portal', () => {
      act(() => {
        openNav();
      });
      render(<MobileNavDrawer />);

      const signUpLink = screen.getByRole('link', { name: /sign up/i });
      expect(signUpLink.getAttribute('href')).toBe('/signup');
    });

    it('plays the exit state before unmounting the dialog', () => {
      vi.useFakeTimers();
      try {
        act(() => {
          openNav();
        });
        render(<MobileNavDrawer />);

        act(() => {
          closeNav();
        });
        expect(screen.getByTestId('mobile-nav-backdrop').getAttribute('data-state')).toBe('closing');

        act(() => {
          vi.advanceTimersByTime(NAV_EXIT_MS);
        });
        expect(screen.queryByRole('dialog')).toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });
  });
});

