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
