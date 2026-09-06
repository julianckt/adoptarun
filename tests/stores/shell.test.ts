import { describe, it, expect, beforeEach } from 'vitest';
import {
  $announcementTicker,
  $isNavOpen,
  $isLogModalOpen,
  DEFAULT_ANNOUNCEMENT_TEXT,
  DEFAULT_ANNOUNCEMENT_LINK,
  FALLBACK_SLOGAN_TEXT,
  setAnnouncement,
  dismissAnnouncement,
  resetAnnouncement,
  toggleNav,
  openNav,
  closeNav,
  toggleLogModal,
  openLogModal,
  closeLogModal,
} from '@/stores/shell';

describe('Shell Nano Stores', () => {
  beforeEach(() => {
    resetAnnouncement();
    closeNav();
    closeLogModal();
  });

  describe('$announcementTicker', () => {
    it('should have correct default state', () => {
      const state = $announcementTicker.get();
      expect(state.text).toBe(DEFAULT_ANNOUNCEMENT_TEXT);
      expect(state.link).toBe(DEFAULT_ANNOUNCEMENT_LINK);
      expect(state.isVisible).toBe(true);
    });

    it('should update announcement text and link via setAnnouncement', () => {
      setAnnouncement('New Announcement', '/routes');
      const state = $announcementTicker.get();
      expect(state.text).toBe('New Announcement');
      expect(state.link).toBe('/routes');
      expect(state.isVisible).toBe(true);
    });

    it('should clamp announcement text to 120 characters', () => {
      const longText = 'A'.repeat(150);
      setAnnouncement(longText, '/signup');
      const state = $announcementTicker.get();
      expect(state.text.length).toBe(120);
      expect(state.text).toBe('A'.repeat(120));
    });

    it('should fallback to default slogan if text is empty or whitespace only', () => {
      setAnnouncement('', '/signup');
      expect($announcementTicker.get().text).toBe(FALLBACK_SLOGAN_TEXT);

      setAnnouncement('   ', '/signup');
      expect($announcementTicker.get().text).toBe(FALLBACK_SLOGAN_TEXT);
    });

    it('should hide announcement on dismissAnnouncement', () => {
      dismissAnnouncement();
      expect($announcementTicker.get().isVisible).toBe(false);
    });

    it('should reset announcement state to defaults', () => {
      setAnnouncement('Custom', '/custom');
      dismissAnnouncement();
      expect($announcementTicker.get().isVisible).toBe(false);

      resetAnnouncement();
      const state = $announcementTicker.get();
      expect(state.text).toBe(DEFAULT_ANNOUNCEMENT_TEXT);
      expect(state.link).toBe(DEFAULT_ANNOUNCEMENT_LINK);
      expect(state.isVisible).toBe(true);
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

    it('should toggle nav state via toggleNav', () => {
      expect($isNavOpen.get()).toBe(false);
      toggleNav();
      expect($isNavOpen.get()).toBe(true);
      toggleNav();
      expect($isNavOpen.get()).toBe(false);
    });
  });

  describe('$isLogModalOpen', () => {
    it('should default to false', () => {
      expect($isLogModalOpen.get()).toBe(false);
    });

    it('should open log modal via openLogModal', () => {
      openLogModal();
      expect($isLogModalOpen.get()).toBe(true);
    });

    it('should close log modal via closeLogModal', () => {
      openLogModal();
      expect($isLogModalOpen.get()).toBe(true);
      closeLogModal();
      expect($isLogModalOpen.get()).toBe(false);
    });

    it('should toggle log modal state via toggleLogModal', () => {
      expect($isLogModalOpen.get()).toBe(false);
      toggleLogModal();
      expect($isLogModalOpen.get()).toBe(true);
      toggleLogModal();
      expect($isLogModalOpen.get()).toBe(false);
    });
  });
});
