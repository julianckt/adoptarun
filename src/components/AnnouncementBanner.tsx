import React, { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $announcementTicker, dismissAnnouncement, isAnnouncementDismissed } from '@/stores/shell';

export interface AnnouncementBannerProps {
  text?: string;
  link?: string;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  text: propText,
  link: propLink,
}) => {
  const ticker = useStore($announcementTicker);

  useEffect(() => {
    if (isAnnouncementDismissed()) {
      dismissAnnouncement();
    }
  }, []);

  if (!ticker.isVisible) {
    return null;
  }

  const text = (ticker.text || propText || '').trim();
  const link = ticker.link !== undefined ? ticker.link : propLink;
  const trimmedLink = link?.trim();

  if (!text) {
    return null;
  }

  const handleDismiss = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dismissAnnouncement();
  };

  return (
    <div className="announcement-bar-container">
      {trimmedLink ? (
        <a href={trimmedLink} className="announcement-link">
          {text}
        </a>
      ) : (
        <span className="announcement-text">{text}</span>
      )}
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
