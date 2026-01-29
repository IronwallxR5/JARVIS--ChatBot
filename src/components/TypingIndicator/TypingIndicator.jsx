/**
 * TypingIndicator Component
 * JARVIS-themed animated thinking indicator
 */

import React, { memo } from 'react';
import './TypingIndicator.css';

const TypingIndicator = memo(() => (
  <div 
    className="typing-indicator-wrapper"
    role="status"
    aria-label="JARVIS is processing"
  >
    <div className="typing-indicator-container">
      <div className="typing-avatar">
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      <div className="typing-content">
        <span className="typing-label">JARVIS is processing</span>
        <div className="typing-dots" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  </div>
));

TypingIndicator.displayName = 'TypingIndicator';

export default TypingIndicator;
