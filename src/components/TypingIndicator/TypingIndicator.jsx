/**
 * TypingIndicator Component
 * Shows animated dots when the bot is thinking
 */

import React, { memo } from 'react';
import './TypingIndicator.css';

const TypingIndicator = memo(() => (
  <div 
    className="typing-indicator-wrapper"
    role="status"
    aria-label="JARVIS is thinking"
  >
    <div className="typing-indicator-container">
      <div className="typing-avatar">J</div>
      <div className="typing-content">
        <span className="typing-label">JARVIS is thinking</span>
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
