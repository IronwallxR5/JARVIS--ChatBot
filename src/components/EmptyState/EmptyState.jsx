/**
 * EmptyState Component
 * Displayed when there are no messages or when API is not configured
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { QUICK_ACTIONS } from '../../constants';
import './EmptyState.css';

/**
 * Quick action button for suggestions
 */
const QuickAction = memo(({ label, prompt, onClick }) => (
  <button
    className="quick-action-button"
    onClick={() => onClick(prompt)}
    aria-label={label}
  >
    {label}
  </button>
));

QuickAction.displayName = 'QuickAction';

/**
 * Empty state with suggestions
 */
const EmptyState = memo(({ onActionClick, isConfigured = true }) => {
  if (!isConfigured) {
    return (
      <div className="empty-state" role="status">
        <div className="empty-state-icon error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="empty-state-title">API Key Required</h2>
        <p className="empty-state-description">
          To start chatting with JARVIS, please configure your Gemini API key.
        </p>
        <div className="empty-state-instructions">
          <code>VITE_GEMINI_API_KEY=your_api_key</code>
          <p>Add this to your <code>.env.local</code> file</p>
        </div>
        <a 
          href="https://makersuite.google.com/app/apikey" 
          target="_blank" 
          rel="noopener noreferrer"
          className="empty-state-link"
        >
          Get your API key →
        </a>
      </div>
    );
  }

  return (
    <div className="empty-state" role="status">
      <div className="empty-state-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <h2 className="empty-state-title">How can I help you today?</h2>
      <p className="empty-state-description">
        I'm JARVIS, your AI assistant. Ask me anything or try one of these suggestions:
      </p>
      <div className="quick-actions" role="group" aria-label="Quick action suggestions">
        {QUICK_ACTIONS.map((action, index) => (
          <QuickAction
            key={index}
            label={action.label}
            prompt={action.prompt}
            onClick={onActionClick}
          />
        ))}
      </div>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

EmptyState.propTypes = {
  onActionClick: PropTypes.func,
  isConfigured: PropTypes.bool,
};

export default EmptyState;
