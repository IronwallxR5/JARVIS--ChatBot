/**
 * ChatInput Component
 * Input field with send button for chat messages
 */

import React, { memo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAutoResize } from '../../hooks';
import { KEYBOARD_SHORTCUTS, INPUT_VALIDATION } from '../../constants';
import './ChatInput.css';

/**
 * Send button with loading state
 */
const SendButton = memo(({ disabled, isLoading }) => (
  <button
    type="submit"
    className={`send-button ${isLoading ? 'loading' : ''}`}
    disabled={disabled}
    aria-label={isLoading ? 'Sending message...' : 'Send message'}
    title={isLoading ? 'Sending...' : 'Send message (Enter)'}
  >
    {isLoading ? (
      <div className="send-button-loader" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
    ) : (
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        aria-hidden="true"
      >
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    )}
  </button>
));

SendButton.displayName = 'SendButton';

/**
 * Main ChatInput component
 */
const ChatInput = memo(({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  isDisabled = false,
  placeholder = 'Message JARVIS...',
  inputRef: externalRef,
}) => {
  const internalRef = useRef(null);
  const textareaRef = externalRef || internalRef;
  
  // Auto-resize textarea
  useAutoResize(textareaRef, value, 200);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!value.trim() || isLoading || isDisabled) return;
    onSubmit(value);
  }, [value, isLoading, isDisabled, onSubmit]);

  const handleKeyDown = useCallback((e) => {
    // Submit on Enter (without Shift)
    if (e.key === KEYBOARD_SHORTCUTS.SEND_MESSAGE && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    
    // Clear on Escape
    if (e.key === KEYBOARD_SHORTCUTS.CLEAR_INPUT) {
      onChange('');
    }
  }, [handleSubmit, onChange]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    if (newValue.length <= INPUT_VALIDATION.MAX_LENGTH) {
      onChange(newValue);
    }
  }, [onChange]);

  const isSubmitDisabled = isLoading || isDisabled || !value.trim();

  return (
    <form 
      className="chat-input-form" 
      onSubmit={handleSubmit}
      aria-label="Message input form"
    >
      <div className="input-container">
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={isDisabled ? 'Chat unavailable' : placeholder}
          disabled={isLoading || isDisabled}
          rows={1}
          aria-label="Message input"
          aria-describedby="input-hint"
          autoComplete="off"
          spellCheck="true"
        />
        
        <SendButton 
          disabled={isSubmitDisabled} 
          isLoading={isLoading}
        />
      </div>
      
      <div id="input-hint" className="input-hint">
        <span className="hint-text">
          Press <kbd>Enter</kbd> to send, <kbd>Shift+Enter</kbd> for new line
        </span>
        {value.length > INPUT_VALIDATION.MAX_LENGTH * 0.8 && (
          <span className="character-count">
            {value.length}/{INPUT_VALIDATION.MAX_LENGTH}
          </span>
        )}
      </div>
    </form>
  );
});

ChatInput.displayName = 'ChatInput';

ChatInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  isDisabled: PropTypes.bool,
  placeholder: PropTypes.string,
  inputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
};

export default ChatInput;
