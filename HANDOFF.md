# Agent Handoff: Fix Announcement Banner Flash on Load & Accidental Dismissal

This document provides complete, self-contained context and exact step-by-step instructions for a second agent to eliminate the announcement banner flash-on-load bug and fix accidental premature dismissals in `adoptarun`.

---

## 1. Suggested Skills

The implementing agent should invoke:
1. **`tdd`**: Run and update Vitest test suites (`npx vitest run`).
2. **`impeccable`**: Ensure zero design system anti-patterns and compliance with [DESIGN.md](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/DESIGN.md).

---

## 2. Context Boundaries: Where to Look & What to Ignore

### Read ONLY These Exact Files:
1. [src/layouts/BaseLayout.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/layouts/BaseLayout.astro): Needs synchronous pre-paint inline script in `<head>`.
2. [src/styles/components.css](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/components.css): Needs `html.announcement-dismissed .announcement-bar-container` rule.
3. [src/stores/shell.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/stores/shell.ts): Nano Store controlling banner state, `sessionStorage`, and DOM class syncing.
4. [src/components/Header.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/Header.astro): Astro header template and pre-hydration click listener.
5. [src/components/AnnouncementBanner.tsx](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/AnnouncementBanner.tsx): React island component.
6. [tests/components/Header.test.tsx](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/tests/components/Header.test.tsx): Unit tests for banner island.
7. [tests/stores/shell.test.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/tests/stores/shell.test.ts): Unit tests for shell store.
8. [AGENTS.md](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/AGENTS.md): Core agent rules.

### Strictly DO NOT Read Or Ingest:
- **`docs/archive/`**: **Strictly forbidden.** Deprecated documentation per `AGENTS.md`. Never read or cite.
- **`src/pages/api/health.ts`**: API routes are unaffected.
- **`src/components/Footer.astro`**: Footer is unaffected.
- **`src/components/MobileNavDrawer.tsx`**: Mobile drawer is unaffected.
- **`src/components/IslandVerification.tsx`**: Smoke test component is unaffected.

---

## 3. Bug Diagnosis & Root Cause Summary

### Bug 1: Flash of Un-dismissed Content (FOUC)
- **Mechanism**: Astro statically generates the homepage HTML with `showAnnouncement = true` and initial store state `isVisible = true`. The browser downloads the HTML and immediately paints the announcement banner on the first frame.
- **Problem**: When JavaScript runs asynchronously after the paint (either the script in `Header.astro` or React hydration), it discovers that `isAnnouncementDismissed()` is `true` in `sessionStorage` and hides or unmounts the banner.
- **Visual Glitch**: The user sees the banner flash for ~50–200ms before suddenly vanishing on every page reload.

### Bug 2: Accidental `sessionStorage` Poisoning on Route Navigation
- **Mechanism**: Both `Header.astro` and `AnnouncementBanner.tsx` contained:
  ```ts
  if (window.location.pathname !== '/' || isAnnouncementDismissed()) {
    dismissAnnouncement();
  }
  ```
- **Problem**: Calling `dismissAnnouncement()` writes `sessionStorage.setItem('adoptarun_announcement_dismissed', 'true')`. Consequently, navigating to or loading ANY route other than `'/'` (such as `/signup`, `/routes`, or `/index.html`) treated the page URL as an explicit user dismissal action and permanently poisoned `sessionStorage`.
- **Visual Glitch**: As soon as a user visited any other page or clicked any link, returning to the homepage caused the banner to flash and disappear, even if the user never clicked the close button.

### Bug 3: Split and Conflicting Dismissal Logic
- `Header.astro` was directly mutating `(banner as HTMLElement).style.display = 'none'` while React was simultaneously managing state via `useStore($announcementTicker)`.

---

## 4. Architectural Solution

```
                       Browser Requests Page
                                 │
                                 ▼
                     Astro HTML arrives in browser
                                 │
                                 ▼
         ┌─────────────────────────────────────────────────┐
         │ <script is:inline> in BaseLayout.astro <head>   │
         │ Checks sessionStorage synchronously BEFORE paint│
         └───────────────────────┬─────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       Already Dismissed?                 Not Dismissed?
                 │                               │
                 ▼                               ▼
   Adds .announcement-dismissed           Normal Render
   to <html> element immediately                 │
                 │                               ▼
                 ▼                      Banner displays on
   CSS display: none !important         first paint with NO
   prevents first frame paint!          layout shift or flicker
   ===> ZERO FLASH (0ms) <===
```

1. **Pre-Paint Head Script in [BaseLayout.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/layouts/BaseLayout.astro)**:
   A lightweight synchronous inline script inside `<head>` checks `sessionStorage` and immediately applies class `announcement-dismissed` to `document.documentElement` before the DOM is painted.
2. **CSS Rule in [src/styles/components.css](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/components.css)**:
   `html.announcement-dismissed .announcement-bar-container { display: none !important; }`
3. **Synchronized Store in [src/stores/shell.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/stores/shell.ts)**:
   `dismissAnnouncement()` updates `$announcementTicker`, writes `sessionStorage`, and adds the CSS class. `resetAnnouncement()` cleans all three.
