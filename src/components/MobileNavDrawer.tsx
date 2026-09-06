import React, { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $isNavOpen, closeNav } from '@/stores/shell';

export const MobileNavDrawer: React.FC = () => {
  const isOpen = useStore($isNavOpen);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeNav();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="mobile-nav-backdrop"
      onClick={closeNav}
      data-testid="mobile-nav-backdrop"
    >
      <div
        className="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mobile-nav-header">
          <a href="/signup" className="nav-brand-cta" onClick={closeNav}>
            <span className="brand-run">run</span> with us
          </a>
          <button
            type="button"
            className="mobile-nav-close"
            onClick={closeNav}
            aria-label="Close navigation"
          >
            &times;
          </button>
        </div>

        <nav className="mobile-nav-links">
          <a href="/routes" className="mobile-nav-link" onClick={closeNav}>
            routes
          </a>
          <a href="/charities" className="mobile-nav-link" onClick={closeNav}>
            charities
          </a>
          <a href="/donate" className="mobile-nav-link" onClick={closeNav}>
            donate
          </a>
          <a href="/log" className="mobile-nav-link" onClick={closeNav}>
            log a run
          </a>
        </nav>

        <div className="mobile-nav-footer">
          <a
            href="/signup"
            className="btn btn-primary mobile-cta-btn"
            onClick={closeNav}
          >
            run with us
          </a>
        </div>
      </div>
    </div>
  );
};

export default MobileNavDrawer;
