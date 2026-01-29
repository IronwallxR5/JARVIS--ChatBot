/**
 * StreamingText Component
 * Renders streaming text with optimized performance
 * 
 * Performance Strategy:
 * - Uses plain text rendering during streaming (no Markdown parsing)
 * - Minimal DOM updates via CSS contain property
 * - GPU-accelerated cursor animation
 * - Content-visibility auto for off-screen optimization
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import './StreamingText.css';

/**
 * Animated cursor that indicates active streaming
 */
const StreamingCursor = memo(() => (
  <span className="streaming-text-cursor" aria-hidden="true">
    <span className="cursor-block" />
  </span>
));

StreamingCursor.displayName = 'StreamingCursor';

/**
 * StreamingText - Optimized plain text renderer for streaming content
 * 
 * Why plain text during streaming:
 * - Markdown parsing is expensive (regex, AST construction)
 * - Per-token Markdown = 100+ parse operations per second
 * - Plain text + CSS = O(1) DOM update per flush
 * - Markdown rendering happens once on stream completion
 */
const StreamingText = memo(({ text, showCursor = true }) => {
  if (!text) return null;

  return (
    <div className="streaming-text-container">
      <div className="streaming-text-content">
        {/* Plain text with preserved whitespace/newlines */}
        <span className="streaming-text">{text}</span>
        {showCursor && <StreamingCursor />}
      </div>
    </div>
  );
});

StreamingText.displayName = 'StreamingText';

StreamingText.propTypes = {
  text: PropTypes.string,
  showCursor: PropTypes.bool,
};

export default StreamingText;