4. **Remove Erroneous Route Check**:
   Remove `window.location.pathname !== '/'` from all client scripts. Page-level visibility is already cleanly handled in Astro SSR via `showAnnouncement = Astro.url.pathname === '/' || Astro.url.pathname === ''`.

---

## 5. Exact Implementation Steps

### Step 1: Add Pre-Paint Script in [src/layouts/BaseLayout.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/layouts/BaseLayout.astro)
Inside `<head>` (around line 38), add:
```html
    <!-- Pre-paint check to prevent announcement banner FOUC -->
    <script is:inline>
      try {
        if (sessionStorage.getItem('adoptarun_announcement_dismissed') === 'true') {
          document.documentElement.classList.add('announcement-dismissed');
        }
      } catch (e) {}
    </script>
```

### Step 2: Add Anti-FOUC CSS Rule in [src/styles/components.css](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/styles/components.css)
Around line 142 (right before `.announcement-bar-container`), add:
```css
  html.announcement-dismissed .announcement-bar-container {
    display: none !important;
  }
```

### Step 3: Update Store in [src/stores/shell.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/stores/shell.ts)
Update `dismissAnnouncement` and `resetAnnouncement`:
```ts
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

export function resetAnnouncement() {
  if (typeof window !== 'undefined') {
    if (window.sessionStorage) {
      try {
        sessionStorage.removeItem(ANNOUNCEMENT_STORAGE_KEY);
      } catch {}
    }
    document.documentElement.classList.remove('announcement-dismissed');
  }
  $announcementTicker.set({
    text: DEFAULT_ANNOUNCEMENT_TEXT,
    link: DEFAULT_ANNOUNCEMENT_LINK,
    isVisible: true,
  });
}
```

### Step 4: Clean Up [src/components/Header.astro](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/Header.astro)
In `<script>` (around line 50), remove the `window.location.pathname !== '/'` check and raw `style.display` manipulations. Retain the pre-hydration click delegation:
```astro
<script>
  import { openNav, dismissAnnouncement } from '@/stores/shell';

  const toggle = document.getElementById('nav-mobile-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      openNav();
    });
  }

  // Pre-hydration click delegation: dismiss immediately if user clicks before React hydrates
  const slot = document.querySelector('.nav-announcement-slot');
  if (slot) {
    slot.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target && target.closest('.announcement-dismiss')) {
        e.preventDefault();
        e.stopPropagation();
        dismissAnnouncement();
      }
    });
  }
</script>
```

### Step 5: Clean Up [src/components/AnnouncementBanner.tsx](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/src/components/AnnouncementBanner.tsx)
Remove the `window.location.pathname !== '/'` check in `useEffect`:
```tsx
import React, { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $announcementTicker, dismissAnnouncement, isAnnouncementDismissed } from '@/stores/shell';

export const AnnouncementBanner: React.FC = () => {
  const ticker = useStore($announcementTicker);

  useEffect(() => {
    if (isAnnouncementDismissed()) {
      dismissAnnouncement();
    }
  }, []);

  if (!ticker.isVisible) {
    return null;
  }

  const handleDismiss = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dismissAnnouncement();
  };

  return (
    <div className="announcement-bar-container" role="region" aria-label="Announcement">
      <a href={ticker.link} className="announcement-link">
        {ticker.text}
      </a>
      <button
        type="button"
        className="announcement-dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
      >
        &times;
      </button>
    </div>
  );
};

export default AnnouncementBanner;
```

### Step 6: Update Tests in [tests/components/Header.test.tsx](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/tests/components/Header.test.tsx) & [tests/stores/shell.test.ts](file:///Users/julianchung/Documents/Work/Coding/antigravity/adoptarun/tests/stores/shell.test.ts)
1. In `tests/components/Header.test.tsx`:
   - Verify `AnnouncementBanner` adds `announcement-dismissed` class to `document.documentElement` upon click.
   - Verify `AnnouncementBanner` mounts as dismissed if `sessionStorage` already has `'true'`.
2. In `tests/stores/shell.test.ts`:
   - Verify `dismissAnnouncement()` sets store `isVisible = false`, persists to `sessionStorage`, and adds `announcement-dismissed` to `document.documentElement`.
   - Verify `resetAnnouncement()` clears store, `sessionStorage`, and removes `announcement-dismissed` from `document.documentElement`.

---

## 6. Verification & Done Criteria

1. **Run Unit Tests**:
   ```bash
   npx vitest run
   ```
   **Expected**: All 7 test files pass, 0 failures.

2. **Manual / Browser Verification**:
   - Visit `http://localhost:4321/`: Banner is visible and renders immediately.
   - Click the dismiss button `&times;`: Banner disappears immediately.
   - Reload the page `http://localhost:4321/`: Banner remains hidden with **0ms flash / no flicker**.
   - Clear `sessionStorage`:
     ```js
     sessionStorage.clear(); location.reload();
     ```
     Banner reappears normally.
   - Navigate to `/signup` or other links, then navigate back: Banner is **NOT** prematurely dismissed.
