/**
 * ErrorBanner Component
 * Displays error messages with dismiss functionality
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import './ErrorBanner.css';

const ErrorBanner = memo(({ message, onDismiss, onRetry }) => {
  if (!message) return null;

  return (
    <div 
      className="error-banner" 
      role="alert"
      aria-live="polite"
    >
      <div className="error-banner-content">
        <svg 
          className="error-icon" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span className="error-message">{message}</span>
      </div>
      <div className="error-banner-actions">
        {onRetry && (
          <button 
            className="error-action retry"
            onClick={onRetry}
            aria-label="Retry"
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button 
            className="error-action dismiss"
            onClick={onDismiss}
            aria-label="Dismiss error"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
});

ErrorBanner.displayName = 'ErrorBanner';

ErrorBanner.propTypes = {
  message: PropTypes.string,
  onDismiss: PropTypes.func,
  onRetry: PropTypes.func,
};

export default ErrorBanner;
