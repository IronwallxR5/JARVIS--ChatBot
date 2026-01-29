/**
 * EmptyState Component
 * JARVIS-themed welcome screen with quick actions
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { QUICK_ACTIONS } from '../../constants';
import './EmptyState.css';

/**
 * JARVIS Logo/Icon
 */
const JarvisLogo = memo(() => (
  <div className="jarvis-logo" aria-hidden="true">
    <div className="logo-core">
      <div className="core-inner"></div>
    </div>
    <div className="logo-ring ring-1"></div>
    <div className="logo-ring ring-2"></div>
    <div className="logo-ring ring-3"></div>
    <div className="logo-particles">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="particle" style={{ '--i': i }} />
      ))}
    </div>
  </div>
));

JarvisLogo.displayName = 'JarvisLogo';

/**
 * Quick action button for suggestions
 */
const QuickAction = memo(({ label, prompt, icon, onClick }) => (
  <button
    className="quick-action-button"
    onClick={() => onClick(prompt)}
    aria-label={label}
  >
    <span className="quick-action-icon">{icon}</span>
    <span className="quick-action-label">{label}</span>
  </button>
));

QuickAction.displayName = 'QuickAction';

/**
 * Empty state with JARVIS branding and suggestions
 */
const EmptyState = memo(({ onActionClick, isConfigured = true }) => {
  if (!isConfigured) {
    return (
      <div className="empty-state error-state" role="status">
        <div className="empty-state-icon error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="empty-state-title">API Key Required</h2>
        <p className="empty-state-description">
          To initialize JARVIS, please configure your Gemini API key.
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

  // Icon mapping for quick actions
  const actionIcons = ['💡', '📝', '🔍', '🚀'];

  return (
    <div className="empty-state" role="status">
      <JarvisLogo />
      
      <div className="empty-state-content">
        <h2 className="empty-state-title">
          <span className="greeting">Good {getTimeOfDay()},</span>
          <span className="question">How can I assist you?</span>
        </h2>
        <p className="empty-state-description">
          I'm JARVIS — your personal AI system. I can help with analysis, writing, 
          problem-solving, and strategic thinking. What would you like to explore?
        </p>
      </div>
      
      <div className="quick-actions" role="group" aria-label="Quick action suggestions">
        {QUICK_ACTIONS.map((action, index) => (
          <QuickAction
            key={index}
            label={action.label}
            prompt={action.prompt}
            icon={actionIcons[index % actionIcons.length]}
            onClick={onActionClick}
          />
        ))}
      </div>
      
      <div className="system-status" aria-hidden="true">
        <span className="status-dot"></span>
        <span className="status-text">All systems operational</span>
      </div>
    </div>
  );
});

/**
 * Get time-appropriate greeting
 */
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

EmptyState.displayName = 'EmptyState';

EmptyState.propTypes = {
  onActionClick: PropTypes.func,
  isConfigured: PropTypes.bool,
};

export default EmptyState;
