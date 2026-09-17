import { describe, it, expect, beforeEach } from 'vitest';
import {
  $announcementTicker,
  $isNavOpen,
  ANNOUNCEMENT_STORAGE_KEY,
  isAnnouncementDismissed,
  setAnnouncement,
  dismissAnnouncement,
  resetAnnouncement,
  openNav,
  closeNav,
} from '@/stores/shell';

describe('Shell Nano Stores', () => {
  beforeEach(() => {
    resetAnnouncement();
    closeNav();
  });

  describe('$announcementTicker', () => {
    it('should have correct default state without fallbacks', () => {
      const state = $announcementTicker.get();
      expect(state.text).toBe('');
      expect(state.link).toBeUndefined();
      expect(state.isVisible).toBe(true);
    });

    it('should update announcement text and link via setAnnouncement', () => {
      setAnnouncement('New Announcement', '/routes');
      const state = $announcementTicker.get();
      expect(state.text).toBe('New Announcement');
      expect(state.link).toBe('/routes');
      expect(state.isVisible).toBe(true);
    });

    it('should support announcement text without a link', () => {
      setAnnouncement('Announcement with no link');
      const state = $announcementTicker.get();
      expect(state.text).toBe('Announcement with no link');
      expect(state.link).toBeUndefined();
      expect(state.isVisible).toBe(true);
    });

    it('should clamp announcement text to 120 characters', () => {
      const longText = 'A'.repeat(150);
      setAnnouncement(longText, '/signup');
      const state = $announcementTicker.get();
      expect(state.text?.length).toBe(120);
      expect(state.text).toBe('A'.repeat(120));
    });

    it('should set empty text when given empty string without fallback to slogan', () => {
      setAnnouncement('', '/signup');
      expect($announcementTicker.get().text).toBe('');

      setAnnouncement('   ', '/signup');
      expect($announcementTicker.get().text).toBe('');
    });

    it('should hide announcement, persist to sessionStorage, and add announcement-dismissed class on dismissAnnouncement', () => {
      dismissAnnouncement();
      expect($announcementTicker.get().isVisible).toBe(false);
      expect(isAnnouncementDismissed()).toBe(true);
      expect(sessionStorage.getItem(ANNOUNCEMENT_STORAGE_KEY)).toBe('true');
      expect(document.documentElement.classList.contains('announcement-dismissed')).toBe(true);
    });

    it('should reset announcement state, clear sessionStorage, and remove announcement-dismissed class', () => {
      setAnnouncement('Custom', '/custom');
      dismissAnnouncement();
      expect($announcementTicker.get().isVisible).toBe(false);
      expect(isAnnouncementDismissed()).toBe(true);
      expect(document.documentElement.classList.contains('announcement-dismissed')).toBe(true);

      resetAnnouncement();
      const state = $announcementTicker.get();
      expect(state.text).toBe('');
      expect(state.link).toBeUndefined();
      expect(state.isVisible).toBe(true);
      expect(isAnnouncementDismissed()).toBe(false);
      expect(sessionStorage.getItem(ANNOUNCEMENT_STORAGE_KEY)).toBeNull();
      expect(document.documentElement.classList.contains('announcement-dismissed')).toBe(false);
    });
  });

  describe('$isNavOpen', () => {
    it('should default to false', () => {
      expect($isNavOpen.get()).toBe(false);
    });

    it('should open nav via openNav', () => {
      openNav();
      expect($isNavOpen.get()).toBe(true);
    });

    it('should close nav via closeNav', () => {
      openNav();
      expect($isNavOpen.get()).toBe(true);
      closeNav();
      expect($isNavOpen.get()).toBe(false);
    });
  });
});
