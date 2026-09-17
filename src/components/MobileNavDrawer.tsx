import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $isNavOpen, closeNav } from '@/stores/shell';

/** Matches the longest closing animation on `.mobile-nav-backdrop[data-state='closing']`. */
export const NAV_EXIT_MS = 400;

/** Page scroll distance that dismisses the open drawer; absorbs incidental nudges and overscroll bounce. */
export const SCROLL_DISMISS_PX = 32;

/** Viewports where CSS hides the drawer and shows the desktop header links. */
export const DESKTOP_NAV_QUERY = '(width > 768px)';

/** The menu toggle only shows below the desktop breakpoint; without matchMedia (jsdom) assume mobile. */
const isDesktopLayout = () =>
  typeof window.matchMedia === 'function' && window.matchMedia(DESKTOP_NAV_QUERY).matches;

const NAV_LINKS = [
  { href: '/routes', label: 'routes' },
  { href: '/charities', label: 'charities' },
  { href: '/donate', label: 'donate' },
  { href: '/log', label: 'log a run' },
  { href: '/signup', label: 'sign up' },
];

const normalizePath = (path: string) => path.replace(/\/+$/, '') || '/';

export const MobileNavDrawer: React.FC = () => {
  const isOpen = useStore($isNavOpen);
  // Stays true through the exit animation so the drawer can play out before unmounting
  const [isMounted, setIsMounted] = useState(isOpen);
  const [currentPath, setCurrentPath] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Only deliberate dismissals hand focus back to the toggle; scroll and resize closes leave it be
  const restoreFocusRef = useRef(false);

  const dismiss = () => {
    restoreFocusRef.current = true;
    closeNav();
  };

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      return;
    }
    const timer = window.setTimeout(() => setIsMounted(false), NAV_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    setCurrentPath(normalizePath(window.location.pathname));
    const root = document.documentElement;
    root.classList.add('nav-open');
    closeRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismiss();
        return;
      }

      // Keep Tab cycling inside the dialog
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>('a[href], button');
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    // Scrolling the page is read as intent to leave the menu
    const scrollOrigin = window.scrollY;
    const handleScroll = () => {
      if (Math.abs(window.scrollY - scrollOrigin) > SCROLL_DISMISS_PX) {
        closeNav();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
      root.classList.remove('nav-open');
      if (restoreFocusRef.current && !isDesktopLayout()) {
        document.getElementById('nav-mobile-toggle')?.focus();
      }
      restoreFocusRef.current = false;
    };
  }, [isOpen]);

  // Past the mobile breakpoint CSS hides the drawer; close it too, so the open state
  // (and the header's nav-open fade) never outlives the hidden dialog
  useEffect(() => {
    if (!isOpen || typeof window.matchMedia !== 'function') return;

    const desktop = window.matchMedia(DESKTOP_NAV_QUERY);
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) closeNav();
    };
    desktop.addEventListener('change', handleChange);
    return () => desktop.removeEventListener('change', handleChange);
  }, [isOpen]);

  if (!isOpen && !isMounted) {
    return null;
  }

  return (
    <div
      className="mobile-nav-backdrop"
      data-state={isOpen ? 'open' : 'closing'}
      onClick={dismiss}
      data-testid="mobile-nav-backdrop"
    >
      <div className="mobile-nav-veil" aria-hidden="true" />
      <div
        ref={dialogRef}
        id="mobile-nav"
        className="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mobile-nav-header">
          <a href="/signup" className="nav-brand-cta" onClick={closeNav}>
            <span className="brand-run">run</span> <span className="brand-with">with us</span>
            <svg className="cta-route" viewBox="0 0 40 16" aria-hidden="true" focusable="false">
              <path className="cta-route-line" pathLength={1} d="M1 12 C 7 12, 9 4, 15 4 S 23 12, 29 8 L 37 8" />
              <path className="cta-route-head" pathLength={1} d="M33 4 L37 8 L33 12" />
            </svg>
          </a>
          <button
            ref={closeRef}
            type="button"
            className="mobile-nav-close"
            onClick={dismiss}
            aria-label="Close navigation"
          >
            <span className="nav-burger nav-burger--close" aria-hidden="true">
              <span className="nav-burger-bar" />
              <span className="nav-burger-bar" />
            </span>
          </button>
        </div>

        <nav className="mobile-nav-links" aria-label="Primary">
          <ul className="mobile-nav-list">
            {NAV_LINKS.map(({ href, label }, i) => (
              <li key={href} style={{ '--i': i } as React.CSSProperties}>
                <a
                  href={href}
                  className="mobile-nav-link"
                  aria-current={currentPath === href ? 'page' : undefined}
                  onClick={closeNav}
                >
                  {label}
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <use href="#icon-arrow-up-right" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default MobileNavDrawer;
