import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AnnouncementBanner } from '@/components/AnnouncementBanner';
import { MobileNavDrawer } from '@/components/MobileNavDrawer';
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
  });

  describe('Header 5-Column Grid Layout & Alignment Spec', () => {
    const fs = require('fs');
    const path = require('path');
    const headerAstroPath = path.resolve(__dirname, '../../src/components/Header.astro');
    const componentsCssPath = path.resolve(__dirname, '../../src/styles/components.css');

    it('Header.astro contains persistent announcement slot and explicit column classes', () => {
      const headerContent = fs.readFileSync(headerAstroPath, 'utf-8');
      expect(headerContent).toContain('<div class="nav-announcement-slot">');
      expect(headerContent).toContain('nav-col-routes');
      expect(headerContent).toContain('nav-col-actions');
    });

    it('components.css contains 5-column grid and center alignment for .site-header-grid', () => {
      const cssContent = fs.readFileSync(componentsCssPath, 'utf-8');
      expect(cssContent).toMatch(/grid-template-columns:\s*1\.2fr\s+1fr\s+1fr\s+1fr\s+1fr;/);
      expect(cssContent).toMatch(/\.site-header-grid\s*\{[^}]*align-items:\s*center;/s);
    });

    it('components.css right-aligns stacked links in .nav-col-stack', () => {
      const cssContent = fs.readFileSync(componentsCssPath, 'utf-8');
      expect(cssContent).toMatch(/\.nav-col-stack\s*\{[^}]*align-items:\s*flex-end;/s);
      expect(cssContent).toMatch(/\.nav-col-stack\s*\{[^}]*text-align:\s*right;/s);
    });

    it('components.css defines explicit grid columns for slots and stacks', () => {
      const cssContent = fs.readFileSync(componentsCssPath, 'utf-8');
      expect(cssContent).toMatch(/\.nav-announcement-slot\s*\{[^}]*grid-column:\s*2\s*\/\s*span 2;/s);
      expect(cssContent).toMatch(/\.nav-col-routes\s*\{[^}]*grid-column:\s*4;/s);
      expect(cssContent).toMatch(/\.nav-col-actions\s*\{[^}]*grid-column:\s*5;/s);
    });

    it('components.css removes border-bottom from .site-header', () => {
      const cssContent = fs.readFileSync(componentsCssPath, 'utf-8');
      const headerMatch = cssContent.match(/\.site-header\s*\{([^}]+)\}/);
      expect(headerMatch).not.toBeNull();
      expect(headerMatch![1]).not.toMatch(/border-bottom\s*:/);
    });

    it('components.css contains anti-FOUC rule for dismissed announcement bar', () => {
      const cssContent = fs.readFileSync(componentsCssPath, 'utf-8');
      expect(cssContent).toMatch(/html\.announcement-dismissed\s+\.announcement-bar-container\s*\{\s*display:\s*none\s*!important;\s*\}/);
    });

    it('BaseLayout.astro contains pre-paint inline script checking sessionStorage', () => {
      const baseLayoutPath = path.resolve(__dirname, '../../src/layouts/BaseLayout.astro');
      const baseLayoutContent = fs.readFileSync(baseLayoutPath, 'utf-8');
      expect(baseLayoutContent).toContain('<script is:inline>');
      expect(baseLayoutContent).toContain("sessionStorage.getItem('adoptarun_announcement_dismissed')");
      expect(baseLayoutContent).toContain("document.documentElement.classList.add('announcement-dismissed')");
    });
  });
});
