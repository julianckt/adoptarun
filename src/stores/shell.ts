import { atom, map } from 'nanostores';

export interface AnnouncementState {
  text?: string;
  link?: string;
  isVisible: boolean;
}

export const ANNOUNCEMENT_STORAGE_KEY = 'adoptarun_announcement_dismissed';

export function isAnnouncementDismissed(): boolean {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return false;
  }
  try {
    return sessionStorage.getItem(ANNOUNCEMENT_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

// 1. $announcementTicker: manages reactive banner text, link, and visibility
export const $announcementTicker = map<AnnouncementState>({
  text: '',
  link: undefined,
  isVisible: true,
});

export function setAnnouncement(text: string = '', link?: string) {
  const truncatedText = text.slice(0, 120).trim();
  $announcementTicker.set({
    text: truncatedText,
    link: link?.trim() ? link.trim() : undefined,
    isVisible: true,
  });
}

export function dismissAnnouncement() {
  $announcementTicker.setKey('isVisible', false);
  if (typeof window !== 'undefined') {
    if (window.sessionStorage) {
      try {
        sessionStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, 'true');
      } catch {
        // safe fallback if storage unavailable
      }
    }
    document.documentElement.classList.add('announcement-dismissed');
  }
}

export function resetAnnouncement(text: string = '', link?: string) {
  if (typeof window !== 'undefined') {
    if (window.sessionStorage) {
      try {
        sessionStorage.removeItem(ANNOUNCEMENT_STORAGE_KEY);
      } catch {}
    }
    document.documentElement.classList.remove('announcement-dismissed');
  }
  $announcementTicker.set({
    text: text.trim(),
    link: link?.trim() ? link.trim() : undefined,
    isVisible: true,
  });
}

// 2. $isNavOpen: manages mobile drawer open/close state
export const $isNavOpen = atom<boolean>(false);

export function toggleNav() {
  $isNavOpen.set(!$isNavOpen.get());
}

export function openNav() {
  $isNavOpen.set(true);
}

export function closeNav() {
  $isNavOpen.set(false);
}

// 3. $isLogModalOpen: manages quick run log dialog state
export const $isLogModalOpen = atom<boolean>(false);

export function toggleLogModal() {
  $isLogModalOpen.set(!$isLogModalOpen.get());
}

export function openLogModal() {
  $isLogModalOpen.set(true);
}

export function closeLogModal() {
  $isLogModalOpen.set(false);
}
