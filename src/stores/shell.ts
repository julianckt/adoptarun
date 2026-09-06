import { atom, map } from 'nanostores';

export interface AnnouncementState {
  text: string;
  link: string;
  isVisible: boolean;
}

export const DEFAULT_ANNOUNCEMENT_TEXT = 'Looking for Community Run Route Suggestions';
export const DEFAULT_ANNOUNCEMENT_LINK = '/signup';
export const FALLBACK_SLOGAN_TEXT = 'by bringing people together through long-distance running and community art';

// 1. $announcementTicker: manages reactive banner text, link, and visibility
export const $announcementTicker = map<AnnouncementState>({
  text: DEFAULT_ANNOUNCEMENT_TEXT,
  link: DEFAULT_ANNOUNCEMENT_LINK,
  isVisible: true,
});

export function setAnnouncement(text: string, link: string = DEFAULT_ANNOUNCEMENT_LINK) {
  const truncatedText = text.slice(0, 120);
  $announcementTicker.set({
    text: truncatedText.trim() ? truncatedText : FALLBACK_SLOGAN_TEXT,
    link,
    isVisible: true,
  });
}

export function dismissAnnouncement() {
  $announcementTicker.setKey('isVisible', false);
}

export function resetAnnouncement() {
  $announcementTicker.set({
    text: DEFAULT_ANNOUNCEMENT_TEXT,
    link: DEFAULT_ANNOUNCEMENT_LINK,
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
