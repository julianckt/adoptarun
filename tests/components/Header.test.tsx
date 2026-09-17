import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AnnouncementBanner } from '@/components/AnnouncementBanner';
import {
  MobileNavDrawer,
  NAV_EXIT_MS,
  SCROLL_DISMISS_PX,
  DESKTOP_NAV_QUERY,
} from '@/components/MobileNavDrawer';
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
    it('does not render when no text is provided in props or store', () => {
      const { container } = render(<AnnouncementBanner />);
      expect(container.firstChild).toBeNull();
    });

    it('renders announcement text and link when passed as props', () => {
      render(<AnnouncementBanner text="Next Run: Sat 8am" link="/signup" />);
      const link = screen.getByRole('link');
      expect(link.getAttribute('href')).toBe('/signup');
      expect(link.textContent).toBe('Next Run: Sat 8am');
    });

    it('renders announcement as plain text without link when link is omitted', () => {
      render(<AnnouncementBanner text="Notice: Event Postponed" />);
      expect(screen.queryByRole('link')).toBeNull();
      const textEl = screen.getByText('Notice: Event Postponed');
      expect(textEl).toBeDefined();
      expect(textEl.tagName.toLowerCase()).toBe('span');
      expect(textEl.className).toContain('announcement-text');
    });

    it('updates text and link dynamically from store', () => {
      render(<AnnouncementBanner text="Initial Text" link="/initial" />);
      act(() => {
        setAnnouncement('Next Group Run: Saturday 7am', '/routes');
      });
      const link = screen.getByRole('link');
      expect(link.getAttribute('href')).toBe('/routes');
      expect(link.textContent).toBe('Next Group Run: Saturday 7am');
    });

    it('renders text only from store when setAnnouncement has no link', () => {
      render(<AnnouncementBanner />);
      act(() => {
        setAnnouncement('Next Group Run: Saturday 7am');
      });
      expect(screen.queryByRole('link')).toBeNull();
      expect(screen.getByText('Next Group Run: Saturday 7am')).toBeDefined();
    });

    it('dismisses banner on dismiss button click and adds announcement-dismissed class', () => {
      render(<AnnouncementBanner text="Dismissible banner" link="/test" />);
      const dismissBtn = screen.getByRole('button', { name: /dismiss announcement/i });
      fireEvent.click(dismissBtn);
      expect($announcementTicker.get().isVisible).toBe(false);
      expect(screen.queryByRole('link')).toBeNull();
      expect(document.documentElement.classList.contains('announcement-dismissed')).toBe(true);
    });

    it('does not render when isVisible is false', () => {
      $announcementTicker.setKey('isVisible', false);
      const { container } = render(<AnnouncementBanner text="Some text" />);
      expect(container.firstChild).toBeNull();
    });

    it('dismisses banner on mount if already dismissed in sessionStorage', () => {
      sessionStorage.setItem('adoptarun_announcement_dismissed', 'true');
      const { container } = render(<AnnouncementBanner text="Some text" />);
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

      const homeLink = screen.getByRole('link', { name: /^home$/i });
      expect(homeLink.getAttribute('href')).toBe('/');

      const routesLink = screen.getByRole('link', { name: /routes/i });
      expect(routesLink.getAttribute('href')).toBe('/routes');

      const charitiesLink = screen.getByRole('link', { name: /charities/i });
      expect(charitiesLink.getAttribute('href')).toBe('/charities');

      const donateLink = screen.getByRole('link', { name: /donate/i });
      expect(donateLink.getAttribute('href')).toBe('/donate');

      const faqsLink = screen.getByRole('link', { name: /faqs/i });
      expect(faqsLink.getAttribute('href')).toBe('/faqs');

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

    it('closes drawer once the page scrolls past the dismiss threshold', () => {
      act(() => {
        openNav();
      });
      render(<MobileNavDrawer />);

      const setScrollY = (y: number) =>
        Object.defineProperty(window, 'scrollY', { value: y, configurable: true, writable: true });

      try {
        setScrollY(SCROLL_DISMISS_PX);
        fireEvent.scroll(window);
        expect($isNavOpen.get()).toBe(true);

        setScrollY(SCROLL_DISMISS_PX + 1);
        fireEvent.scroll(window);
        expect($isNavOpen.get()).toBe(false);
      } finally {
        setScrollY(0);
      }
    });

    it('closes and clears nav-open when the viewport widens to the desktop layout', () => {
      const listeners = new Set<(e: MediaQueryListEvent) => void>();
      const matchMedia = vi.fn().mockReturnValue({
        matches: false,
        media: DESKTOP_NAV_QUERY,
        addEventListener: (_type: string, cb: (e: MediaQueryListEvent) => void) => listeners.add(cb),
        removeEventListener: (_type: string, cb: (e: MediaQueryListEvent) => void) => listeners.delete(cb),
      });
      vi.stubGlobal('matchMedia', matchMedia);

      try {
        act(() => {
          openNav();
        });
        render(<MobileNavDrawer />);
        expect(matchMedia).toHaveBeenCalledWith(DESKTOP_NAV_QUERY);
        expect(document.documentElement.classList.contains('nav-open')).toBe(true);

        act(() => {
          listeners.forEach((cb) => cb({ matches: true } as MediaQueryListEvent));
        });
        expect($isNavOpen.get()).toBe(false);
        expect(document.documentElement.classList.contains('nav-open')).toBe(false);
      } finally {
        vi.unstubAllGlobals();
      }
    });

    describe('focus return on close', () => {
      let toggle: HTMLButtonElement;

      beforeEach(() => {
        toggle = document.createElement('button');
        toggle.id = 'nav-mobile-toggle';
        document.body.appendChild(toggle);
      });

      afterEach(() => {
        toggle.remove();
        vi.unstubAllGlobals();
      });

      const openDrawer = () => {
        act(() => {
          openNav();
        });
        render(<MobileNavDrawer />);
      };

      it('returns focus to the menu toggle when closed with Escape', () => {
        openDrawer();
        fireEvent.keyDown(window, { key: 'Escape' });
        expect(document.activeElement).toBe(toggle);
      });

      it('returns focus to the menu toggle when closed with the close button', () => {
        openDrawer();
        fireEvent.click(screen.getByRole('button', { name: /close navigation/i }));
        expect(document.activeElement).toBe(toggle);
      });

      it('returns focus to the menu toggle when the backdrop is clicked', () => {
        openDrawer();
        fireEvent.click(screen.getByTestId('mobile-nav-backdrop'));
        expect($isNavOpen.get()).toBe(false);
        expect(document.activeElement).toBe(toggle);
      });

      it('leaves focus alone when scrolling dismisses the drawer', () => {
        openDrawer();
        const setScrollY = (y: number) =>
          Object.defineProperty(window, 'scrollY', { value: y, configurable: true, writable: true });

        try {
          setScrollY(SCROLL_DISMISS_PX + 1);
          fireEvent.scroll(window);
          expect($isNavOpen.get()).toBe(false);
          expect(document.activeElement).not.toBe(toggle);
        } finally {
          setScrollY(0);
        }
      });

      it('does not focus the toggle while the desktop layout hides it', () => {
        vi.stubGlobal(
          'matchMedia',
          vi.fn().mockReturnValue({
            matches: true,
            media: DESKTOP_NAV_QUERY,
            addEventListener: () => {},
            removeEventListener: () => {},
          })
        );
        openDrawer();
        fireEvent.keyDown(window, { key: 'Escape' });
        expect($isNavOpen.get()).toBe(false);
        expect(document.activeElement).not.toBe(toggle);
      });
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

